
import React from 'react';

interface PredictionCardProps {
  title: string;
  prediction: string;
  probability: number;
  odds: string;
  justification: string;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ title, prediction, probability, odds, justification }) => {
  const percentage = Math.round(probability * 100);

  const getBarColor = (p: number): string => {
    if (p > 66) return 'bg-green-500';
    if (p > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const barColor = getBarColor(percentage);

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col h-full hover:border-green-500 transition-colors duration-300">
      <h3 className="text-lg font-bold text-gray-200 mb-2">{title}</h3>
      <p className="text-3xl font-extrabold text-green-400 mb-4">{prediction}</p>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold text-gray-300">Probability</span>
          <span className="font-bold text-white">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className={`${barColor} h-2.5 rounded-full transition-all duration-500`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-sm pt-2">
          <span className="font-semibold text-gray-300">Odds <span className="text-gray-500 text-xs">(~5% margin)</span></span>
          <span className="font-bold text-white bg-gray-900 px-2 py-0.5 rounded">{odds}</span>
        </div>
      </div>
      
      <div className="mt-auto">
        <p className="text-sm text-gray-400 italic">"{justification}"</p>
      </div>
    </div>
  );
};