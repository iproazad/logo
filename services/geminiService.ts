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
    
    // Attempt to extract a more specific message from the error object
    let errorMessage = 'An unknown error occurred. Check the developer console for more details.';
    if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = (error as Error).message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Check the extracted message for known, user-actionable issues
    if (errorMessage.includes('API key not valid')) {
        throw new Error('The API key is not valid. Please check your key in the Google Cloud project.');
    }
    if (errorMessage.toLowerCase().includes('billing')) {
        throw new Error('Billing is not enabled for the project. The Imagen API requires a billed account. Please enable billing in your Google Cloud account.');
    }
    if (errorMessage.toLowerCase().includes('permission denied') || errorMessage.toLowerCase().includes('api not enabled')) {
        throw new Error('API permission denied. Ensure the "Generative Language API" or "Vertex AI API" is enabled in your Google Cloud project.');
    }
     if (errorMessage.toLowerCase().includes('quota')) {
        throw new Error('You have exceeded your API quota. Please check your usage limits in Google Cloud.');
    }

    // For other errors, throw the specific message from the API.
    throw new Error(`Failed to generate logo: ${errorMessage}`);
  }
};