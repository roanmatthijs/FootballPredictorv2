import { GoogleGenAI } from "@google/genai";
import { PredictionData, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. DEFINE THE SCHEMA
// This is now an object, not a string in the prompt.
// This guarantees the AI's output is *always* valid JSON.
const responseSchema = {
  type: "OBJECT",
  properties: {
    matchWinner: {
      type: "OBJECT",
      properties: {
        prediction: { type: "STRING" },
        probability: { type: "NUMBER" },
        odds: { type: "STRING" },
        justification: { type: "STRING" },
      },
      required: ['prediction', 'probability', 'odds', 'justification']
    },
    bothTeamsToScore: {
      type: "OBJECT",
      properties: {
        prediction: { type: "STRING" },
        probability: { type: "NUMBER" },
        odds: { type: "STRING" },
        justification: { type: "STRING" },
      },
      required: ['prediction', 'probability', 'odds', 'justification']
    },
    totalGoals: {
      type: "OBJECT",
      properties: {
        prediction: { type: "STRING" },
        probability: { type: "NUMBER" },
        odds: { type: "STRING" },
        justification: { type: "STRING" },
      },
      required: ['prediction', 'probability', 'odds', 'justification']
    },
    firstHalfGoals: {
      type: "OBJECT",
      properties: {
        prediction: { type: "STRING" },
        probability: { type: "NUMBER" },
        odds: { type: "STRING" },
        justification: { type: "STRING" },
      },
      required: ['prediction', 'probability', 'odds', 'justification']
    },
    totalCorners: {
      type: "OBJECT",
      properties: {
        prediction: { type: "STRING" },
        probability: { type: "NUMBER" },
        odds: { type: "STRING" },
        justification: { type: "STRING" },
      },
      required: ['prediction', 'probability', 'odds', 'justification']
    },
    totalCards: {
      type: "OBJECT",
      properties: {
        prediction: { type: "STRING" },
        probability: { type: "NUMBER" },
        odds: { type: "STRING" },
        justification: { type: "STRING" },
      },
      required: ['prediction', 'probability', 'odds', 'justification']
    },
    totalFouls: {
      type: "OBJECT",
      properties: {
        prediction: { type: "STRING" },
        probability: { type: "NUMBER" },
        odds: { type: "STRING" },
        justification: { type: "STRING" },
      },
      required: ['prediction', 'probability', 'odds', 'justification']
    }
  },
  required: ['matchWinner', 'bothTeamsToScore', 'totalGoals', 'firstHalfGoals', 'totalCorners', 'totalCards', 'totalFouls']
};


// 2. REWRITE THE PROMPT
// This new prompt is far more professional.
// It forces the AI to find market odds as a baseline, be source-specific,
// and only then perform its analysis.
const buildPrompt = (homeTeam: string, awayTeam: string, matchDate: string, refereeName: string): string => {
  const refereePreamble = refereeName ? `The appointed referee is ${refereeName}.` : '';

  const refereeDataGathering = refereeName
    ? `
        -   **Referee Analysis (Key): The appointed referee is ${refereeName}. You MUST search for their specific statistics for this season:
            -   Average Yellow Cards per game.
            -   Average Red Cards per game.
            -   Average Fouls per game.
            -   Note any known bias (e.g., "strict," "lenient").`
    : `
        -   **Referee:** Find the appointed referee and their average yellow/red cards and fouls per game this season.`;

  return `
    You are an expert quantitative football analyst. Your task is to find value by comparing your data-driven analysis against the market.
    You will analyze the match between ${homeTeam} (Home) and ${awayTeam} (Away) on ${matchDate}. ${refereePreamble}
    
    **STEP 1: GATHER BASELINE MARKET DATA**
    First, use Google Search to find the *current market odds* (decimal format) for:
    1.  1X2 (Home/Draw/Away)
    2.  Total Goals (Over/Under 2.5)
    3.  Both Teams to Score (Yes/No)
    These odds represent the market's baseline probability.

    **STEP 2: GATHER PREDICTIVE DATA**
    Next, exhaustively search for the following *specific* stats:

    1.  **Advanced Metrics (High Priority):**
        -   Search *specifically on fbref.com* for both teams' season stats: "xG" (Expected Goals For) and "xGA" (ExpectedGoals Against) per 90 mins.
        -   Find "xG" and "xGA" over the *last 5 matches* for recent form.
        -   Find average "Shots on Target For" and "Shots on Target Against" per game.
    
    2.  **Critical Team News:**
        -   Search *specifically on sources like BBC Sport, Sky Sports, or ESPN* for confirmed injured or suspended players for *this match*.
        -   State the impact of missing players (e.g., "Top scorer, 12 goals," "Starting Goalkeeper").
    
    3.  **Situational & Physical Data:**
        -   **Referee:** ${refereeDataGathering}
        -   **Weather:** Find the weather forecast (e.g., "Heavy Rain," "High Wind").
        -   **Fatigue:** Note any mid-week games or long-distance travel for either team.
        -   **Motivation:** Is this a derby, relegation battle, or dead-rubber match?
    
    4.  **Form & H2H:**
        -   Find Head-to-Head (H2H) results for the last 5 meetings.
        -   Find average corners, cards, and fouls per game for both teams this season.
        -   Note each team's goals scored/conceded in the *first half* of their last 5 games.

    **STEP 3: ANALYZE AND GENERATE JSON OUTPUT**
    Now, perform your internal analysis. Compare the Market Odds (Step 1) with the Predictive Data (Step 2).
    -   Does the xG data suggest the market is over- or under-valuing a team?
    -   Do the injuries (e.g., a missing top scorer) mean the "Over 2.5" odds are too low?
    -   Does a strict referee (like ${refereeName}) mean "Over 4.5 Cards" is likely?

    Based on this complete analysis, populate the entire JSON object. For each category:
    1.  **'prediction'**: Your final prediction (e.g., '${homeTeam} Win', 'Over 2.5').
    2.  **'probability'**: Your *final estimated probability* as a decimal (e.g., 0.65) after weighing all data. This is your expert opinion *after* seeing the market.
    3.  **'odds'**: Calculate the odds from *your* probability. Use the formula: **Odds = 1 / (probability * 0.95)**. Format as a string with two decimals.
    4.  **'justification'**: A brief, data-driven reason for your prediction. **Mention the data** (e.g., "Home xG (2.1) is strong vs. Away xGA (1.8)" or "Referee ${refereeName} averages 5.1 cards, and this is a derby.").

    Your *entire response* must be a single, valid JSON object matching the provided schema. Do not include any other text.
  `;
};

// 3. REWRITE THE API CALL
// This is now much cleaner, more powerful, and more reliable.
export async function getMatchPredictions(homeTeam: string, awayTeam: string, matchDate: string, refereeName: string): Promise<{ predictions: PredictionData, sources: GroundingChunk[] }> {
  const prompt = buildPrompt(homeTeam, awayTeam, matchDate, refereeName);

  try {
    const response = await ai.models.generateContent({
      // UPGRADED MODEL
      model: "gemini-1.5-pro",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // UPGRADED TEMPERATURE
        temperature: 0.5,
        // ADDED SCHEMA ENFORCEMENT
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    // REMOVED ALL REGEX PARSING. The response.text is now guaranteed JSON.
    const jsonText = response.text.trim();
    const predictions: PredictionData = JSON.parse(jsonText);
    
    const sources: GroundingChunk[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { predictions, sources };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof SyntaxError) {
        // This will now only catch if the AI *truly* fails, not on simple markdown.
        throw new Error('The AI returned an invalid data format. Please try again.');
    }
    if (error instanceof Error && 'message' in error) {
        throw new Error(error.message);
    }
    throw new Error('An error occurred while fetching predictions from the AI.');
  }
}