import { Button } from "@/components/ui/button";
import { Mic2Icon } from 'lucide-react';
import { cn } from "@/lib/utils";

const sampleText = {
  title: "Please read this text:",
  text: "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once. Pronouncing it clearly will help us analyze your speech patterns and accent.",
  hint: "Click the microphone button to start recording"
};

interface RecordingSectionProps {
  isRecording: boolean;
  isReadyToAnalyze: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const RecordingSection = ({ 
  isRecording, 
  isReadyToAnalyze, 
  onStartRecording, 
  onStopRecording 
}: RecordingSectionProps) => {
  if (isReadyToAnalyze) return null;

  return (
    <>
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

      <Button
        className={cn(
          "w-24 h-24 hover:shadow-lg",
          isRecording
            ? "bg-red-500 hover:bg-red-600 duration-500 rounded-full"
            : "bg-black/85 hover:bg-black rounded-lg"
        )}
        onClick={isRecording ? onStopRecording : onStartRecording}
      >
        <Mic2Icon className={cn(
          "w-20 h-20",
          isRecording ? "animate-pulse" : ""
        )} />
      </Button>
    </>
  );
};