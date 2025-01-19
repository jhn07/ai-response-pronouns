"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are an expert in analyzing English pronunciation and accents. Please provide a detailed analysis in the following format:

1. Accent Classification:
- Clearly state which English accent the speaker's pronunciation most closely resembles (e.g., American, British, etc.)
- Confidence level in this classification (high, medium, or low)

2. Key Characteristics:
- List the specific pronunciation patterns observed
- Note any distinctive vowel or consonant sounds
- Mention intonation and rhythm patterns

3. Strengths:
- Highlight what the speaker does well

4. Areas for Improvement:
- Provide specific sounds or patterns that could be enhanced
- Give practical tips for improvement

Please be specific but constructive in your analysis.`;

const speechToText = async (audioBlob: Blob) => {
  try {
    // Replace Blob in Audio File
    const fileType = audioBlob.type;
    const fileName = fileType.includes("webm") ? "audio.webm" : "audio.mp4";
    const audioFile = new File([audioBlob], fileName, { type: fileType });

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      response_format: "text", // "verbose_json"
      language: "en",
      // time_stamp_granularity: "word", // "segment"
    });

    if (!transcription) {
      throw new Error("Failed to transcribe audio");
    }

    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Analyze this transcribed speech for accent and pronunciation patterns: "${transcription}". 
          Even if the sample is short, please provide your best assessment based on available data.`
        },
      ],
      temperature: 0.7 // Добавляем небольшую вариативность, но сохраняем точность
    });

    if (!analysis.choices[0].message.content) throw new Error("Failed to analyze speech");

    console.log("Analysis:", {
      transcription,
      analysis: analysis.choices[0].message.content
    })


    return analysis.choices[0].message.content;

  } catch (error) {
    console.error("Error in speech to text conversion:", error)
    throw new Error("Failed to convert speech to text")
  }
};

export const analyzeAudio = async (audioBlob: Blob) => {

  if (!audioBlob) throw new Error("Audio Blob is required");

  console.log("Analyzing audio:", audioBlob);

  // Convert audio Blob to File
  const transcribedText = await speechToText(audioBlob);
  return transcribedText;
};
