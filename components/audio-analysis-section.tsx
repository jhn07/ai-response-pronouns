import { Button } from "@/components/ui/button";
import { CheckCircleIcon, InfoIcon, PlayIcon, SparklesIcon, Loader2Icon } from 'lucide-react';
import { CustomAudioPlayer } from "@/components/custom-audio-player";

interface AudioAnalysisSectionProps {
  audioUrl: string | null;
  isAnalyzing: boolean;
  analysisCompleted: boolean;
  onAnalyze: () => void;
  onReset: () => void;
}

export const AudioAnalysisSection = ({ 
  audioUrl, 
  isAnalyzing, 
  analysisCompleted,
  onAnalyze, 
  onReset 
}: AudioAnalysisSectionProps) => {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/60 shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Your Recording
              </h3>
              <p className="text-sm text-gray-500">
                Listen to your pronunciation sample
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
            <CheckCircleIcon className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Ready</span>
          </div>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="mb-6">
            <CustomAudioPlayer audioUrl={audioUrl} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          {!analysisCompleted && (
            <Button
              onClick={onAnalyze}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isAnalyzing}
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2Icon className="w-5 h-5 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Analyze Pronunciation
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onReset}
            disabled={isAnalyzing}
            className="border-2 border-gray-300 hover:border-gray-400 px-6 py-3 rounded-xl font-medium transition-all duration-200"
            size="lg"
          >
            Record Again
          </Button>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200/40">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-blue-900 mb-1">
                What happens next?
              </h5>
              <p className="text-sm text-blue-800 leading-relaxed">
                Our AI will analyze your pronunciation patterns, identify your accent characteristics, and provide personalized recommendations for improvement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};