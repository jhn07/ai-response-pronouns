"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are an expert in analyzing English pronunciation and accents. Provide detailed analysis focusing on ethnic and regional variations:

1. Ethnic/Racial Accent Identification:
- Primary ethnic influence (e.g., Indian, African-American, Hispanic, East Asian)
- Regional characteristics if apparent (e.g., Southern Indian, Nigerian, Caribbean)
- Confidence level (high/medium/low)

2. Phonetic Features Analysis:
- Distinctive vowel shifts (e.g., Indian "v" vs "w" substitution)
- Consonant articulation patterns (e.g., final consonant dropping in AAVE)
- Rhoticity and intonation patterns
- Stress and rhythm characteristics

3. Sociolect Indicators:
- Grammatical structures typical for ethnic varieties
- Lexical choices and colloquialisms
- Code-switching patterns if present

4. Improvement Suggestions:
- Target sounds for neutral accent acquisition
- Prosody exercises
- Cultural communication tips`;

const examples = `
Examples of ethnic pronunciation patterns:
1. Indian English:
   - Retroflex consonants (/t/ and /d/)
   - Lack of vowel reduction
   - Sentence-final stress patterns

2. African American Vernacular English (AAVE):
   - Consonant cluster simplification ("tes" for "test")
   - Habitual "be" usage
   - Non-rhotic tendencies

3. Hispanic English:
   - Vowel epenthesis ("eschool")
   - Final consonant devoicing
   - Stress timing transfer from Spanish`;


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
          content: `${systemPrompt}\n\n${examples}`
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
      temperature: 0.5 // Добавляем небольшую вариативность, но сохраняем точность
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
