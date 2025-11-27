import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SessionData, FullAnalysisResponse } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Schema for the analysis output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    results: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          session_id: { type: Type.STRING },
          risk_score: { type: Type.NUMBER, description: "0.0 to 1.0 float" },
          flagged: { type: Type.BOOLEAN },
          reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
          cluster_id: { type: Type.STRING, description: "Group ID if linked to other sessions (e.g. same hash)" },
        },
        required: ["session_id", "risk_score", "flagged", "reasons"],
      },
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        total_sessions: { type: Type.INTEGER },
        flagged_count: { type: Type.INTEGER },
        avg_risk: { type: Type.NUMBER },
        dominant_cluster: { type: Type.STRING },
      },
      required: ["total_sessions", "flagged_count", "avg_risk"],
    },
  },
  required: ["results", "summary"],
};

export const analyzeSessions = async (sessions: SessionData[]): Promise<FullAnalysisResponse> => {
  const ai = getAIClient();
  
  const prompt = `
    Act as a sophisticated Fraud Detection Engine. Analyze the following JSON dataset of web sessions.
    
    Apply these heuristics and return a risk score (0-1):
    1. **Behavioral Anomalies:** Extremely fast click speeds (<50ms) or form fills (<2s) suggest bots.
    2. **Fingerprint Collisions:** Different IPs sharing the exact same canvas_hash and font lists suggest multi-account fraud (Sybil attack).
    3. **IP/Location:** (Simulated based on IP string patterns) Check for high-risk IPs.
    4. **Consistency:** High pages visited with very low duration is suspicious.

    Group suspicious sessions into 'cluster_id' if they share fingerprints but have different identities.
    
    Input Data:
    ${JSON.stringify(sessions, null, 2)}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
    },
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as FullAnalysisResponse;
};

// Schema for generating sample data
const sampleDataSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      session_id: { type: Type.STRING },
      ip: { type: Type.STRING },
      browser: {
        type: Type.OBJECT,
        properties: {
          user_agent: { type: Type.STRING },
          fonts: { type: Type.ARRAY, items: { type: Type.STRING } },
          canvas_hash: { type: Type.STRING },
        },
      },
      behavior: {
        type: Type.OBJECT,
        properties: {
          click_speed_ms: { type: Type.INTEGER },
          form_fill_time_s: { type: Type.NUMBER },
          pages_visited: { type: Type.INTEGER },
        },
      },
    },
    required: ["session_id", "ip", "browser", "behavior"],
  },
};

export const generateSampleData = async (): Promise<SessionData[]> => {
  const ai = getAIClient();

  const prompt = `
    Generate a JSON dataset of 10 web sessions for testing a fraud detection system.
    Include a mix of:
    1. Normal legitimate users (realistic varied IPs, standard behavior).
    2. A "Bot Farm" attack: 3-4 sessions with different IPs but the SAME 'canvas_hash' and 'fonts', and inhumanly fast 'click_speed_ms' (e.g., <30ms).
    3. A single high-risk anomaly (e.g., Tor exit node IP style, very weird user agent).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: sampleDataSchema,
    },
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as SessionData[];
};