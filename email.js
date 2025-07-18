const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER1,
    pass: process.env.EMAIL_PASSWORD1,
  },
});

const mailOptions = {
  from: "angadsingh1804@gmail.com",
  to: "angadsinghsachdeva82166@gmail.com",
  subject: "Test Email",
  text: "This is just a test email from Nodemailer + App Password setup.",
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) return console.error("Email failed:", err);
  console.log("Email sent:", info.response);
});