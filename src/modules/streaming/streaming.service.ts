import { Injectable, Logger, OnModuleInit } from '@nestjs/common'; // Removed Inject
import { ConfigService } from '@nestjs/config';
import nodeMediaServer from 'node-media-server';
import { CreateStreamDto, EVideoSourceType } from './dto/create-stream.dto'; // Update import
import * as fs from 'fs'; // Import fs untuk cek file
import { NotFoundException } from '@nestjs/common'; // Import NotFoundException
import { v4 as uuidv4 } from 'uuid';
import { spawn, ChildProcess } from 'child_process';
import { IStreamingConfig } from '../../config/streaming.config'; // Removed streamingConfiguration default import

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
  private readonly _streamingConfig: IStreamingConfig;

  /**
   * @constructor
   * @param _configService - Service untuk mengakses variabel konfigurasi.
   */
  constructor(private readonly _configService: ConfigService) {
    this._streamingConfig =
      this._configService.get<IStreamingConfig>('streaming');
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
        port: this._streamingConfig.rtmpPort, // Gunakan dari config
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
      },
      http: {
        port: this._streamingConfig.httpPort, // Gunakan dari config
        mediaroot: this._streamingConfig.mediaRoot, // Gunakan dari config
        allow_origin: this._streamingConfig.allowOrigin, // Gunakan dari config
      },
      // transcoding: {
      //   ffmpeg: this._streamingConfig.ffmpegPath, // Gunakan dari config jika NMS yang transcode
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
      `Node Media Server is running on RTMP port ${this._streamingConfig.rtmpPort} and HTTP port ${this._streamingConfig.httpPort}.`,
    );
  }

  /**
   * Memulai sesi streaming baru menggunakan ffmpeg untuk mengirim ke RTMP eksternal.
   * @param {CreateStreamDto} createStreamDto - Data untuk memulai stream.
   * @returns {Promise<any>} Informasi mengenai stream yang dimulai.
   */
  async startStream(createStreamDto: CreateStreamDto): Promise<any> {
    const streamId = uuidv4();
    const { videoSource, rtmpUrl, loop, sourceType } = createStreamDto;

    const ffmpegArgs = [
      '-re', // Baca input pada native frame rate
    ];

    // Penanganan berdasarkan sourceType
    if (sourceType === EVideoSourceType.FILE) {
      if (!fs.existsSync(videoSource)) {
        this._logger.error(
          `Video source file not found: ${videoSource} for stream ${streamId}`,
        );
        throw new NotFoundException(
          `Video source file not found: ${videoSource}`,
        );
      }
      if (loop) {
        ffmpegArgs.push('-stream_loop', '-1'); // Loop input video tanpa batas
      }
      ffmpegArgs.push('-i', videoSource); // Input file
    } else if (sourceType === EVideoSourceType.URL) {
      // Untuk URL, FFmpeg akan menangani loop jika stream sumber mendukungnya atau jika kita menambahkan opsi spesifik
      // Opsi -stream_loop mungkin tidak selalu berfungsi dengan input URL tergantung sumbernya.
      // Jika loop diperlukan untuk URL, mungkin perlu pendekatan berbeda atau memastikan sumber URL mendukung loop.
      if (loop) {
        this._logger.warn(
          `Looping for URL source (${videoSource}) might depend on the source itself or require specific ffmpeg flags not universally applicable with -stream_loop.`,
        );
        // Pertimbangkan untuk tidak menambahkan -stream_loop untuk URL secara default atau cari flag yang lebih cocok
        // ffmpegArgs.push('-stream_loop', '-1'); // Contoh, tapi mungkin tidak efektif
      }
      ffmpegArgs.push('-i', videoSource); // Input URL
    } else {
      // Should not happen if DTO validation is correct
      throw new Error(`Unsupported source type: ${sourceType}`);
    }

    ffmpegArgs.push(
      // Opsi transcoding (sesuaikan jika perlu)
      // Saat ini menggunakan 'copy' untuk video jika memungkinkan, yang lebih ringan.
      // Jika sumber URL adalah stream HLS/DASH, FFmpeg akan menanganinya.
      '-c:v',
      'libx264', // Atau 'copy' jika Anda yakin sumbernya kompatibel & tidak butuh transcode video
      '-preset',
      'veryfast',
      '-tune',
      'zerolatency',
      '-c:a',
      'aac',
      '-ar',
      '44100',
      '-b:a',
      '128k',
      '-f',
      'flv',
      rtmpUrl,
    );

    this._logger.log(
      `Starting ffmpeg for stream ${streamId} (type: ${sourceType}) with args: ${ffmpegArgs.join(' ')}`,
    );

    const ffmpegPath = this._streamingConfig.ffmpegPath || 'ffmpeg'; // Fallback ke 'ffmpeg' jika tidak ada di config
    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

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
