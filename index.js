require("dotenv").config();
const express = require("express");
const fs = require("fs-extra");
const PizZip = require("pizzip");
const docxTemplater = require("docxtemplater");
const path = require("path");
const numToWords = require("number-to-words");
const { exec } = require("child_process");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

const formatDate = (date = new Date()) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

app.post("/generate-invoice", async (req, res) => {
  const { customerId, month, amount } = req.body;
  if (!customerId || !month || !amount) {
    return res.status(400).json({ message: "Missing required fields!" });
  }

  try {
    const customers = await fs.readJSON("./data/customers.json");
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) {
      return res.status(400).json({ message: "Customer not found!" });
    }

    const trackerPath = "./data/invoice_tracker.json";
    const tracker = await fs.readJson(trackerPath);
    const fiscalYear = "25-26";

    const lastNum = tracker[customerId]?.[fiscalYear] || 0;
    const nextNum = lastNum + 1;
    const billMonth = month;
    const invoiceDate = formatDate();
    const invoiceNumber = `${fiscalYear}/${String(nextNum).padStart(2, "0")}/${billMonth}`;

    tracker[customerId] = {
      ...tracker[customerId],
      [fiscalYear]: nextNum,
    };
    await fs.writeJson(trackerPath, tracker, { spaces: 2 });

    const content = await fs.readFile("./templates/on-behalf-invoice-template.docx", "binary");
    const zip = new PizZip(content);
    const doc = new docxTemplater(zip, { paragraphLoop: true, linebreaks: true });

    const amountInWords = numToWords.toWords(amount).toUpperCase() + " Only";

    const templateData = {
      invoice_no: invoiceNumber,
      date: invoiceDate,
      month: month.toUpperCase(),
      amount: amount,
      amountInWords: amountInWords,
      customer_name: customer.customer_name,
      customer_address: customer.customer_address,
      customer_email: customer.customer_email,
      customer_mob: customer.customer_mob,
      customer_pan: customer.customer_pan,
      customer_bank: customer.customer_bank,
      brand_name: customer.brand_name,
      brand_unit: customer.unit,
      brand_floor: customer.floor,
      brand_address: customer.brand_address,
      brand_email: customer.brand_email,
      brand_mob: customer.brand_mob,
      brand_pan: customer.brand_pan,
      brand_gst: customer.brand_gst,
    };

    const missingPlaceholders = Object.keys(templateData).filter(
      (key) => !templateData[key]
    );
    if (missingPlaceholders.length > 0) {
      return res.status(400).json({
        message: "Missing template data for the following fields:",
        missing_fields: missingPlaceholders,
      });
    }

    doc.render(templateData);
    const buf = doc.getZip().generate({ type: "nodebuffer" });

    const outputDir = path.join(__dirname, "output");
    await fs.ensureDir(outputDir);

    const docxFilename = `Invoice-${customer.customer_name}-${month}-${fiscalYear}.docx`;
    const outputPath = path.join(outputDir, docxFilename);

    await fs.writeFile(outputPath, buf);

    const pdfFilename = `Invoice-${customer.customer_name}-${month}-${fiscalYear}.pdf`;
    const pdfOutputPath = path.join(outputDir, pdfFilename);

    exec(`"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf --outdir "${outputDir}" "${outputPath}"`, async (err, stdout, stderr) => {
      if (err) {
        console.error("PDF conversion Failed!", err);
        return res.status(500).json({ message: "PDF conversion failed", error: err });
      }

      console.log("PDF conversion done!");

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER1,
          pass: process.env.EMAIL_PASSWORD1,
        },
      }); 

      const mailOptions = {
        from: `"Angad Singh" <${process.env.EMAIL_USER1}>`,
        to: customer.customer_email,
        subject: `KW Group | Invoice for ${month} - ${customer.customer_name}`,
        text: `Dear ${customer.customer_name},\n\nPlease find attached the invoice for the month of ${month}.\n\nInvoice Number: ${invoiceNumber}\nInvoice Date: ${invoiceDate}\nAmount: ₹${amount}\n\nRegards,\nKW Group Leasing Team`,
        attachments: [
          {
            filename: pdfFilename,
            path: pdfOutputPath,
          },
        ],
      };

      transporter.sendMail(mailOptions, (emailErr, info) => {
        if (emailErr) {
          console.error("Email sending failed!", emailErr);
          return res.status(500).json({ message: "Invoice created but email failed", error: emailErr });
        }

        console.log("Email sent successfully!");
        return res.json({
          message: "Invoice generated and emailed successfully",
          invoice_number: invoiceNumber,
          pdf_path: pdfOutputPath,
        });
      });
    });

  } catch (err) {
    console.error("Error in invoice generation:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
