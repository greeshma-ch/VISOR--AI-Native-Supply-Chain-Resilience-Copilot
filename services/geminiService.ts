
import { GoogleGenAI, Type } from "@google/genai";
import { IntelligenceBrief, Supplier, ImpactAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSupplierIntelligence = async (supplier: Supplier, weatherData?: any, isSimulated: boolean = false): Promise<IntelligenceBrief> => {
  const weatherContext = weatherData 
    ? `Current weather at ${supplier.location}: ${weatherData.weather[0].description}, Temperature: ${weatherData.main.temp}°C, Humidity: ${weatherData.main.humidity}%, Wind Speed: ${weatherData.wind.speed}m/s.`
    : "Use your search tools to find current weather impact.";

  const simulationContext = isSimulated 
    ? "CRITICAL SIMULATION MODE: Ignore all real-time data. Generate an imaginative 'Crisis Scenario' for this node. The overall suggestedStatus MUST be RISKY. Describe a severe disruption like a total infrastructure collapse, cyber-siege, or extreme natural disaster specific to this city."
    : "";

  const prompt = `Role: You are a Precision Logistics Intelligence Engine.
  
  Task: Analyze Weather and News data to generate a unified "Risk Status" for ${supplier.name} located in ${supplier.location}.

  ${simulationContext}

  Search Instructions:
  - Use your search tools to find current news, labor strikes, port conditions, or geopolitical events specifically in ${supplier.location} and the surrounding region.
  - Focus on news from the last 7 days that could impact the ${supplier.category} sector.

  The Logic (Balanced Assessment):
  1. Baseline: The default status is STABLE (Green). Only escalate if there is clear, evidence-based disruption.
  2. Priority One (Critical Blockers): Only use RISKY (Red) for severe, immediate threats that halt operations (e.g., major port closures, active natural disasters, national strikes).
  3. Priority Two (Environmental Metrics): Cross-reference weather with operational context. "Rain" is normal for many regions; only "Heavy Rain" or "Storms" that impact logistics should trigger CAUTION (Yellow).
  4. Priority Three (Nuance): A single "Caution" news item should not necessarily make the entire node "Caution" if other signals are stable. Use your judgment to provide a weighted status.

  Constraint Checklist:
  - Do not hallucinate risks. If the data is neutral, the status MUST be STABLE.
  - The "vectorSummary" must explain the reasoning behind the status.
  - Ensure the "suggestedStatus" is a realistic reflection of the overall situation, not just the worst-case scenario of a single data point.

  Context:
  ${weatherContext}

  Categorization Logic:
  - STABLE (Green): Routine operations. Normal weather for the region. No significant negative news.
  - CAUTION (Yellow): Potential delays. Weather advisories (moderate snow/rain). Minor labor disputes or local congestion.
  - RISKY (Red): Severe disruption. Weather warnings (hurricanes, floods). Major strikes, geopolitical conflict, or critical infrastructure failure.

  Include:
  1. vectorSummary: Concise analysis of conflicting data points.
  2. weatherStatus: Real-time weather impact on their specific region.
  3. todayFeed: News or events happening today (within the last 24 hours).
  4. recentFeed: News or events happening recently (within the last 7 days, excluding today).
  5. historicalContext: Historical context of disruptions for this region.
  6. mitigationSteps: Specific, actionable steps to mitigate identified risks.
  7. confidenceScore: 1-10 based on source verification.
  8. alternativeSuppliers: Two alternative suppliers for ${supplier.category}.
  
  For each feed item, provide a title, a status (STABLE, CAUTION, or RISKY), and a specific insight.
  
  Finally, provide an overall suggestedStatus (STABLE, CAUTION, or RISKY) based on the strict hierarchy logic.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vectorSummary: { type: Type.STRING },
            weatherStatus: { type: Type.STRING },
            suggestedStatus: { type: Type.STRING, enum: ["STABLE", "CAUTION", "RISKY"] },
            todayFeed: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["STABLE", "CAUTION", "RISKY"] },
                  insight: { type: Type.STRING }
                },
                required: ["title", "status", "insight"]
              }
            },
            recentFeed: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["STABLE", "CAUTION", "RISKY"] },
                  insight: { type: Type.STRING }
                },
                required: ["title", "status", "insight"]
              }
            },
            historicalContext: { type: Type.STRING },
            mitigationSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            confidenceScore: { type: Type.NUMBER },
            alternativeSuppliers: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["vectorSummary", "weatherStatus", "suggestedStatus", "todayFeed", "recentFeed", "historicalContext", "mitigationSteps", "confidenceScore", "alternativeSuppliers"]
        }
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Search Result",
      uri: chunk.web?.uri || "#"
    })) || [];

    return {
      supplierId: supplier.id,
      summary: data.vectorSummary, // Map vectorSummary to summary for backward compatibility if needed
      vectorSummary: data.vectorSummary,
      weatherStatus: data.weatherStatus,
      suggestedStatus: data.suggestedStatus,
      todayFeed: data.todayFeed,
      recentFeed: data.recentFeed,
      historicalContext: data.historicalContext,
      recommendations: data.mitigationSteps, // Map mitigationSteps to recommendations
      mitigationSteps: data.mitigationSteps,
      confidenceScore: data.confidenceScore,
      alternativeSuppliers: data.alternativeSuppliers,
      lastUpdated: new Date().toISOString(),
      sources: sources
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateImpactAnalysis = async (supplier: Supplier, isSimulated: boolean): Promise<ImpactAnalysis> => {
  const simulationPrompt = isSimulated 
    ? "CRITICAL: This is a simulation. IGNORE live data. Generate a 'Critical Disruption' report (e.g., Port Closure, Cyber Attack, or Major Infrastructure Failure) for this specific city."
    : "Analyze the node's current weather and news to identify potential logistics bottlenecks.";

  const prompt = `Role: Supply Chain Risk Architect.
  Task: Generate an AI Impact Analysis for ${supplier.name} in ${supplier.location}.
  
  ${simulationPrompt}
  
  Output Requirements:
  1. bottleneck: Identify a specific physical or digital bottleneck in ${supplier.location}.
  2. estDelay: Provide a realistic estimated delay (e.g., "48-72 Hours" or "5-7 Days").
  3. strategicAction: Provide a specific, high-level strategic action for the city of ${supplier.location}.
  
  Return the response in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bottleneck: { type: Type.STRING },
            estDelay: { type: Type.STRING },
            strategicAction: { type: Type.STRING }
          },
          required: ["bottleneck", "estDelay", "strategicAction"]
        }
      },
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Impact Analysis Error:", error);
    throw error;
  }
};

export const groundMapLocation = async (supplier: Supplier) => {
  const prompt = `Provide real-time geographic and operational context for the supplier ${supplier.name} located at ${supplier.location}. Use Google Maps to verify their exact location and provide any nearby infrastructure risks (ports, airports, major highways) that could affect logistics.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }]
      },
    });

    const text = response.text || "";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const mapsLinks = chunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        title: chunk.maps.title || "Map Location",
        uri: chunk.maps.uri
      }));

    return {
      text,
      links: mapsLinks
    };
  } catch (error) {
    console.error("Gemini Grounding Error:", error);
    return { text: "Live grounding unavailable.", links: [] };
  }
};
