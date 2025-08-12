import { AlertCircleIcon, InfoIcon, TrendingUpIcon } from 'lucide-react';

interface AnalysisResultProps {
  analysisResult: string;
}

export const AnalysisResult = ({ analysisResult }: AnalysisResultProps) => {
  if (!analysisResult) return null;

  return (
    <div className="w-full mt-6">
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border border-gray-200/60 shadow-lg backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 pb-4 border-b border-gray-100">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <TrendingUpIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              Pronunciation Analysis
            </h3>
            <p className="text-sm text-gray-500">
              AI-powered speech analysis results
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="prose prose-gray max-w-none">
            {analysisResult.split('\n').map((paragraph, index) => {
              const trimmed = paragraph.trim();

              // Обработка заголовков (строк с **)
              if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                const title = trimmed.replace(/\*\*/g, '');
                return (
                  <div key={index} className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <InfoIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 m-0">
                      {title}
                    </h4>
                  </div>
                );
              }

              // Обработка списков (строк, начинающихся с -)
              if (trimmed.startsWith('-')) {
                const content = trimmed.substring(1).trim();
                return (
                  <div key={index} className="flex items-start gap-3 mb-3 ml-11">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <p className="text-gray-700 leading-relaxed m-0 flex-1">
                      {content}
                    </p>
                  </div>
                );
              }

              // Обработка нумерованных списков
              if (/^\d+\./.test(trimmed)) {
                const match = trimmed.match(/^(\d+)\.\s*(.+)$/);
                if (match) {
                  const [, number, content] = match;
                  return (
                    <div key={index} className="flex items-start gap-3 mb-4 ml-11">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-green-700">{number}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed m-0 flex-1 font-medium">
                        {content}
                      </p>
                    </div>
                  );
                }
              }

              // Обычные параграфы
              return trimmed ? (
                <div key={index} className="mb-4 ml-11">
                  <p className="text-gray-700 leading-relaxed m-0">
                    {trimmed}
                  </p>
                </div>
              ) : (
                <div key={index} className="h-2"></div>
              );
            })}
          </div>

          {/* Footer with tip */}
          <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200/60">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-amber-900 mb-1">
                  Improve Analysis Accuracy
                </h5>
                <p className="text-sm text-amber-800 leading-relaxed">
                  For more detailed pronunciation analysis, try recording the complete sample text provided above. Longer speech samples allow for better accent detection and more specific recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};