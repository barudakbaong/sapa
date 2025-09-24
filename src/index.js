import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import messageHandler from './handlers/messageHandler.js';
import { initializeGoogleSheets } from './services/googleSheets.js';

class SAPATomoBot {
    constructor() {
        this.sock = null;
        this.googleSheets = null;
        this.init();
    }

    async init() {
        try {
            // Initialize Google Sheets
            this.googleSheets = await initializeGoogleSheets();
            console.log('Google Sheets initialized');

            // Initialize WhatsApp
            await this.initWhatsApp();
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    async initWhatsApp() {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');

        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: console
        });

        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                qrcode.generate(qr, { small: true });
                console.log('Scan QR code above to connect WhatsApp');
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('Connection closed due to:', lastDisconnect.error, ', reconnecting:', shouldReconnect);
                
                if (shouldReconnect) {
                    this.initWhatsApp();
                }
            } else if (connection === 'open') {
                console.log('WhatsApp connected successfully');
            }
        });

        this.sock.ev.on('creds.update', saveCreds);

        // Handle messages
        this.sock.ev.on('messages.upsert', async (m) => {
            const message = m.messages[0];
            if (!message.key.fromMe && message.message) {
                await messageHandler.handleMessage(message, this.sock, this.googleSheets);
            }
        });
    }
}

// Start the bot
new SAPATomoBot();
