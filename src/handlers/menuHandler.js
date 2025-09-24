class MenuHandler {
    constructor() {
        this.userSessions = new Map();
    }

    async handleMenuFlow(messageText, sender, sock, googleSheets) {
        const session = this.getUserSession(sender);
        const choice = messageText.trim();

        switch (session.step) {
            case 'main_menu':
                await this.handleMainMenu(choice, sender, sock, session);
                break;
            case 'kk_selection':
                await this.handleKKProcess(choice, sender, sock, session, googleSheets);
                break;
            case 'ktp_selection':
                await this.handleKTPProcess(choice, sender, sock, session, googleSheets);
                break;
            case 'pindah_selection':
                await this.handlePindahProcess(choice, sender, sock, session, googleSheets);
                break;
            case 'pengaduan_selection':
                await this.handlePengaduanProcess(choice, sender, sock, session, googleSheets);
                break;
            default:
                await this.showMainMenu(sender, sock, session);
        }
    }

    getUserSession(sender) {
        if (!this.userSessions.has(sender)) {
            this.userSessions.set(sender, {
                step: 'main_menu',
                data: {}
            });
        }
        return this.userSessions.get(sender);
    }

    async showMainMenu(sender, sock, session) {
        session.step = 'main_menu';
        const menuText = `🛠️ *SAPA TOMO BOT* 🛠️

Silakan pilih layanan yang Anda butuhkan:

1. 📄 Pembuatan KK
2. 🆔 Pembuatan KTP  
3. 🚚 Pengajuan Pindah
4. 📢 Pengaduan
5. 📊 Status Pengajuan
6. ℹ️ Bantuan

*Balas dengan angka 1-6*`;

        await sock.sendMessage(sender, { text: menuText });
    }

    async handleMainMenu(choice, sender, sock, session) {
        switch (choice) {
            case '1':
                await this.startKKProcess(sender, sock, session);
                break;
            case '2':
                await this.startKTPProcess(sender, sock, session);
                break;
            case '3':
                await this.startPindahProcess(sender, sock, session);
                break;
            case '4':
                await this.startPengaduanProcess(sender, sock, session);
                break;
            case '5':
                await this.checkStatus(sender, sock, session);
                break;
            case '6':
                await this.showHelp(sender, sock, session);
                break;
            default:
                await sock.sendMessage(sender, {
                    text: 'Pilihan tidak valid. Silakan balas dengan angka 1-6.'
                });
        }
    }

    async startKKProcess(sender, sock, session) {
        session.step = 'kk_selection';
        const kkInfo = `📄 *PEMBUATAN KARTU KELUARGA (KK)*

*Persyaratan:*
- Fotokopi KTP suami dan istri
- Fotokopi Akta Nikah/Akta Cerai
- Surat keterangan pindah (jika ada)
- Fotokopi KK lama

*Proses:*
1. Isi formulir permohonan
2. Lengkapi persyaratan
3. Verifikasi oleh petugas
4. Pengambilan KK baru

Apakah Anda ingin melanjutkan pengajuan?
Balas *YA* untuk melanjutkan atau *BATAL* untuk kembali ke menu.`;

        await sock.sendMessage(sender, { text: kkInfo });
    }

    async handleKKProcess(choice, sender, sock, session, googleSheets) {
        if (choice.toLowerCase() === 'ya') {
            // Save to Google Sheets and continue with the process
            await this.saveToSheet(sender, 'KK', 'Menunggu persyaratan', googleSheets);
            
            await sock.sendMessage(sender, {
                text: `✅ *Pengajuan KK Berhasil Dicatat*

Nomor Pengajuan: KK-${Date.now()}
Status: Menunggu persyaratan

Silakan datang ke kantor dengan membawa persyaratan yang diminta. Terima kasih!`
            });
            
            session.step = 'main_menu';
            await this.showMainMenu(sender, sock, session);
        } else if (choice.toLowerCase() === 'batal') {
            session.step = 'main_menu';
            await this.showMainMenu(sender, sock, session);
        } else {
            await sock.sendMessage(sender, {
                text: 'Balas *YA* untuk melanjutkan atau *BATAL* untuk membatalkan.'
            });
        }
    }

    // Similar methods for KTP, Pindah, and Pengaduan processes...

    async saveToSheet(sender, service, status, googleSheets) {
        try {
            const timestamp = new Date().toISOString();
            const phoneNumber = sender.replace('@s.whatsapp.net', '');
            const requestId = `${service}-${Date.now()}`;

            const row = [
                timestamp,
                requestId,
                phoneNumber,
                service,
                status,
                'Menunggu verifikasi'
            ];

            await googleSheets.appendRow(row);
            return requestId;
        } catch (error) {
            console.error('Error saving to sheet:', error);
            throw error;
        }
    }
}

export default new MenuHandler();
