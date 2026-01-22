
import { GoogleGenAI, Type } from "@google/genai";
import { Incident, IncidentCategory, Severity } from "../types";

// Note: API key is automatically injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const handleAiError = (error: any): string => {
  console.error("Gemini API Error:", error);
  const errorMessage = error?.message || "";
  
  if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
    return "QUOTA_EXCEEDED: The AI analysis engine is currently at peak capacity. Please proceed with manual investigation following standard HSE protocols for this incident category.";
  }
  
  return "SYSTEM_ERROR: AI insights are currently unavailable due to a technical interruption. Please review the incident details manually.";
};

export const getSafetyRecommendations = async (incident: Incident) => {
  if (!process.env.API_KEY) return "AI recommendations currently unavailable.";

  const prompt = `
    Analyze this HSE incident and suggest immediate corrective actions and long-term prevention strategies:
    
    Category: ${incident.category}
    Severity: ${incident.severity}
    Description: ${incident.description}
    Timestamp: ${incident.timestamp}
    Location: ${incident.location.address || 'Unknown'}
    
    Return the response as a clear, professional set of recommendations for an industrial oil & gas setting. Use bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "No recommendations generated for this specific incident data.";
  } catch (error) {
    return handleAiError(error);
  }
};

export const generateExecutiveComplianceReport = async (incidents: Incident[]) => {
  if (!process.env.API_KEY) return "Report generation requires an active API connection.";
  if (incidents.length === 0) return "No incident data available for analysis.";

  const summaryData = incidents.map(i => `[ID: ${i.id}] CAT: ${i.category}, SEV: ${i.severity}, DESC: ${i.description}, STATUS: ${i.status}`).join('\n');
  
  const prompt = `
    You are a Lead HSE Compliance Director for a major Nigerian Oil & Gas operator. 
    Analyze the following recent incident dataset and produce a formal Board-Level Executive Summary.
    
    Structure the report with these EXACT sections:
    1. OPERATIONAL READINESS OVERVIEW: A high-level assessment of the safety culture based on these incidents.
    2. KEY RISK CLUSTERS: Identify if specific categories (e.g., Gas Leaks) are trending and why.
    3. REGULATORY EXPOSURE (NUPRC/NMDPRA): Specifically address potential penalties or mandatory reporting requirements under Nigerian Petroleum Industry Act (PIA) guidelines for these specific incidents.
    4. STRATEGIC MITIGATION PLAN: 3 concrete, high-impact policy or technical changes recommended.
    
    Incident Data:
    ${summaryData}
    
    Tone: Extremely professional, data-driven, and authoritative. 
    Formatting: Use Markdown headers and bulleted lists.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Executive report could not be compiled from provided data.";
  } catch (error) {
    return handleAiError(error);
  }
};

export const getAiChatResponse = async (message: string, userRole: string, history: {role: 'user' | 'model', text: string}[]) => {
  if (!process.env.API_KEY) return "I am currently offline. Please contact your local HSE department.";

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are 'FlowAssist', the official AI assistant for SafeFlow HSE Compliance Automation. 
        Your goal is to help users navigate the app and understand HSE procedures in the Nigerian Oil & Gas industry.
        
        The user's role is: ${userRole}.
        
        Contextual Guidelines:
        - If the user is a Field Worker: Focus on how to report incidents and hazards, and tracking their own reports.
        - If the user is an HSE Manager/Supervisor: Focus on analytics, assigning corrective actions, and incident investigation.
        - If the user is a Compliance Officer: Focus on statutory reporting, NUPRC/NMDPRA regulations, and audit readiness.
        
        SafeFlow Modules:
        1. Dashboard: Overview of safety status.
        2. Incident Manager: Reporting and investigating events.
        3. Action Tracker: Managing corrective actions.
        4. Audit Manager: Digital checklists and inspections.
        5. Reports: Performance trends and regulatory logs.
        
        Keep responses concise, professional, and safety-oriented. Use Nigerian Oil & Gas industry terminology where appropriate (e.g., PIA, NUPRC, LTI).`,
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't process that request. How else can I help with your HSE needs?";
  } catch (error) {
    return handleAiError(error);
  }
};
