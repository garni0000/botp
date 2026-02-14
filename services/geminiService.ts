
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. AI features will not work.");
    return null;
  }
  // Initialize with named parameter as required by the SDK guidelines
  return new GoogleGenAI({ apiKey });
};

export const generateDescriptionFromMedia = async (base64Data: string, mimeType: string): Promise<{ title: string; description: string }> => {
  const ai = getAiClient();
  if (!ai) {
    return {
      title: "Exclusive Media",
      description: "Unlock to view this exclusive content."
    };
  }

  try {
    // Remove data URL prefix if present to send raw base64 data
    const cleanBase64 = base64Data.split(',')[1] || base64Data;

    // Use recommended model for basic multimodal/vision tasks
    const model = "gemini-3-flash-preview";
    const prompt = `
      Analyze this ${mimeType.startsWith('video') ? 'video' : 'image'}.
      1. Create a short, catchy, intriguing title (max 5 words).
      2. Create a persuasive description for selling this content (max 2 sentences).
    `;

    // Use generateContent with responseSchema for robust and structured output
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Short catchy title'
            },
            description: {
              type: Type.STRING,
              description: 'Persuasive selling description'
            }
          },
          required: ["title", "description"]
        }
      }
    });

    // Access the text property directly from the response
    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      title: "Premium Content",
      description: "This exclusive media is locked. Pay to reveal the content hidden behind the blur."
    };
  }
};
