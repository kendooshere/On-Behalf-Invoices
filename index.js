require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const PizZip = require("pizzip");
const docxTemplater = require("docxtemplater");
const path = require("path");
const numToWords = require("number-to-words");
const { exec } = require("child_process");
const nodemailer = require("nodemailer");
const { stderr } = require("process");
const dayjs = require("dayjs");

const app = express();
app.use(cors());
app.use(express.json());

const formatDate = (date = new Date()) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function execAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
}

function sendEmailAsync(transporter, mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) reject(err);
      else resolve(info);
    });
  });
}

app.post("/generate-invoice", async (req, res) => {
  const { brandId, customersList, month, amount } = req.body;
  if (!brandId || !month || !amount || !customersList) {
    return res.status(400).json({ message: "Missing required fields!" });
  }

  try {
    const brands = await fs.readJSON("./data/brands.json");
    const currentBrand = brands.find((b) => b.brandId === brandId);
    if (!currentBrand) {
      return res.status(400).json({ message: "Brand not found!" });
    }
    const chosenCustomers = currentBrand.customers.filter((c) =>
      customersList.includes(c.id)
    );

    function monthToWord(month, format="MMM"){
      return dayjs(month).format(format);
    }

    const results = [];

    for (let customer of chosenCustomers) {
      try{
      const rentShareAmount = Math.ceil((customer.share * amount) / 100);

      const trackerPath = "./data/invoice_tracker.json";
      const tracker = await fs.readJson(trackerPath);
      const fiscalYear = "25-26";

      tracker[currentBrand.brandId] ??= {};
      tracker[currentBrand.brandId][fiscalYear] ??= 0;

      const lastNum =
        tracker[currentBrand.brandId]?.[fiscalYear] || 0;
      const nextNum = lastNum + 1;
      const billMonth = monthToWord(month);
      const invoiceDate = formatDate();
      const invoiceNumber = `${fiscalYear}/${String(nextNum).padStart(
        2,
        "0"
      )}/${billMonth}`;

      tracker[currentBrand.brandId] = {
        ...tracker[currentBrand.brandId],
        [fiscalYear]: nextNum,
      };
      await fs.writeJson(trackerPath, tracker, { spaces: 2 });

      const content = await fs.readFile(
        "./templates/on-behalf-invoice-template.docx",
        "binary"
      );
      const zip = new PizZip(content);
      const doc = new docxTemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const amountInWords =
        numToWords.toWords(rentShareAmount).toUpperCase() + " Only";

      const templateData = {
        invoice_no: invoiceNumber,
        date: invoiceDate,
        month: billMonth.toUpperCase(),
        amount: rentShareAmount,
        amountInWords: amountInWords,
        customer_name: customer.customer_name,
        customer_address: customer.customer_address,
        customer_email: customer.customer_email,
        customer_mob: customer.customer_mob,
        customer_pan: customer.customer_pan,
        customer_bank: customer.customer_bank,
        brand_name: currentBrand.brand_name,
        brand_unit: customer.unit,
        brand_floor: currentBrand.floor,
        brand_address: currentBrand.brand_address,
        brand_email: currentBrand.brand_email,
        brand_mob: currentBrand.brand_mob,
        brand_pan: currentBrand.brand_pan,
        brand_gst: currentBrand.brand_gst,
      };

      const missingPlaceholders = Object.keys(templateData).filter(
        (key) => !templateData[key]
      );
      if (missingPlaceholders.length > 0) {
        results.push({
          message: "Missing template data for the following fields:",
          missing_fields: missingPlaceholders,
        });
        continue;
      }

      doc.render(templateData);
      const buf = doc.getZip().generate({ type: "nodebuffer" });

      const outputDir = path.join(__dirname, "output");
      await fs.ensureDir(outputDir);

      const docxFilename = `Invoice-${customer.customer_name}-${billMonth}-${fiscalYear}.docx`;
      const outputPath = path.join(outputDir, docxFilename);

      await fs.writeFile(outputPath, buf);

      const pdfFilename = `Invoice-${customer.customer_name}-${billMonth}-${fiscalYear}.pdf`;
      const pdfOutputPath = path.join(outputDir, pdfFilename);

      await execAsync(
        `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf --outdir "${outputDir}" "${outputPath}"`
      );

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
        // to: "angadsinghsachdeva82166@gmail.com",
        subject: `KW Group | Invoice for ${billMonth} - ${customer.customer_name}`,
        text: `Dear ${customer.customer_name},\n\nPlease find attached the invoice for the month of ${billMonth}.\n\nInvoice Number: ${invoiceNumber}\nInvoice Date: ${invoiceDate}\nAmount: ₹${rentShareAmount}\n\nRegards,\nKW Group Leasing Team`,
        attachments: [
          {
            filename: pdfFilename,
            path: pdfOutputPath,
          },
        ],
      };

      await sendEmailAsync(transporter, mailOptions);

      results.push({ customer: customer.customer_name, status: "success" });
    } catch (err) {
    results.push({
      customer: customer.customer_name,
      status: "failed",
      error: err.message,
    });
  }
}
res.json({message: "Invoice generate completed", results});
} catch(err){
  console.error("Error in Invoice generation:", err);
  return res.status(500).json({
    message:"Internal server error",
    error: err.message,
  });
}
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
