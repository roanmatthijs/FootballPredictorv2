
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-10 md:mb-12">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
        Football Predictor AI
      </h1>
      <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
        Leveraging Gemini with Google Search to provide data-driven match insights.
      </p>
    </header>
  );
};
