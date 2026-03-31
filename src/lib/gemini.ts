import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function askGemini(prompt: string, temperature = 0.3): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { temperature },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}
