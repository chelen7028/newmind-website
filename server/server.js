const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const CSV_FILE = path.join(__dirname, '..', 'data', 'applications.csv');

// Initialize CSV writer (with append mode)
const csvWriter = createCsvWriter({
  path: CSV_FILE,
  header: [
    { id: 'name', title: 'Name' },
    { id: 'email', title: 'Email' },
    { id: 'phone', title: 'Phone' },
    { id: 'date', title: 'Date' }
  ],
  append: fs.existsSync(CSV_FILE) // Append if file exists
});

app.post('/apply', async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).send('All fields are required');
  }

  try {
    await csvWriter.writeRecords([
      {
        name,
        email,
        phone,
        date: new Date().toLocaleString()
      }
    ]);

    res.redirect('/thankyou.html');
  } catch (err) {
    console.error('Error writing CSV:', err);
    res.status(500).send('Failed to save application.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
