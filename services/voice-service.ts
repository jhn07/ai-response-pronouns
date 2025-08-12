import OpenAI from "openai";
import { prompt } from "./prompt";

interface AnalysisResult {
  transcription: string;
  analysis: string;
}

interface AudioFormat {
  fileName: string;
  extension: string;
}

interface VoiceServiceConfig {
  apiKey?: string;
  whisperModel?: string;
  gptModel?: string;
  enableLogging?: boolean;
  maxRetries?: number;
}


export class VoiceService {
  private openai: OpenAI;
  private readonly whisperModel: string;
  private readonly gptModel: string;
  private readonly enableLogging: boolean;
  private readonly maxRetries: number;

  constructor(config: VoiceServiceConfig = {}) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    this.openai = new OpenAI({ apiKey });
    this.whisperModel = config.whisperModel || "whisper-1";
    this.gptModel = config.gptModel || "gpt-4";
    this.enableLogging = config.enableLogging ?? true;
    this.maxRetries = config.maxRetries || 3;
  }

  async analyzeAudio(audioBlob: Blob): Promise<AnalysisResult> {
    this.validateInput(audioBlob);

    try {
      const audioFormat = this.getAudioFormat(audioBlob.type);
      const audioFile = new File([audioBlob], audioFormat.fileName, { type: audioBlob.type });

      const transcription = await this.withRetry(() =>
        this.openai.audio.transcriptions.create({
          model: this.whisperModel,
          file: audioFile,
          response_format: "text",
          language: "en",
        })
      );

      if (!transcription) {
        throw new Error("Failed to transcribe audio");
      }

      const analysis = await this.analyzeTranscription(transcription);

      const result: AnalysisResult = {
        transcription,
        analysis
      };

      if (this.enableLogging) {
        console.log("Analysis:", result);
      }

      return result;


    } catch (error) {
      console.error("Error in audio analysis:", error);
      throw new Error("Failed to analyze audio");
    }
  }

  private async analyzeTranscription(transcription: string): Promise<string> {
    try {
      const analysis = await this.withRetry(() =>
        this.openai.chat.completions.create({
          model: this.gptModel,
          messages: [
            {
              role: "system",
              content: `${prompt.system}\n\n${prompt.examples}`
            },
            {
              role: "user",
              content: `Analyze this speech sample for ethnic pronunciation features: "${transcription}". 
          Consider:
          - Phonetic transfers from native languages
          - Prosodic patterns
          - Characteristic grammatical structures
          - Lexical choices`
            },
          ],
          temperature: 0.5
        })
      );

      if (!analysis.choices[0].message.content) throw new Error("Failed to analyze speech");

      return analysis.choices[0].message.content;
    } catch (error) {
      console.error("Error in speech analysis:", error);
      throw new Error("Failed to analyze speech");
    }
  }

  private validateInput(audioBlob: Blob): void {
    if (!audioBlob) {
      throw new Error("Audio blob is required");
    }

    if (audioBlob.size === 0) {
      throw new Error("Audio blob cannot be empty");
    }

    if (!audioBlob.type.startsWith('audio/')) {
      throw new Error("Invalid audio format");
    }
  }

  private getAudioFormat(mimeType: string): AudioFormat {
    const formatMap: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/webm;codecs=opus': 'webm',
      'audio/mp4': 'mp4',
      'audio/mpeg': 'mp3',
      'audio/ogg': 'ogg',
      'audio/wav': 'wav'
    };

    const extension = formatMap[mimeType] || formatMap[mimeType.split(';')[0]] || 'mp4';

    return {
      fileName: `audio.${extension}`,
      extension
    };
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));

        if (this.enableLogging) {
          console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
        }
      }
    }

    throw lastError!;
  }
}

export const voiceService = new VoiceService({
  apiKey: process.env.OPENAI_API_KEY,
  whisperModel: "whisper-1",
  gptModel: "gpt-4",
  enableLogging: true,
  maxRetries: 3
});