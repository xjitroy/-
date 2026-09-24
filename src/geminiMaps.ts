// Gemini AI Service with Google Maps Grounding Tool
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini SDK with runtime key
const apiKey = process.env.GEMINI_API_KEY || (window as any).GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function queryMapsGroundingLocation(queryText: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide accurate geographic, route, and location details for Ranaghat Nadia West Bengal Highway sub division: ${queryText}`,
      config: {
        tools: [{ googleMaps: {} } as any],
        systemInstruction: "You are an assistant for Ranaghat Highway Sub Division (PWDTE), West Bengal. Provide clear location, chainage, roads, bridges, and nearby landmark details using Google Maps grounding."
      }
    });

    return response.text || 'তথ্য পাওয়া যায়নি।';
  } catch (error) {
    console.error("Gemini Maps Grounding Error:", error);
    // Graceful fallback to basic gemini-3.8-flash without maps tool
    try {
      const fallback = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Ranaghat Nadia West Bengal Highway sub division details for: ${queryText}`
      });
      return fallback.text || 'তথ্য সংগ্রহ করা যাচ্ছে না।';
    } catch (e) {
      return `লোকেশন অনুসন্ধান ব্যর্থ হয়েছে: ${(error as any)?.message || 'Network error'}`;
    }
  }
}
