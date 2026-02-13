
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini API client using the environment variable directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWorkout = async (goal: string, level: number) => {
  const prompt = `Crie um plano de treino fitness para um usuário com o objetivo de "${goal}" e nível de condicionamento ${level}. 
  O plano deve conter exercícios práticos para fazer em casa ou na academia. 
  Retorne o plano em formato JSON estrito conforme o schema.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Nome do treino" },
          description: { type: Type.STRING, description: "Descrição curta" },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sets: { type: Type.INTEGER },
                reps: { type: Type.STRING },
                weight: { type: Type.STRING, description: "Peso sugerido ou corporal" }
              },
              required: ["name", "sets", "reps"]
            }
          }
        },
        required: ["name", "description", "exercises"]
      }
    }
  });

  try {
    // Access the .text property directly to get the generated string.
    const resultText = response.text;
    if (!resultText) return null;
    return JSON.parse(resultText);
  } catch (e) {
    console.error("Erro ao processar JSON do Gemini", e);
    return null;
  }
};
