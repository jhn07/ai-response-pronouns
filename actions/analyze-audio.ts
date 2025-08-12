"use server";

import { voiceService } from "../services/voice-service";

export const analyzeAudio = async (audioBlob: Blob) => {
  try {
    if (!audioBlob) {
      throw new Error("Audio Blob is required");
    }

    console.log("Analyzing audio:", audioBlob);

    const result = await voiceService.analyzeAudio(audioBlob);
    return result.analysis;
  } catch (error) {
    console.error("Error in analyzeAudio:", error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
