import { useState, useCallback, useRef, useEffect } from "react";

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isReadyToAnalyze, setIsReadyToAnalyze] = useState<boolean>(false);

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

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setIsReadyToAnalyze(false);
    setAudioUrl(null);
    setAudioBlob(null);
    setIsRecording(false);
    chunksRef.current = [];
  }, [audioUrl]);

  // Cleanup effect
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

  return {
    isRecording,
    audioUrl,
    audioBlob,
    isReadyToAnalyze,
    startRecording,
    stopRecording,
    resetRecording
  };
};