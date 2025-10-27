
export interface Prediction {
  prediction: string;
  probability: number; // e.g., 0.65 for 65%
  odds: string; // e.g., "1.62"
  justification: string;
}

export interface PredictionData {
  matchWinner: Prediction;
  bothTeamsToScore: Prediction;
  totalGoals: Prediction;
  firstHalfGoals: Prediction;
  totalCorners: Prediction;
  totalCards: Prediction;
  totalFouls: Prediction;
}

export interface GroundingChunk {
  // FIX: Made `web` property optional to align with the GroundingChunk type from the @google/genai SDK.
  web?: {
    // FIX: Made uri optional to match the type from the @google/genai SDK.
    uri?: string;
    // FIX: Made title optional to match the type from the @google/genai SDK.
    title?: string;
  };
}