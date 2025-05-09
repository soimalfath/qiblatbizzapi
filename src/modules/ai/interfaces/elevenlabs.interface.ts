/**
 * Interface untuk satu item suara dari ElevenLabs.
 * Properti disesuaikan dengan respons API ElevenLabs dan aturan naming convention.
 */
export interface IElevenLabsVoice {
  voiceId: string;
  name: string;
  samples:
    | {
        sampleId: string;
        fileName: string;
        mimeType: string;
        sizeBytes: number;
        hash: string;
      }[]
    | null;
  category: string;
  fineTuning: {
    modelId: string | null;
    language: string | null;
    isAllowedToFineTune: boolean;
    fineTuningRequested: boolean;
    finetuningState: string;
    verificationAttempts: any[] | null; // Bisa lebih spesifik jika diketahui strukturnya
    verificationFailures: string[];
    verificationAttemptsCount: number;
    sliceIds: string[] | null;
    manualVerification: any | null; // Bisa lebih spesifik
    manualVerificationRequested: boolean;
  };
  labels: Record<string, string>;
  description: string | null;
  previewUrl: string | null;
  availableForTiers: string[];
  settings: {
    stability: number;
    similarityBoost: number;
    style?: number; // Opsional, tergantung model
    useSpeakerBoost?: boolean; // Opsional
  } | null;
  sharing: any | null; // Bisa lebih spesifik jika diketahui strukturnya
  highQualityBaseModelIds: string[];
}

/**
 * Interface untuk respons daftar suara dari ElevenLabs.
 */
export interface IElevenLabsVoicesResponse {
  voices: IElevenLabsVoice[];
}
