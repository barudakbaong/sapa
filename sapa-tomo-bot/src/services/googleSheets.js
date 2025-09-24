import { google } from 'googleapis';

class GoogleSheetsService {
    constructor() {
        this.auth = null;
        this.sheets = null;
        this.spreadsheetId = null;
    }

    async initialize() {
        try {
            const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
            this.spreadsheetId = process.env.SPREADSHEET_ID;

            this.auth = new google.auth.GoogleAuth({
                credentials: credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });

            this.sheets = google.sheets({ version: 'v4', auth: this.auth });

            // Initialize sheet if not exists
            await this.initializeSheet();
            
            console.log('Google Sheets service initialized');
        } catch (error) {
            console.error('Error initializing Google Sheets:', error);
            throw error;
        }
    }

    async initializeSheet() {
        try {
            const sheetName = 'Requests';
            const request = {
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: sheetName
                            }
                        }
                    }]
                }
            };

            await this.sheets.spreadsheets.batchUpdate(request);

            // Add headers
            const headers = [
                'Timestamp', 'RequestID', 'PhoneNumber', 'Service', 
                'Status', 'Notes', 'AdminNotes', 'CompletionDate'
            ];

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A1:H1`,
                valueInputOption: 'RAW',
                resource: { values: [headers] }
            });
        } catch (error) {
            // Sheet might already exist, ignore error
            console.log('Sheet might already exist:', error.message);
        }
    }

    async appendRow(rowData) {
        try {
            const response = await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Requests!A:H',
                valueInputOption: 'RAW',
                resource: { values: [rowData] }
            });

            return response.data;
        } catch (error) {
            console.error('Error appending row:', error);
            throw error;
        }
    }

    async getRequestsByPhone(phoneNumber) {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: 'Requests!A:H'
            });

            const rows = response.data.values;
            if (!rows) return [];

            return rows.filter(row => row[2] === phoneNumber);
        } catch (error) {
            console.error('Error getting requests:', error);
            throw error;
        }
    }
}

export async function initializeGoogleSheets() {
    const service = new GoogleSheetsService();
    await service.initialize();
    return service;
}
