import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode'; // Atau qrcode-terminal untuk console

@Injectable()
export class WhatsappService implements OnModuleInit {
  private readonly _logger = new Logger(WhatsappService.name);
  private _client: Client;
  private _qrCodeDataUrl: string | null = null;
  private _isClientReady = false;
  private _connectedPhoneNumber: string | null = null; // Tambahkan ini

  constructor() {
    this._client = new Client({
      authStrategy: new LocalAuth({ dataPath: 'whatsapp-sessions' }), // Menyimpan sesi
      puppeteer: {
        headless: true, // Jalankan headless
        // Jika berjalan di environment tanpa GUI (seperti Docker), Anda mungkin perlu args tambahan:
        // args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });
  }

  async onModuleInit() {
    this._initializeClient();
  }

  private _initializeClient(): void {
    this._client.on('qr', async (qr) => {
      this._logger.log('QR Code Received, please scan!');
      this._qrCodeDataUrl = await qrcode.toDataURL(qr);
      this._isClientReady = false;
      this._connectedPhoneNumber = null; // Pastikan null saat QR muncul
    });

    this._client.on('ready', () => {
      this._logger.log('WhatsApp Client is ready!');
      this._isClientReady = true;
      this._qrCodeDataUrl = null;
      if (this._client.info) {
        this._connectedPhoneNumber = this._client.info.wid.user;
        this._logger.log(`Connected as: ${this._connectedPhoneNumber}`);
      }
    });

    this._client.on('message', async (message: Message) => {
      this._logger.log(`Message received: ${message.body}`);
      // Logika bot Anda di sini
      if (message.body === '!ping') {
        await message.reply('pong');
      }
    });

    this._client.on('disconnected', (reason) => {
      this._logger.warn(`WhatsApp Client was logged out: ${reason}`);
      this._isClientReady = false;
      this._qrCodeDataUrl = null; // Bisa jadi perlu QR baru
      this._connectedPhoneNumber = null; // Hapus nomor saat disconnect
    });

    this._client.initialize().catch((err) => {
      this._logger.error('Failed to initialize WhatsApp Client:', err);
    });
  }

  /**
   * Mengembalikan data URL dari QR code untuk di-scan.
   * @returns Data URL QR code atau null jika klien sudah ready atau belum ada QR.
   */
  getQrCodeDataUrl(): string | null {
    return this._qrCodeDataUrl;
  }

  /**
   * Mengecek apakah klien WhatsApp sudah siap.
   * @returns True jika siap, false jika tidak.
   */
  isReady(): boolean {
    return this._isClientReady;
  }

  /**
   * Mengembalikan status koneksi WhatsApp.
   * @returns Objek yang berisi status kesiapan dan nomor telepon yang terhubung (jika ada).
   */
  getConnectionStatus(): {
    isReady: boolean;
    qrCodeUrl: string | null;
    connectedNumber: string | null;
  } {
    return {
      isReady: this._isClientReady,
      qrCodeUrl: this._qrCodeDataUrl, // Sertakan QR code jika belum ready
      connectedNumber: this._connectedPhoneNumber,
    };
  }

  /**
   * Mengirim pesan WhatsApp.
   * @param to Nomor tujuan (misal: '6281234567890@c.us')
   * @param message Isi pesan
   */
  async sendMessage(to: string, message: string): Promise<Message | null> {
    if (!this._isClientReady) {
      // Perbaikan: Menggunakan underscore
      this._logger.warn('Client is not ready. Cannot send message.'); // Perbaikan: Menggunakan underscore
      throw new Error('WhatsApp client is not ready.');
    }
    try {
      const chatId = to.endsWith('@c.us') ? to : `${to}@c.us`;
      const sentMessage = await this._client.sendMessage(chatId, message); // Perbaikan: Menggunakan underscore
      this._logger.log(`Message sent to ${to}: ${message}`); // Perbaikan: Menggunakan underscore
      return sentMessage;
    } catch (error) {
      this._logger.error(`Failed to send message to ${to}:`, error); // Perbaikan: Menggunakan underscore
      throw error;
    }
  }

  // Tambahkan metode lain sesuai kebutuhan (misal: get contacts, get chats, dll.)
}
