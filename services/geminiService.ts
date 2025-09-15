
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a logo image using the Gemini API.
 * @param prompt The text prompt describing the desired logo.
 * @param apiKey The user's Gemini API key.
 * @returns A promise that resolves to the base64 encoded image string.
 */
export const generateLogoImage = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('API Key is missing. Please provide a valid Gemini API Key.');
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png', // Use PNG for better quality and potential transparency
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const image = response.generatedImages[0];
      if (image.image?.imageBytes) {
        return image.image.imageBytes;
      }
    }
    
    throw new Error('No image was generated. The response might have been blocked due to safety policies.');

  } catch (error) {
    console.error('Detailed error from Gemini API:', error);
    
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('The API key is not valid according to Google. Please generate a new key in your Google Cloud project.');
        }
        if (error.message.toLowerCase().includes('billing')) {
            throw new Error('Billing is not enabled for the project. Please check your Google Cloud account and enable billing.');
        }
        if (error.message.toLowerCase().includes('permission denied')) {
            throw new Error('API permission denied. Ensure the "Generative Language API" is enabled in your Google Cloud project.');
        }
         if (error.message.toLowerCase().includes('quota')) {
            throw new Error('You have exceeded your API quota. Please check your usage limits in Google Cloud.');
        }
    }
    
    // For any other error, provide a generic message but log the specific error for debugging.
    throw new Error('Failed to generate logo. Check the developer console (F12) for more details.');
  }
};
