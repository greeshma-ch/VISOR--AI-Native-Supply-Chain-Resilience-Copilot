import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ResourceBriefing {
  summary: string;
  keyPoints: string[];
  status: string;
}

export interface ResourceDocument {
  title: string;
  summary: string;
  keyPoints: string[];
  executiveSummary: string;
  detailedAnalysis: string;
  riskAssessment: string;
  operationalProtocol: string;
  mitigationStrategies: string;
  classification: string;
}

export const generateResourceBriefing = async (title: string, location: string, type: string): Promise<ResourceBriefing> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional intelligence briefing for a ${type} titled "${title}" located in "${location}". 
      The briefing should be comprehensive and sound like a high-level supply chain intelligence report. 
      Provide a detailed summary and at least 5 key intelligence points.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A detailed 3-4 sentence summary of the resource." },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 key intelligence bullet points." },
            status: { type: Type.STRING, description: "A short status like 'Critical Analysis' or 'Operational Update'." }
          },
          required: ["summary", "keyPoints", "status"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating briefing:", error);
    return {
      summary: `Strategic analysis for ${title}. Focuses on regional logistics and node synchronization. This report evaluates the current supply chain stability and identifies potential bottlenecks in the ${location} region.`,
      keyPoints: [
        "Risk assessment active for regional nodes",
        "Operational stability monitoring in progress",
        "Geopolitical factor analysis initiated",
        "Logistics throughput optimization identified",
        "Secondary supply route verification pending"
      ],
      status: "Live Analysis"
    };
  }
};

export const generateResourceDocument = async (title: string, location: string, type: string): Promise<ResourceDocument> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a highly detailed, multi-page intelligence document for a ${type} titled "${title}" in "${location}". 
      The document must be comprehensive and professional.
      Include the following sections:
      1. Summary & Key Points: A high-level briefing.
      2. Executive Summary: Detailed overview.
      3. Detailed Analysis: In-depth technical breakdown of the situation.
      4. Risk Assessment: Specific threats and their impact.
      5. Operational Protocol: Step-by-step instructions for personnel.
      6. Mitigation Strategies: Long-term solutions and resilience planning.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            executiveSummary: { type: Type.STRING },
            detailedAnalysis: { type: Type.STRING },
            riskAssessment: { type: Type.STRING },
            operationalProtocol: { type: Type.STRING },
            mitigationStrategies: { type: Type.STRING },
            classification: { type: Type.STRING, description: "e.g., TOP SECRET, INTERNAL ONLY" }
          },
          required: ["title", "summary", "keyPoints", "executiveSummary", "detailedAnalysis", "riskAssessment", "operationalProtocol", "mitigationStrategies", "classification"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating document:", error);
    return {
      title,
      summary: `Strategic analysis for ${title}. Focuses on regional logistics and node synchronization.`,
      keyPoints: ["Risk assessment active", "Operational stability monitoring", "Geopolitical factor analysis"],
      executiveSummary: "Strategic intelligence vectors and operational protocols for the current fiscal period.",
      detailedAnalysis: "The current landscape shows significant shifts in regional logistics patterns. Data from maritime sensors suggests a trend towards decentralized distribution hubs to mitigate single-point-of-failure risks.",
      riskAssessment: "Telemetry indicates regional instability across key maritime trade routes. Primary risks include port congestion, labor shortages, and geopolitical tensions impacting transit times.",
      operationalProtocol: "Nodes identified as RISKY must initiate Level 4 Mitigation Plan. This involves immediate rerouting of high-priority shipments and activation of secondary supplier agreements.",
      mitigationStrategies: "Implementation of AI-driven predictive analytics for route optimization and investment in regional warehousing to buffer against transit delays.",
      classification: "INTERNAL CLASSIFIED"
    };
  }
};
