require("dotenv").config();
const express = require("express");
const fs = require("fs-extra");
const PizZip = require("pizzip");
const docxTemplater = require("docxtemplater");
const path = require("path");
const numToWords = require("number-to-words");

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

  const invoiceNumber = `${fiscalYear}/${String(nextNum).padStart(2, "0")}/${month}`;
  const invoiceDate = formatDate();

  tracker[customerId] = {
    ...tracker[customerId],
    [fiscalYear]: nextNum,
  };
  await fs.writeJson(trackerPath, tracker, { spaces: 2 });

  const content = await fs.readFile(
    "./templates/on-behalf-invoice-template.docx",
    "binary"
  );
  const zip = new PizZip(content);
  const doc = new docxTemplater(zip, { paragraphLoop: true, linebreaks: true });

  const templateData = {
    invoice_no: invoiceNumber,
    date: invoiceDate,
    month: month,
    amount: amount,
    customer_name: customer.customer_name,
    customer_address: customer.customer_address,
    customer_email: customer.customer_email,
    customer_mob: customer.customer_mob,
    customer_pan: customer.customer_pan,
    customer_bank: customer.customer_bank,
    brand_name: customer.brand_name,
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
    return res.json({
      message: "Invoice generated successfully",
      invoice_number: invoiceNumber,
      output_path: outputPath,
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
