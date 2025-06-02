require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'docs')));

const CSV_FILE = path.join(__dirname, '..', 'data', 'applications.csv');

const csvWriter = createCsvWriter({
  path: CSV_FILE,
  header: [
    { id: 'name', title: 'Name' },
    { id: 'email', title: 'Email' },
    { id: 'phone', title: 'Phone' },
    { id: 'date', title: 'Date' }
  ],
  append: fs.existsSync(CSV_FILE)
});

// Configure Nodemailer transporter
// Example with Gmail SMTP (you need to enable "less secure apps" or use App Passwords)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

app.post('/apply', async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).send('All fields are required');
  }

  try {
    // Save to CSV
    await csvWriter.writeRecords([
      {
        name,
        email,
        phone,
        date: new Date().toLocaleString()
      }
    ]);

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // You can change to any recipient email
      subject: 'New Application Received',
      text: `You received a new application:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`
    };

    await transporter.sendMail(mailOptions);

    res.redirect('/thankyou.html');
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Failed to process application.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
