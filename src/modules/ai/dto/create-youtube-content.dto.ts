import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';

enum EVideoPurpose {
  Edukasi = 'Edukasi',
  Hiburan = 'Hiburan',
  Review = 'Review',
  Motivasi = 'Motivasi',
}

enum EVideoStyle {
  Storytelling = 'Storytelling',
  Listicle = 'Listicle',
  Tutorial = 'Tutorial',
  Documentary = 'Documentary',
  Vlog = 'Vlog',
  Podcast = 'Podcast',
}

enum EOutputFormat {
  JSON = 'JSON',
  Markdown = 'Markdown',
  PlainText = 'Plain Text',
}

enum EVideoTone {
  Santai = 'Santai',
  Formal = 'Formal',
  Humoris = 'Humoris',
  Dramatis = 'Dramatis',
}
enum EHookStyle {
  Question = 'Pertanyaan menggugah', // Contoh: "Pernah nggak sih kamu merasa gaji kamu selalu habis tanpa tahu ke mana?"
  StatisticShock = 'Fakta mengejutkan', // Contoh: "80% orang Indonesia nggak punya dana darurat sama sekali."
  BoldClaim = 'Pernyataan berani/kontroversial', // Contoh: "Nabung itu bisa bikin kamu rugi—kalau caranya salah."
  RelatableProblem = 'Masalah sehari-hari', // Contoh: "Capek gaji cuma numpang lewat tiap bulan? Tenang, kamu nggak sendiri."
  VisualTease = 'Cuplikan menarik/visual aneh', // Contoh: Menunjukkan cuplikan hasil akhir sebelum menjelaskan prosesnya.
  MiniStory = 'Cuplikan cerita nyata/fiksi', // Contoh: "Waktu aku pertama kali kerja, gaji UMR rasanya nggak cukup bahkan buat makan..."
  Humor = 'Pembuka lucu atau absurd', // Contoh: "Gaji pas-pasan? Tenang, masih bisa kelihatan kaya—asal nggak gerak."
  Challenge = 'Tantangan atau janji hasil cepat', // Contoh: "Bisa hemat Rp1 juta dalam seminggu? Coba cara ini."
}

export class CreateYoutubeContentDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsEnum(EVideoPurpose)
  @IsNotEmpty()
  purpose: EVideoPurpose;

  @IsString()
  @IsNotEmpty()
  targetAudience: string; // Contoh: Pemula, Mahasiswa, Gamer

  @IsEnum(EVideoStyle)
  @IsNotEmpty()
  style: EVideoStyle;

  @IsEnum(EVideoTone)
  @IsNotEmpty()
  tone: EVideoStyle;

  @IsString()
  @IsNotEmpty()
  duration: string; // Contoh: 30 detik, 5 menit, 10+ menit

  @IsString()
  @IsOptional()
  styleReference?: string; // Contoh: Channel X atau Genre Y

  @IsString()
  @IsOptional()
  language?: string = 'Indonesia'; // Default ke Indonesia

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  avoidContent?: string[]; // Contoh: [Politik, Kekerasan, SARA]

  @IsEnum(EHookStyle)
  @IsOptional()
  hookStyle?: EHookStyle = EHookStyle.Question;

  @IsEnum(EOutputFormat)
  @IsOptional()
  outputFormat?: EOutputFormat = EOutputFormat.JSON;
}
