require("dotenv").config();
const express = require("express");
const fs = require("fs-extra");
const PizZip = require("pizzip");
const docxTemplater = require("docxtemplater");
const path = require("path");
const numToWords = require("number-to-words");
const { exec } = require("child_process");
const nodemailer = require("nodemailer");
const { constrainedMemory } = require("process");

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
  console.log(req.body);

  if (!customerId || !month || !amount) {
    return res.status(400).json({ message: "Missing required fields!" });
  }

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

  // Validate template data
  const missingPlaceholders = Object.keys(templateData).filter(
    (key) => !templateData[key]
  );
  if (missingPlaceholders.length > 0) {
    return res.status(400).json({
      message: "Missing template data for the following fields:",
      missing_fields: missingPlaceholders,
    });
  }

  try {
    doc.render(templateData);
  } catch (err) {
    return res.status(500).json({ error: "Template rendering failed!", details: err });
  }

  const buf = doc.getZip().generate({ type: "nodebuffer" });
  const outputDir = path.join(__dirname, "output");
  await fs.ensureDir(outputDir);
  const filename = `Invoice-${customer.customer_name}-${month}-${fiscalYear}.docx`;
  const outputPath = path.join(outputDir, filename);

  try {
    await fs.writeFile(outputPath, buf);

    const pdfFilename = `Invoice-${customer.customer_name}-${month}-${fiscalYear}.pdf`;
    const pdfOutputPath = path.join(outputDir, pdfFilename);

    // Use exec to convert DOCX to PDF, but wait for conversion to finish before sending the response
    exec(`"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf --outdir "${outputDir}" "${outputPath}"`, (err, stdout, stderr) => {
      if (err) {
        console.log("PDF conversion Failed!");
        return res.status(500).json({ message: "PDF Conversion did not take place...", error: err });
      }

      console.log("PDF conversion Done!");

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth:{
        user: process.env.EMAIL_USER1,
        pass: process.env.EMAIL_PASS1
      },
    });

const mailOptions = {
  from : `'Angad Singh' <${process.env.EMAIL_USER1}>`,
  to : customer.customer_email,
  subject: `Invoice Bitch`,
  text: `hellp find this bitch`,
  attachments : [
    {
      filename : path.basename(pdfOutputPath),
      path : pdfOutputPath,
    },
  ]
};

transporter.sendMail(mailOptions, (emailErr, info)=> {
  if(emailErr){
    console.log("Couldn't send the invoice and the mail!", emailErr);
    return res.status(500).json({message:"Invoice created but could not send the invoice Email.", error: emailErr});
  }
  console.log("Email sent!");
  return res.json({
    message: "Email with invoice pdf has been sent!",
  invoice_number: invoiceNumber,
  pdf_path : pdfOutputPath
  });
});


} catch (err) {
    console.error("Error writing file:", err);
    return res.status(500).json({
      message: "Failed to save the invoice",
      details: err.message,
      file_path: outputPath,
    });
  }
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
