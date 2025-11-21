/**
 * Backend endpoint example for Google Sheets integration using credentials.json
 * This is a Node.js Express example - adapt to your backend framework
 */

const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();

// Google Sheets API setup
const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
let auth = null;
let sheets = null;

// Load credentials
try {
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    console.warn(`⚠ Warning: ${CREDENTIALS_FILE} not found!`);
    console.warn('Please place your Google service account credentials.json in the backend root directory.');
  } else {
    const credentials = require(CREDENTIALS_FILE);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    sheets = google.sheets({ version: 'v4', auth });
    console.log(`✓ Google Sheets service initialized with service account: ${credentials.client_email}`);
  }
} catch (error) {
  console.error(`✗ Failed to load credentials: ${error.message}`);
}

app.get('/google-sheets', async (req, res) => {
  /**
   * Endpoint to fetch Google Sheet data
   * Query parameters:
   * - sheetId: The Google Sheet ID (required)
   * - range: The range to fetch (default: 'Sheet1!A:C')
   */
  if (!sheets) {
    return res.status(500).json({ error: 'Google Sheets service not initialized' });
  }

  const { sheetId, range = 'Sheet1!A:C' } = req.query;

  if (!sheetId) {
    return res.status(400).json({ error: 'sheetId parameter is required' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const values = response.data.values || [];
    res.json({ values });
  } catch (error) {
    console.error('Error fetching Google Sheet:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!auth) {
    console.log('⚠ Google Sheets integration will not work until credentials.json is provided.');
  }
});

