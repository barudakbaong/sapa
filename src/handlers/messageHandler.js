import menuHandler from './menuHandler.js';

class MessageHandler {
    async handleMessage(message, sock, googleSheets) {
        try {
            const messageText = this.extractMessageText(message);
            const sender = message.key.remoteJid;
            
            if (!messageText) return;

            // Check if message is a command
            if (messageText.startsWith('!')) {
                await this.handleCommand(messageText, sender, sock, googleSheets);
            } else {
                // Handle regular menu flow
                await menuHandler.handleMenuFlow(messageText, sender, sock, googleSheets);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: 'Maaf, terjadi kesalahan sistem. Silakan coba lagi.'
            });
        }
    }

    extractMessageText(message) {
        if (message.message?.conversation) {
            return message.message.conversation;
        }
        if (message.message?.extendedTextMessage?.text) {
            return message.message.extendedTextMessage.text;
        }
        return null;
    }

    async handleCommand(command, sender, sock, googleSheets) {
        const commands = {
            '!menu': () => this.showMainMenu(sender, sock),
            '!help': () => this.showHelp(sender, sock),
            '!status': () => this.checkStatus(sender, sock, googleSheets),
            '!admin': () => this.adminCommands(command, sender, sock, googleSheets)
        };

        const cmd = command.split(' ')[0].toLowerCase();
        if (commands[cmd]) {
            await commands[cmd]();
        }
    }

    async showMainMenu(sender, sock) {
        const menuText = `🛠️ *SAPA TOMO BOT* 🛠️

Silakan pilih layanan yang Anda butuhkan:

1. 📄 *Pembuatan KK*
   - Persyaratan dan proses pembuatan KK

2. 🆔 *Pembuatan KTP*
   - Persyaratan dan proses pembuatan KTP

3. 🚚 *Pengajuan Pindah*
   - Proses pengajuan pindah domisili

4. 📢 *Pengaduan*
   - Layanan pengaduan masyarakat

5. ℹ️ *Status Pengajuan*
   - Cek status pengajuan terbaru

6. 🏠 *Menu Utama*
   - Kembali ke menu utama

*Balas dengan angka sesuai layanan yang diinginkan*`;

        await sock.sendMessage(sender, { text: menuText });
    }

    async showHelp(sender, sock) {
        const helpText = `📖 *BANTUAN SAPA TOMO BOT*

*Perintah yang tersedia:*
!menu - Menampilkan menu utama
!help - Menampilkan bantuan ini
!status - Cek status pengajuan

*Cara penggunaan:*
1. Ketik !menu untuk melihat layanan
2. Balas dengan angka pilihan layanan
3. Ikuti instruksi yang diberikan

Untuk bantuan lebih lanjut, hubungi admin.`;

        await sock.sendMessage(sender, { text: helpText });
    }

    async checkStatus(sender, sock, googleSheets) {
        // Implementation for status checking
        await sock.sendMessage(sender, {
            text: 'Fitur cek status sedang dalam pengembangan.'
        });
    }

    async adminCommands(command, sender, sock, googleSheets) {
        // Implementation for admin commands
        // This would include features like viewing statistics, managing requests, etc.
    }
}

export default new MessageHandler();
