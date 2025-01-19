"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2Icon, Mic2Icon } from 'lucide-react';
import { CustomAbsoluteCard } from "@/components/custom-absolute-card";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { CustomAudioPlayer } from "@/components/custom-audio-player";
import { analyzeAudio } from "@/actions/analyze-audio";
import { features, benefits } from "@/lib/data";


const sampleText = {
  title: "Please read this text:",
  text: "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once. Pronouncing it clearly will help us analyze your speech patterns and accent.",
  hint: "Click the microphone button to start recording"
};


export default function Home() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isReadyToAnalyze, setIsReadyToAnalyze] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Функция для определения поддерживаемого типа медиа
  const getSupportedMimeType = () => {
    const types = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/mp4',
      'audio/ogg',
      'audio/wav',
      ''  // Пустая строка как fallback, будет использован дефолтный формат браузера
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = []; // Очищаем чанки перед новой записью
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm'
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioBlob(audioBlob);
        setIsReadyToAnalyze(true);
        setIsRecording(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(200); // Устанавливаем интервал для ondataavailable
      setIsRecording(true);
      setAudioUrl(null);
      setAudioBlob(null);
      setIsReadyToAnalyze(false);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Please, allow microphone access to use this feature");
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  const handleReset = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setIsReadyToAnalyze(false);
    setAudioUrl(null);
    setAudioBlob(null);
    setIsRecording(false);
    setAnalysisResult(null);
    chunksRef.current = [];
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioUrl]);

  const handleAnalyzeAudio = async () => {
    if (!audioBlob) return;

    try {
      setIsAnalyzing(true);
      const transcription = await analyzeAudio(audioBlob);
      setAnalysisResult(transcription);
    } catch (error) {
      console.error("Error analyzing audio:", error);
      alert("Please, try again");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="relative py-2 flex flex-col items-center justify-center w-full max-w-3xl min-h-56 hover:duration-500 hover:z-[1000]">

        {!isReadyToAnalyze && (
          <div className="text-center mb-8 max-w-2xl px-6">
            <h2 className="text-xl font-medium text-gray-800 mt-8 mb-4">
              {sampleText.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              {sampleText.text}
            </p>
            <p className="text-sm text-gray-500 italic">
              {isRecording ? "Click the microphone button to stop recording" : sampleText.hint}
            </p>
          </div>
        )}


        {isReadyToAnalyze ? (
          <div className="flex flex-col items-center gap-4">
            {audioUrl && (
              <CustomAudioPlayer
                audioUrl={audioUrl}
              />
            )}

            {/* Analysis Result */}
            {analysisResult && (
              <div className="text-center mt-4 p-6 bg-green-50 rounded-lg max-w-3xl">
                <h3 className="text-xl font-semibold mb-4 text-green-800">Analysis Result:</h3>
                <div className="text-left prose prose-green max-w-none">
                  {analysisResult.split('\n').map((paragraph, index) => {
                    // Обработка заголовков (строк с **)
                    if (paragraph.startsWith('**')) {
                      return (
                        <h4 key={index} className="font-semibold text-green-700 mt-4 mb-2">
                          {paragraph.replace(/\*\*/g, '')}
                        </h4>
                      );
                    }
                    // Обработка списков (строк, начинающихся с -)
                    if (paragraph.trim().startsWith('-')) {
                      return (
                        <ul key={index} className="list-disc pl-6 mb-2">
                          <li className="text-gray-700">
                            {paragraph.trim().substring(1).trim()}
                          </li>
                        </ul>
                      );
                    }
                    // Обработка нумерованных списков (строк, начинающихся с цифры)
                    if (/^\d+\./.test(paragraph.trim())) {
                      return (
                        <div key={index} className="mb-4">
                          <h4 className="font-semibold text-green-700">
                            {paragraph.trim()}
                          </h4>
                        </div>
                      );
                    }
                    // Обычные параграфы
                    return paragraph.trim() ? (
                      <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                onClick={handleAnalyzeAudio}
                className="bg-green-600 hover:bg-green-500 text-white px-8"
                disabled={isAnalyzing}
              >
                {isAnalyzing ?
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  :
                  "Analyze"
                }
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isAnalyzing}
              >
                Record Again
              </Button>
            </div>
          </div>
        ) : (
          <Button
            className={cn(
              "w-24 h-24 hover:shadow-lg",
              isRecording
                ? "bg-red-500 hover:bg-red-600 duration-500 rounded-full"
                : "bg-black/85 hover:bg-black rounded-lg"
            )}
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Mic2Icon className={cn(
              "w-20 h-20",
              isRecording ? "animate-pulse" : ""
            )} />
          </Button>
        )}
        <div className="absolute -top-5 left-3 bg-white">
          <h1 className="text-4xl font-thin tracking-wide">
            {isRecording ? "Recording..." : "Analyze your pronunciation"}
          </h1>
        </div>
      </Card>
      <CustomAbsoluteCard
        className="top-10 right-10 w-[300px]"
        title="Features"
        descriptions={features}
      />
      <CustomAbsoluteCard
        className="bottom-10 left-10 w-[300px]"
        title="Benefits"
        descriptions={benefits}
      />
    </div>
  );
}

