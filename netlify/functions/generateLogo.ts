
import { GoogleGenAI } from "@google/genai";
import type { Handler } from "@netlify/functions";

// Make sure to set the API_KEY environment variable in your Netlify project settings
const apiKey = process.env.API_KEY;

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  if (!apiKey) {
    console.error('API_KEY environment variable not set.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key is not configured on the server.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  try {
    const { prompt } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required.' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
    
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const image = response.generatedImages[0];
      if (image.image?.imageBytes) {
        return {
          statusCode: 200,
          body: JSON.stringify({ imageB64: image.image.imageBytes }),
          headers: { 'Content-Type': 'application/json' },
        };
      }
    }

    throw new Error('No image was generated. The API response may have been empty or blocked.');

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to generate logo. ${errorMessage}` }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};

export { handler };
