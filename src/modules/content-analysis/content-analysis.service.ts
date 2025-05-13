import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { YoutubeService } from '../youtube/youtube.service';
import { TrendingVideosResponseDto } from '../youtube/dto/trending-video.dto';
import {
  AnalyzeTrendingContentRequestDto,
  AnalyzeTrendingContentResponseDto,
  AnalyzedVideoTrendDto,
} from './dto/analyze-trending-content.dto';
// import { HttpService } from '@nestjs/axios'; // Uncomment jika perlu memanggil API AI
import {
  AnalyzeVideoByIdRequestDto,
  AnalyzeVideoByIdResponseDto,
  SeoOptimizationTipsDto,
  ThumbnailFeedbackDto,
  CallToActionIdeasDto,
  EngagementBoostersDto,
} from './dto/analyze-video-by-id.dto'; // <-- Impor DTO baru
import { TrendingVideoItemDto } from '../youtube/dto/trending-video.dto'; // Pastikan ini diimpor jika belum

/**
 * @class ContentAnalysisService
 * @description Layanan untuk menganalisis konten, berinteraksi dengan AI, dan memberikan wawasan.
 */
@Injectable()
export class ContentAnalysisService {
  private readonly _logger = new Logger(ContentAnalysisService.name);

  /**
   * Konstruktor ContentAnalysisService.
   * @param _youtubeService Layanan untuk mengambil data dari YouTube.
   * @param _httpService // Uncomment jika perlu HttpService untuk API AI
   */
  constructor(
    private readonly _youtubeService: YoutubeService, // Inject YoutubeService
  ) {
    // private readonly _httpService: HttpService, // Uncomment jika perlu
  }

  /**
   * @method analyzeTrendingContent
   * @description Menganalisis video trending untuk memberikan wawasan konten kepada YouTuber pemula.
   * Menggunakan data dari YouTube API dan (simulasi) AI Gemini untuk analisis.
   * @param {AnalyzeTrendingContentRequestDto} dto Parameter untuk analisis tren.
   * @returns {Promise<AnalyzeTrendingContentResponseDto>} Hasil analisis tren konten.
   * @throws {HttpException} Jika terjadi error saat mengambil data atau analisis.
   */
  async analyzeTrendingContent(
    dto: AnalyzeTrendingContentRequestDto,
  ): Promise<AnalyzeTrendingContentResponseDto> {
    this._logger.log(
      `Memulai analisis tren konten dengan parameter: ${JSON.stringify(dto)}`,
    );

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { category_id, region_code, max_results, hl, keywords } = dto;

    let trendingVideosResponse: TrendingVideosResponseDto;
    try {
      // Menggunakan YoutubeService untuk mendapatkan video trending
      trendingVideosResponse = await this._youtubeService.getTrendingVideos({
        regionCode: region_code,
        videoCategoryId: category_id,
        maxResults: max_results,
        hl: hl,
      });
    } catch (error) {
      this._logger.error(
        `Gagal mengambil video trending untuk analisis melalui YoutubeService: ${error.message}`,
        error.stack,
      );
      // Anda mungkin ingin menangani error ini secara spesifik atau melemparnya kembali
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Gagal mengambil data video trending dari layanan YouTube.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (
      !trendingVideosResponse ||
      !trendingVideosResponse.items ||
      trendingVideosResponse.items.length === 0
    ) {
      this._logger.warn(
        'Tidak ada video trending yang ditemukan untuk dianalisis.',
      );
      return {
        analyzed_trends: [],
        overall_summary:
          'Tidak ada video trending yang ditemukan untuk parameter yang diberikan. Coba dengan filter yang berbeda.',
        suggested_topics: [],
      };
    }

    const analyzedTrends: AnalyzedVideoTrendDto[] = [];

    for (const video of trendingVideosResponse.items) {
      // --- MOCK AI (Gemini) Call START ---
      // Di masa depan, bagian ini akan memanggil API Gemini atau layanan AI lainnya.
      this._logger.log(`(MOCK AI) Menganalisis video: ${video.title}`);
      const mockAiDescriptionSummary = `(AI Mock) Ringkasan cerdas untuk "${video.title}". Video ini membahas topik yang relevan dengan ${keywords || video.tags?.[0] || 'tren saat ini'} dan menarik perhatian karena kualitas produksi dan narasi yang kuat. Deskripsi asli: ${video.description?.substring(0, 100) || '[tidak ada deskripsi]'}.`;
      const mockAiIdentifiedKeywords = [
        ...(video.tags || []),
        'ai_keyword_1',
        keywords || 'topik_populer',
      ]
        .filter((kw, index, self) => kw && self.indexOf(kw) === index)
        .slice(0, 5);
      const mockAiSuggestedAngle = `(AI Mock) Untuk topik "${video.title}", pertimbangkan membuat konten turunan seperti 'reaksi mendalam', 'analisis perbandingan dengan [video lain]', atau 'tutorial lanjutan terkait ${keywords || video.tags?.[0] || 'aspek utama video'}'.`;
      // --- MOCK AI (Gemini) Call END ---

      analyzedTrends.push({
        video_id: video.id,
        title: video.title,
        thumbnail_url: video.thumbnail_url,
        channel_title: video.channel_title,
        view_count: video.view_count,
        published_at: video.published_at,
        description_summary: mockAiDescriptionSummary,
        identified_keywords: mockAiIdentifiedKeywords,
        suggested_angle: mockAiSuggestedAngle,
      });
    }

    // --- MOCK AI (Gemini) Call for Overall Summary START ---
    this._logger.log('(MOCK AI) Membuat ringkasan umum dan saran topik.');
    const mockOverallSummary = `(AI Mock) Berdasarkan analisis ${analyzedTrends.length} video trending teratas ${category_id ? `dalam kategori ${category_id}` : ''} ${keywords ? `terkait kata kunci "${keywords}"` : ''}, tren utama saat ini adalah konten [Jenis Konten A] dan [Jenis Konten B]. Penonton menunjukkan minat tinggi pada video dengan [Karakteristik Umum Video Populer].`;
    const mockSuggestedTopics = [
      `(AI Mock) Buat video tentang 'Topik Populer A Terkait ${keywords || 'Tren Umum Saat Ini'}' dengan sentuhan pribadi Anda.`,
      `(AI Mock) Kembangkan tutorial 'Cara Melakukan B Mengikuti Gaya Konten ${category_id || 'Populer'}' yang lebih mendalam.`,
      `(AI Mock) Pertimbangkan untuk membuat seri konten pendek berdasarkan 'Momen Terbaik dari Video Trending Teratas'.`,
    ];
    // --- MOCK AI (Gemini) Call for Overall Summary END ---

    return {
      analyzed_trends: analyzedTrends,
      overall_summary: mockOverallSummary,
      suggested_topics: mockSuggestedTopics,
    };
  }

  /**
   * @method analyzeVideoById
   * @description Menganalisis video tunggal berdasarkan ID untuk memberikan wawasan konten.
   * @param {AnalyzeVideoByIdRequestDto} dto Parameter permintaan berisi ID video.
   * @returns {Promise<AnalyzeVideoByIdResponseDto>} Hasil analisis video.
   * @throws {HttpException} Jika video tidak ditemukan atau terjadi error.
   */
  async analyzeVideoById(
    dto: AnalyzeVideoByIdRequestDto,
  ): Promise<AnalyzeVideoByIdResponseDto> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { video_id, hl } = dto;
    this._logger.log(
      `Memulai analisis untuk video ID: ${video_id}, bahasa: ${hl}`,
    );

    let videoDetailsResponse: TrendingVideosResponseDto;
    try {
      // Menggunakan YoutubeService untuk mendapatkan detail video tunggal
      // Asumsi getTrendingVideos dapat mengambil video by ID jika 'id' disediakan
      // dan maxResults=1
      videoDetailsResponse = await this._youtubeService.getTrendingVideos({
        videoCategoryId: video_id,
        maxResults: 1, // Hanya butuh satu video
        hl: hl,
        // part: 'snippet,statistics,contentDetails' // Sesuaikan part jika perlu lebih banyak info
      });
    } catch (error) {
      this._logger.error(
        `Gagal mengambil detail video ID ${video_id} melalui YoutubeService: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Gagal mengambil data untuk video ID: ${video_id}.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (
      !videoDetailsResponse ||
      !videoDetailsResponse.items ||
      videoDetailsResponse.items.length === 0
    ) {
      this._logger.warn(`Video dengan ID: ${video_id} tidak ditemukan.`);
      throw new HttpException(
        `Video dengan ID: ${video_id} tidak ditemukan.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const video: TrendingVideoItemDto = videoDetailsResponse.items[0];

    // --- MOCK AI (Gemini) Call START ---
    this._logger.log(`(MOCK AI) Menganalisis detail video: ${video.title}`);

    const mockDescriptionSummary = `(AI Mock) Ringkasan cerdas untuk "${video.title}". Video ini membahas ${video.tags?.[0] || 'topik menarik'} dan bertujuan untuk ${video.description?.substring(0, 50) || 'memberikan informasi/hiburan'}. Fokus utama adalah pada ${video.tags?.[1] || 'aspek kunci video'}.`;

    const mockIdentifiedKeywords = [
      ...(video.tags || []),
      'AI_generated_keyword_1',
      'AI_generated_keyword_2',
      video.channel_title?.toLowerCase().replace(/\s/g, '') ||
        'channel_keyword',
    ]
      .filter((kw, index, self) => kw && self.indexOf(kw) === index)
      .slice(0, 7);

    const mockSuggestedAngle = `(AI Mock) Untuk video "${video.title}", pertimbangkan untuk membuat konten lanjutan seperti 'Analisis Mendalam tentang ${video.tags?.[0] || 'Topik Utama'}', 'Studi Kasus Terkait ${video.tags?.[1] || 'Aspek Kedua'}', atau 'Tutorial Bagaimana Cara ${video.title.substring(0, 20)}... dengan Pendekatan Berbeda'.`;

    const mockSeoTips: SeoOptimizationTipsDto = {
      title_suggestions: [
        `(AI Mock) Pertimbangkan menambahkan angka atau tahun pada judul: "${video.title} ${new Date().getFullYear()}"`,
        `(AI Mock) Gunakan kata kunci utama di awal judul jika memungkinkan.`,
        `(AI Mock) Buat judul yang memancing rasa penasaran, contoh: "Terungkap! Rahasia di Balik ${video.tags?.[0] || 'Topik Video'}"`,
      ],
      description_suggestions: [
        `(AI Mock) Ulangi kata kunci utama 2-3 kali secara alami dalam deskripsi.`,
        `(AI Mock) Tambahkan timestamp untuk navigasi mudah jika video panjang.`,
        `(AI Mock) Sertakan link ke media sosial atau video relevan lainnya.`,
      ],
      tag_suggestions: [
        `(AI Mock) Gunakan variasi kata kunci (long-tail dan short-tail).`,
        `(AI Mock) Riset tag yang digunakan kompetitor pada video serupa.`,
        `(AI Mock) Sertakan nama channel sebagai salah satu tag.`,
      ],
    };

    const mockThumbnailFeedback: ThumbnailFeedbackDto = {
      general_suggestions: [
        `(AI Mock) Pastikan teks pada thumbnail (jika ada) mudah dibaca di perangkat mobile.`,
        `(AI Mock) Gunakan warna kontras untuk menarik perhatian.`,
        `(AI Mock) Konsistensi branding pada thumbnail dapat membantu penonton mengenali channel Anda.`,
      ],
    };

    const mockCtaIdeas: CallToActionIdeasDto = {
      ideas: [
        `(AI Mock) "Jika kalian suka video ini, jangan lupa like dan share ya!"`,
        `(AI Mock) "Tulis di kolom komentar, bagian mana yang paling kalian suka?"`,
        `(AI Mock) "Untuk konten eksklusif lainnya, follow Instagram kami di @[nama_channel]."`,
      ],
    };

    const mockEngagementBoosters: EngagementBoostersDto = {
      strategies: [
        `(AI Mock) "Balas komentar penonton secepat mungkin untuk membangun komunitas."`,
        `(AI Mock) "Adakan sesi Q&A live secara berkala."`,
        `(AI Mock) "Gunakan fitur 'pinned comment' untuk pertanyaan atau informasi penting."`,
      ],
    };
    // --- MOCK AI (Gemini) Call END ---

    return {
      video_id: video.id,
      title: video.title,
      description_summary: mockDescriptionSummary,
      identified_keywords: mockIdentifiedKeywords,
      suggested_angle: mockSuggestedAngle,
      seo_tips: mockSeoTips,
      thumbnail_feedback: mockThumbnailFeedback,
      cta_ideas: mockCtaIdeas,
      engagement_boosters: mockEngagementBoosters,
    };
  }
  // Anda dapat menambahkan metode lain di sini untuk fitur AI lainnya
  // misalnya, generateScript, optimizeSeo, analyzeComments, dll.
}
