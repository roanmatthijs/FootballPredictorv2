
import { GoogleGenAI } from "@google/genai";
import { PredictionData, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const buildPrompt = (homeTeam: string, awayTeam: string, matchDate: string, refereeName: string): string => {
  const refereePreamble = refereeName ? `The appointed referee is ${refereeName}.` : '';
  const refereeDataGathering = refereeName
    ? `
        -   **Referee Analysis (Key): The appointed referee is ${refereeName}. You MUST search for their specific statistics for this season (or last season if this season is new):**
            -   **Average Yellow Cards per game.**
            -   **Average Red Cards per game.**
            -   **Note any known bias (e.g., "known to be strict," "lenient," "favors home teams," "strict on time-wasting").**`
    : `
        -   **Referee:** Find the appointed referee and their average yellow/red cards and fouls per game this season.`;

  const referee1X2Analysis = refereeName
    ? `-   *Further Adjust* based on **Situational Data**: (e.g., "Away team has severe travel fatigue," **"The referee, ${refereeName}, is very strict (e.g., 5.0 yellows/game), which will hurt the aggressive/physical away team."**).`
    : `-   *Further Adjust* based on **Situational Data**: (e.g., "Away team has severe travel fatigue," "A strict referee could hurt the more aggressive team.").`;

  const refereeGoalsAnalysis = refereeName
    ? `-   ***Also Adjust* for **Referee**: (e.g., "Referee ${refereeName} is lenient, which may lead to a more open, flowing game, favoring Over 2.5." or "Referee ${refereeName} is strict and stops play often, favoring Under 2.5.").**`
    : `-   ***Also Adjust* for **Referee**: (e.g., "A lenient referee may lead to a more open, flowing game, favoring Over 2.5." or "A strict referee who stops play often favors Under 2.5.").**`;

  const refereeJsonJustification = refereeName
    ? `Base your justifications *directly* on the data from Step 1 (e.g., "Justification: Home xG of 2.1 in last 5 games. **Also, referee ${refereeName} averages 5.1 yellow cards, which is likely to disrupt the away team's physical style.**").`
    : `Base your justifications *directly* on the data from Step 1.`;

  return `
    You are an expert football analyst and data scientist. Your task is to predict the outcome of a football match between ${homeTeam} (Home) and ${awayTeam} (Away).
    The reference date for all 'recent' data is ${matchDate}. ${refereePreamble}
    Use Google Search to gather the most up-to-date information available.

    **STEP 1: EXHAUSTIVE DATA GATHERING**
    Exhaustively search for and analyze the following data points for both teams. Find specific numbers and qualitative facts for everything.

    1.  **Critical Team News (Highest Priority):**
        -   **Injuries & Suspensions:** Find confirmed lists of injured or suspended players for *this match*.
        -   **Player Impact:** State the importance of any missing players (e.g., "Top scorer, 12 goals," "Starting Goalkeeper," "Key Defender").
        -   **Lineup/Morale:** Search for recent news on player morale, manager pressure, or expected lineup changes/rotations.

    2.  **Advanced Underlying Metrics (High Priority):**
        -   **Expected Goals (xG):** Find the "xG For" (xGF) and "xG Against" (xGA) per game for both teams this season (league matches only).
        -   **xG Form (Last 5 Games):** Find the xGF and xGA over the *last 5 matches* to see recent performance trends.
        -   **Shot Statistics:** Find average "Shots on Target For" and "Shots on Target Against" per game.
        -   **Possession:** Find average possession percentage for both teams.

    3.  **Recent Form (Last 6 Official Matches):**
        -   Note Wins, Draws, Losses.
        -   Note *actual* Goals Scored and Goals Conceded.
        -   **First Half Goals:** Note how many goals each team scored and conceded in the *first half* of these last 6 games.

    4.  **Home/Away Specific Form (Last 6 Home/Away League Matches):**
        -   Analyze ${homeTeam}'s last 6 home league games (W/D/L, GS, GC, xGF, xGA).
        -   Analyze ${awayTeam}'s last 6 away league games (W/D/L, GS, GC, xGF, xGA).

    5.  **League Standings & Context:**
        -   Current league position, points, goal difference, and matches played.
        -   **Match Importance:** Is this a derby, a relegation battle, a title decider? Is one team "safe" mid-table with no motivation?
        -   **Context:** Does either team have a major (e.g., Champions League) match before or after this one that might cause them to rest players?

    6.  **Head-to-Head (H2H) (Last 5 Meetings):**
        -   List the results, scores, and *dates*. (A match from 5 years ago is less relevant).
        -   Note the average total goals and if BTTS occurred.

    7.  **Advanced Situational & Physical Data (The "Edge"):**
        ${refereeDataGathering}
        -   **Weather:** Find the weather forecast for the match (e.g., "Heavy Rain," "High Wind > 20mph," "Clear," "High Heat").
        -   **Travel & Fatigue:** Note any long-distance travel for the away team or if this is the 3rd game in 7-8 days for either side.
        -   **Managerial Tactics:** Note the H2H record between the two managers and their primary tactical styles (e.g., "Possession vs. Counter-Attack").
        -   **Set Pieces & Corners:** Find stats on "goals from set pieces," "goals conceded from set pieces," and average corners for/against per game for both teams.

    **STEP 2: PREDICTION ANALYSIS (Your Reasoning)**
    Based *only* on the data from Step 1, perform a step-by-step analysis:

    1.  **1X2 Prediction:**
        -   Compare the teams' **xG Form** and **Home/Away xG** data. This is your baseline.
        -   *Adjust* this baseline based on **Critical Team News**. (e.g., "Home team has better xG, but their top scorer is out, so I will adjust their win probability down.").
        ${referee1X2Analysis}
        -   Factor in **Motivation** and **Recent Form**.
        -   State your final prediction and confidence.

    2.  **Total Goals Prediction:**
        -   Calculate the combined average xG (Home xGF + Away xGA) and (Away xGF + Home xGA). This is your baseline.
        -   *Adjust* based on **Team News**. (e.g., "Both teams have high xG, but key strikers are out, so I will predict Under 2.5.").
        -   *Further Adjust* based on **Weather**: (e.g., "High wind and heavy rain forecast. I am heavily adjusting my prediction to Under 2.5.").
        ${refereeGoalsAnalysis}
        -   State your Over/Under prediction and confidence.

    3.  **Both Teams to Score (BTTS) Prediction:**
        -   Look at the xGF and xGA for *both* teams. Do both teams create a lot (high xGF) and also concede a lot (high xGA)?
        -   Look at recent form and H2H (how often did BTTS hit?).
        -   *Adjust* based on missing defensive players or star strikers.
        -   *Further Adjust* based on **Set Piece** data (e.g., "Away team is poor at defending set pieces, so Home team is likely to score.").
        -   State your Yes/No prediction and confidence.

    4.  **First Half Goals Prediction:**
        -   Analyze the "First Half Goals" data from Step 1 (Point 3).
        -   Do these teams start fast or slow? Do their **Managerial Tactics** favor a fast start?
        -   State your Over/Under 0.5 or 1.5 prediction and confidence.

    **STEP 3: GENERATE JSON OUTPUT**
    Your entire response MUST be a single, valid JSON object that adheres to the provided schema. Do not include any text, explanations, or markdown formatting before or after the JSON object.
    ${refereeJsonJustification}
    For each prediction, you must provide:
    1.  A 'prediction' string.
    2.  A 'probability' as a decimal number between 0 and 1 (e.g., 0.65 for 65%).
    3.  Decimal 'odds' calculated from the probability, with a 5% bookmaker's margin applied. Use the formula: Odds = 1 / (probability * 0.95). Format the odds as a string with two decimal places.
    4.  A brief 'justification' string that summarizes your reasoning from Step 1.
    
    The JSON object must have the following structure:
    {
      "matchWinner": {
        "prediction": "string (e.g., '${homeTeam} Win', '${awayTeam} Win', 'Draw')",
        "probability": "number (e.g., 0.45)",
        "odds": "string (e.g., '2.34')",
        "justification": "string (Brief justification)"
      },
      "bothTeamsToScore": {
        "prediction": "string ('Yes' or 'No')",
        "probability": "number (e.g., 0.70)",
        "odds": "string (e.g., '1.50')",
        "justification": "string (Brief justification)"
      },
      "totalGoals": {
        "prediction": "string (e.g., 'Over 2.5', 'Under 2.5')",
        "probability": "number (e.g., 0.60)",
        "odds": "string (e.g., '1.75')",
        "justification": "string (Brief justification)"
      },
      "firstHalfGoals": {
        "prediction": "string (e.g., 'Over 0.5', 'Under 1.5')",
        "probability": "number (e.g., 0.85)",
        "odds": "string (e.g., '1.24')",
        "justification": "string (Brief justification)"
      },
      "totalCorners": {
        "prediction": "string (e.g., 'Over 9.5', 'Under 10.5')",
        "probability": "number (e.g., 0.55)",
        "odds": "string (e.g., '1.90')",
        "justification": "string (Brief justification based on attacking styles and stats)"
      },
      "totalCards": {
        "prediction": "string (e.g., 'Over 4.5', 'Under 3.5')",
        "probability": "number (e.g., 0.62)",
        "odds": "string (e.g., '1.70')",
        "justification": "string (Brief justification based on match intensity and disciplinary records)"
      },
      "totalFouls": {
        "prediction": "string (e.g., 'Over 22.5', 'Under 21.5')",
        "probability": "number (e.g., 0.58)",
        "odds": "string (e.g., '1.82')",
        "justification": "string (Brief justification based on playing styles and H2H physicality)"
      }
    }
  `;
};

export async function getMatchPredictions(homeTeam: string, awayTeam: string, matchDate: string, refereeName: string): Promise<{ predictions: PredictionData, sources: GroundingChunk[] }> {
  const prompt = buildPrompt(homeTeam, awayTeam, matchDate, refereeName);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // Lower temperature for more deterministic, fact-based output
      },
    });
    
    // The model may wrap the JSON in markdown backticks, so we need to extract it.
    let jsonText = response.text.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonText = jsonMatch[1];
    } else {
        // Fallback for cases where it might just be the object without markdown
        const startIndex = jsonText.indexOf('{');
        const endIndex = jsonText.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
            jsonText = jsonText.substring(startIndex, endIndex + 1);
        }
    }

    const predictions: PredictionData = JSON.parse(jsonText);
    const sources: GroundingChunk[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { predictions, sources };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof SyntaxError) {
        throw new Error('The AI returned an invalid data format. Please try again.');
    }
    if (error instanceof Error && 'message' in error) {
        throw new Error(error.message);
    }
    throw new Error('An error occurred while fetching predictions from the AI.');
  }
}