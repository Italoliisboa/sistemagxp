
import { GoogleGenAI, Type } from "@google/genai";

export const generateWorkout = async (goal: string, level: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Crie um plano de treino fitness para um usuário com o objetivo de "${goal}" e nível de condicionamento ${level}. 
  Retorne o plano em formato JSON estrito.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.INTEGER },
                  reps: { type: Type.STRING },
                  weight: { type: Type.STRING }
                },
                required: ["name", "sets", "reps"]
              }
            }
          },
          required: ["name", "description", "exercises"]
        }
      }
    });

    const resultText = response.text;
    return resultText ? JSON.parse(resultText) : null;
  } catch (e) {
    console.error("Erro Gemini:", e);
    return null;
  }
};
