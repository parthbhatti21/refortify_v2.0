"""
Backend endpoint example for Google Sheets integration using credentials.json
This is a Python Flask example - adapt to your backend framework
"""

from flask import Flask, request, jsonify
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os

app = Flask(__name__)

# Google Sheets API setup
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
CREDENTIALS_FILE = 'credentials.json'  # Place your credentials.json in the backend root

# Load credentials
try:
    credentials = service_account.Credentials.from_service_account_file(
        CREDENTIALS_FILE, scopes=SCOPES
    )
    service = build('sheets', 'v4', credentials=credentials)
    print(f"✓ Google Sheets service initialized with service account: {credentials.service_account_email}")
except Exception as e:
    print(f"✗ Failed to load credentials: {e}")
    service = None

@app.route('/google-sheets', methods=['GET'])
def get_google_sheet():
    """
    Endpoint to fetch Google Sheet data
    Query parameters:
    - sheetId: The Google Sheet ID (required)
    - range: The range to fetch (default: 'Sheet1!A:C')
    """
    if not service:
        return jsonify({'error': 'Google Sheets service not initialized'}), 500
    
    sheet_id = request.args.get('sheetId')
    range_name = request.args.get('range', 'Sheet1!A:C')
    
    if not sheet_id:
        return jsonify({'error': 'sheetId parameter is required'}), 400
    
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=sheet_id,
            range=range_name
        ).execute()
        
        values = result.get('values', [])
        return jsonify({'values': values})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Make sure credentials.json exists
    if not os.path.exists(CREDENTIALS_FILE):
        print(f"⚠ Warning: {CREDENTIALS_FILE} not found!")
        print("Please place your Google service account credentials.json in the backend root directory.")
    
    app.run(debug=True, port=8000)

