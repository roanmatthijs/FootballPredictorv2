
import React, { useState } from 'react';

interface MatchInputProps {
  onPredict: (homeTeam: string, awayTeam: string, matchDate: string, referee: string) => void;
  isLoading: boolean;
}

export const MatchInput: React.FC<MatchInputProps> = ({ onPredict, isLoading }) => {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [referee, setReferee] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeTeam && awayTeam && matchDate) {
      onPredict(homeTeam, awayTeam, matchDate, referee);
    }
  };
  
  const isButtonDisabled = isLoading || !homeTeam || !awayTeam;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="homeTeam" className="block text-sm font-medium text-gray-300 mb-1">Home Team</label>
            <input
              type="text"
              id="homeTeam"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              placeholder="e.g., Manchester United"
              className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="awayTeam" className="block text-sm font-medium text-gray-300 mb-1">Away Team</label>
            <input
              type="text"
              id="awayTeam"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              placeholder="e.g., Liverpool"
              className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="matchDate" className="block text-sm font-medium text-gray-300 mb-1">Match Date (for data context)</label>
            <input
              type="date"
              id="matchDate"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="referee" className="block text-sm font-medium text-gray-300 mb-1">Referee <span className="text-gray-500">(Optional)</span></label>
            <input
              type="text"
              id="referee"
              value={referee}
              onChange={(e) => setReferee(e.target.value)}
              placeholder="e.g., Anthony Taylor"
              className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out text-lg flex items-center justify-center
            ${isButtonDisabled 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg transform hover:scale-105'
            }`}
        >
          {isLoading ? 'Analyzing...' : 'Get Predictions'}
        </button>
      </form>
    </div>
  );
};
