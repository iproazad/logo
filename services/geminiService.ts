
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a detailed logo concept using the Gemini text model.
 * @param prompt The user's basic description of the desired logo.
 * @param apiKey The user's Gemini API key.
 * @returns A promise that resolves to the text string of the logo concept.
 */
export const generateLogoConcept = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('API Key is missing. Please provide a valid Gemini API Key.');
  }
  const ai = new GoogleGenAI({ apiKey });

  const fullPrompt = `Based on the following user request, generate a professional and creative logo concept. 
  Describe the visual elements, color palette, typography, and overall mood and symbolism of the logo. Be detailed and inspiring.
  
  User Request: "${prompt}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
       config: {
        systemInstruction: "You are a world-class branding expert and logo designer. Your task is to generate a detailed, creative, and professional concept for a logo based on the user's request. Do not generate images, code, or anything other than descriptive text for the logo concept.",
      }
    });

    if (response.text) {
      return response.text;
    }
    
    throw new Error('No concept was generated. The response might have been empty or blocked.');

  } catch (error) {
    console.error('Detailed error from Gemini API:', error);
    
    let errorMessage = 'An unknown error occurred. Check the developer console for details.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    if (errorMessage.includes('API key not valid')) {
        throw new Error('The API key is not valid. Please check your key and its permissions.');
    }
     if (errorMessage.toLowerCase().includes('quota')) {
        throw new Error('You have exceeded your API quota. Please check your usage limits in Google Cloud.');
    }
    
    throw new Error(`Failed to generate concept: ${errorMessage}`);
  }
};
