
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { MatchInput } from './components/MatchInput';
import { PredictionCard } from './components/PredictionCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Footer } from './components/Footer';
import { SourceLink } from './components/SourceLink';
import { getMatchPredictions } from './services/geminiService';
import { PredictionData, GroundingChunk } from './types';

const App: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = useCallback(async (homeTeam: string, awayTeam: string, matchDate: string, referee: string) => {
    setIsLoading(true);
    setError(null);
    setPredictions(null);
    setSources([]);

    try {
      const result = await getMatchPredictions(homeTeam, awayTeam, matchDate, referee);
      if (result.predictions) {
        setPredictions(result.predictions);
      }
      if (result.sources) {
        setSources(result.sources);
      }
    } catch (err) {
      setError(err instanceof Error ? `Failed to get predictions: ${err.message}` : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <Header />
        <div className="max-w-4xl mx-auto">
          <MatchInput onPredict={handlePredict} isLoading={isLoading} />
          {isLoading && (
            <div className="flex justify-center items-center mt-12">
              <LoadingSpinner />
              <p className="ml-4 text-lg text-gray-400">AI is analyzing data...</p>
            </div>
          )}
          {error && (
            <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}
          {predictions && !isLoading && (
            <div className="mt-12 space-y-8">
              <h2 className="text-3xl font-bold text-center text-green-400">Match Predictions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <PredictionCard 
                  title="Match Winner (1X2)" 
                  prediction={predictions.matchWinner.prediction}
                  probability={predictions.matchWinner.probability}
                  odds={predictions.matchWinner.odds}
                  justification={predictions.matchWinner.justification}
                />
                <PredictionCard 
                  title="Both Teams to Score" 
                  prediction={predictions.bothTeamsToScore.prediction}
                  probability={predictions.bothTeamsToScore.probability}
                  odds={predictions.bothTeamsToScore.odds}
                  justification={predictions.bothTeamsToScore.justification}
                />
                <PredictionCard 
                  title="Total Goals" 
                  prediction={predictions.totalGoals.prediction}
                  probability={predictions.totalGoals.probability}
                  odds={predictions.totalGoals.odds}
                  justification={predictions.totalGoals.justification}
                />
                <PredictionCard 
                  title="Total Goals (1st Half)" 
                  prediction={predictions.firstHalfGoals.prediction}
                  probability={predictions.firstHalfGoals.probability}
                  odds={predictions.firstHalfGoals.odds}
                  justification={predictions.firstHalfGoals.justification}
                />
                <PredictionCard 
                  title="Total Corners" 
                  prediction={predictions.totalCorners.prediction}
                  probability={predictions.totalCorners.probability}
                  odds={predictions.totalCorners.odds}
                  justification={predictions.totalCorners.justification}
                />
                <PredictionCard 
                  title="Total Cards" 
                  prediction={predictions.totalCards.prediction}
                  probability={predictions.totalCards.probability}
                  odds={predictions.totalCards.odds}
                  justification={predictions.totalCards.justification}
                />
                <PredictionCard 
                  title="Total Fouls" 
                  prediction={predictions.totalFouls.prediction}
                  probability={predictions.totalFouls.probability}
                  odds={predictions.totalFouls.odds}
                  justification={predictions.totalFouls.justification}
                />
              </div>
              {sources.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-700">
                  <h3 className="text-xl font-semibold text-center text-gray-400 mb-4">Data Sources</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {sources.map((source, index) => (
                      // FIX: Use optional chaining as `web` property is optional in `GroundingChunk`.
                      <SourceLink key={index} uri={source.web?.uri} title={source.web?.title} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;