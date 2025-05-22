import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import nodeMediaServer from 'node-media-server';
import { CreateStreamDto } from './dto/create-stream.dto'; // Pastikan DTO ini ada atau buat baru
import { v4 as uuidv4 } from 'uuid'; // Untuk generate streamId unik
import { spawn, ChildProcess } from 'child_process'; // Untuk menjalankan ffmpeg

/**
 * @interface IActiveStream
 * @description Interface untuk menyimpan informasi stream yang aktif.
 */
interface IActiveStream {
  id: string;
  process: ChildProcess;
  dto: CreateStreamDto;
}

/**
 * @class StreamingService
 * @description Service untuk logika bisnis terkait streaming video.
 */
@Injectable()
export class StreamingService implements OnModuleInit {
  private readonly _logger = new Logger(StreamingService.name);
  private _nms: nodeMediaServer;
  private readonly _activeStreams: Map<string, IActiveStream> = new Map();

  /**
   * @constructor
   */
  constructor() {
    // Konfigurasi NodeMediaServer dipindahkan ke onModuleInit
    // agar dijalankan setelah module diinisialisasi oleh NestJS
  }

  /**
   * @method onModuleInit
   * @description Lifecycle hook yang dipanggil setelah semua module diinisialisasi.
   *              Digunakan untuk setup NodeMediaServer.
   */
  onModuleInit() {
    this._setupNodeMediaServer();
  }

  /**
   * @private
   * @method _setupNodeMediaServer
   * @description Mengkonfigurasi dan menjalankan NodeMediaServer.
   */
  private _setupNodeMediaServer(): void {
    const config = {
      rtmp: {
        port: 1935, // Port default RTMP
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
      },
      http: {
        port: 8000, // Port untuk HTTP-FLV, dll.
        mediaroot: './media', // Direktori untuk menyimpan file media (jika ada fitur recording)
        allow_origin: '*', // Izinkan koneksi dari semua origin (sesuaikan untuk produksi)
      },
      // Anda bisa menambahkan konfigurasi transcodin ffmpeg di sini jika NMS yang melakukan transcode
      // transcoding: {
      //   ffmpeg: '/usr/bin/ffmpeg', // Sesuaikan path ke ffmpeg Anda
      //   tasks: [
      //     {
      //       app: 'live',
      //       hls: true,
      //       hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
      //       dash: true,
      //       dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
      //     }
      //   ]
      // }
    };

    this._nms = new nodeMediaServer(config);
    this._nms.run();

    this._nms.on('preConnect', (id, args) => {
      this._logger.log(
        `[NodeMediaServer] preConnect: id=${id} args=${JSON.stringify(args)}`,
      );
      // Anda bisa menambahkan logika otentikasi di sini, misalnya:
      // const session = this.nms.getSession(id);
      // if (!isValidToken(args.token)) { session.reject(); }
    });

    this._nms.on('postConnect', (id, args) => {
      this._logger.log(
        `[NodeMediaServer] postConnect: id=${id} args=${JSON.stringify(args)}`,
      );
    });

    this._nms.on('doneConnect', (id, args) => {
      this._logger.log(
        `[NodeMediaServer] doneConnect: id=${id} args=${JSON.stringify(args)}`,
      );
    });

    this._nms.on('prePublish', (id, streamPath, args) => {
      this._logger.log(
        `[NodeMediaServer] prePublish: id=${id} StreamPath=${streamPath} args=${JSON.stringify(args)}`,
      );
      // const session = this.nms.getSession(id);
      // if (streamPath === '/live/forbiddenStreamKey') { session.reject(); }
    });

    this._nms.on('postPublish', (id, streamPath, args) => {
      this._logger.log(
        `[NodeMediaServer] postPublish: id=${id} StreamPath=${streamPath} args=${JSON.stringify(args)}`,
      );
    });

    this._nms.on('donePublish', (id, streamPath, args) => {
      this._logger.log(
        `[NodeMediaServer] donePublish: id=${id} StreamPath=${streamPath} args=${JSON.stringify(args)}`,
      );
    });

    this._logger.log(
      'Node Media Server is running on RTMP port 1935 and HTTP port 8000.',
    );
  }

  /**
   * Memulai sesi streaming baru menggunakan ffmpeg untuk mengirim ke RTMP eksternal.
   * Jika Anda ingin NMS yang menerima stream, logika akan berbeda.
   * @param {CreateStreamDto} createStreamDto - Data untuk memulai stream.
   * @returns {Promise<any>} Informasi mengenai stream yang dimulai.
   */
  async startStream(createStreamDto: CreateStreamDto): Promise<any> {
    const streamId = uuidv4();
    const { videoSource, rtmpUrl, loop } = createStreamDto;

    // Contoh: ffmpeg -re -stream_loop -1 -i "input.mp4" -c:v libx264 -c:a aac -f flv rtmp://target/live
    const ffmpegArgs = [
      '-re', // Baca input pada native frame rate
    ];

    if (loop) {
      ffmpegArgs.push('-stream_loop', '-1'); // Loop input video tanpa batas
    }

    ffmpegArgs.push(
      '-i',
      videoSource, // Input file
      '-c:v',
      'copy', // Salin codec video (tanpa transcode, lebih ringan)
      '-c:a',
      'aac', // Transcode audio ke AAC (umumnya diperlukan untuk RTMP)
      '-ar',
      '44100', // Sample rate audio
      '-b:a',
      '128k', // Bitrate audio
      '-f',
      'flv', // Format output FLV untuk RTMP
      rtmpUrl, // URL RTMP tujuan
    );

    this._logger.log(
      `Starting ffmpeg for stream ${streamId} with args: ${ffmpegArgs.join(' ')}`,
    );

    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

    this._activeStreams.set(streamId, {
      id: streamId,
      process: ffmpegProcess,
      dto: createStreamDto,
    });

    ffmpegProcess.stdout.on('data', (data) => {
      this._logger.log(`[ffmpeg ${streamId} stdout]: ${data}`);
    });

    ffmpegProcess.stderr.on('data', (data) => {
      this._logger.error(`[ffmpeg ${streamId} stderr]: ${data}`);
      // Pertimbangkan untuk menghentikan stream atau memberi notifikasi jika ada error signifikan
    });

    ffmpegProcess.on('close', (code) => {
      this._logger.log(`[ffmpeg ${streamId}] process exited with code ${code}`);
      this._activeStreams.delete(streamId);
      // Tambahkan logika notifikasi atau cleanup jika perlu
    });

    ffmpegProcess.on('error', (err) => {
      this._logger.error(
        `[ffmpeg ${streamId}] Failed to start subprocess: ${err.message}`,
      );
      this._activeStreams.delete(streamId);
      // Handle error, mungkin stream gagal dimulai
      throw new Error(
        `Failed to start ffmpeg for stream ${streamId}: ${err.message}`,
      );
    });

    return {
      message: 'Stream starting process initiated.',
      streamId,
      rtmpInputUrl: `rtmp://localhost:1935/live/${streamId}`, // Jika NMS digunakan sebagai input
    };
  }

  /**
   * Menghentikan sesi streaming.
   * @param {string} streamId - ID dari stream yang akan dihentikan.
   * @returns {Promise<any>} Informasi mengenai stream yang dihentikan.
   */
  async stopStream(streamId: string): Promise<any> {
    this._logger.log(`Attempting to stop stream: ${streamId}`);
    const streamData = this._activeStreams.get(streamId);

    if (streamData) {
      streamData.process.kill('SIGKILL'); // Kirim sinyal untuk menghentikan proses ffmpeg
      this._activeStreams.delete(streamId);
      this._logger.log(`Stream ${streamId} stopped.`);
      return {
        message: 'Stream stopping process initiated and stopped.',
        streamId,
      };
    } else {
      this._logger.warn(`Stream ${streamId} not found or already stopped.`);
      return { message: 'Stream not found or already stopped.', streamId };
    }
  }

  /**
   * Mendapatkan status sesi streaming.
   * @param {string} streamId - ID dari stream.
   * @returns {Promise<any>} Status stream.
   */
  async getStreamStatus(streamId: string): Promise<any> {
    this._logger.log(`Getting status for stream: ${streamId}`);
    const streamData = this._activeStreams.get(streamId);

    if (streamData) {
      // Cek apakah proses masih berjalan (mungkin perlu cara yang lebih robust)
      const isRunning = !streamData.process.killed;
      return {
        message: 'Stream status.',
        streamId,
        status: isRunning ? 'RUNNING' : 'STOPPED',
        details: streamData.dto,
      };
    } else {
      return { message: 'Stream not found.', streamId, status: 'NOT_FOUND' };
    }
  }

  /**
   * Mendapatkan semua stream yang aktif.
   * @returns {Promise<any[]>} Daftar stream yang aktif.
   */
  async getAllActiveStreams(): Promise<any[]> {
    const streams = [];
    for (const [key, value] of this._activeStreams.entries()) {
      streams.push({
        streamId: key,
        status: !value.process.killed ? 'RUNNING' : 'STOPPED',
        details: value.dto,
      });
    }
    return streams;
  }
}
