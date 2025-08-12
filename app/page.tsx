"use client";

import { CustomAbsoluteCard } from "@/components/custom-absolute-card";
import { RecordingSection } from "@/components/recording-section";
import { AudioAnalysisSection } from "@/components/audio-analysis-section";
import { AnalysisResult } from "@/components/analysis-result";
import { useAudioRecording } from "@/hooks/use-audio-recording";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { analyzeAudio } from "@/actions/analyze-audio";
import { features, benefits } from "@/lib/data";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  const {
    isRecording,
    audioUrl,
    audioBlob,
    isReadyToAnalyze,
    startRecording,
    stopRecording,
    resetRecording
  } = useAudioRecording();

  const handleAnalyzeAudio = async () => {
    if (!audioBlob) {
      alert("No audio recording found. Please record your voice first.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisResult(null); // Clear previous results
      const transcription = await analyzeAudio(audioBlob);
      setAnalysisResult(transcription);
    } catch (error) {
      console.error("Error analyzing audio:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Analysis failed: ${errorMessage}. Please try again.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    resetRecording();
    setAnalysisResult(null);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-24">
      <div className="relative py-2 flex flex-col items-center justify-center w-full max-w-3xl min-h-56">
        
        <RecordingSection 
          isRecording={isRecording}
          isReadyToAnalyze={isReadyToAnalyze}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
        />

        {isReadyToAnalyze ? (
          <div className="w-full max-w-5xl">
            <AudioAnalysisSection
              audioUrl={audioUrl}
              isAnalyzing={isAnalyzing}
              analysisCompleted={analysisResult !== null}
              onAnalyze={handleAnalyzeAudio}
              onReset={handleReset}
            />

            <AnalysisResult analysisResult={analysisResult || ""} />
          </div>
        ) : null}

        <div className="absolute -top-5 left-3 bg-white">
          <h1 className="text-4xl font-thin tracking-wide">
            {isRecording ? "Recording..." : "Analyze your pronunciation"}
          </h1>
        </div>
      </div>
      
      <CustomAbsoluteCard
        className={cn(
          "top-10 right-10 w-[300px] transition-all duration-500",
          isRecording || isReadyToAnalyze ? "opacity-0 translate-x-10 pointer-events-none" : "opacity-100"
        )}
        title="Features"
        descriptions={features}
      />
      <CustomAbsoluteCard
        className={cn(
          "bottom-10 left-10 w-[300px] transition-all duration-500",
          isRecording || isReadyToAnalyze ? "opacity-0 translate-x-10 pointer-events-none" : "opacity-100"
        )}
        title="Benefits"
        descriptions={benefits}
      />
    </div>
  );
}

