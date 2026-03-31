import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Sends a prompt to Google Gemini and returns the text response.
 * Includes retry logic and clear error messages for quota issues.
 */
export async function askGemini(prompt: string, temperature = 0.3): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in .env.local. Please add a valid key.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { temperature },
  });

  const MAX_RETRIES = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error("Gemini returned an empty response.");
      }
      
      return text;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const errMsg = lastError.message.toLowerCase();

      // Quota exhausted — don't retry, surface immediately
      if (errMsg.includes("quota") || errMsg.includes("resource_exhausted") || errMsg.includes("429")) {
        throw new Error(
          "Gemini API quota exhausted. Please generate a new API key at https://aistudio.google.com/apikey and update GEMINI_API_KEY in .env.local"
        );
      }

      // On other errors, wait briefly then retry
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error("Gemini request failed after retries.");
}

/**
 * Extracts a JSON array from a Gemini text response.
 * Handles markdown backtick wrapping and conversational text around the JSON.
 */
export function extractJsonArray(text: string): unknown[] {
  // Step 1: Try to find content between ```json ... ``` blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Fall through to next strategy
    }
  }

  // Step 2: Try to find a raw JSON array pattern [...]
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {
      // Fall through
    }
  }

  // Step 3: Try parsing the entire text as JSON
  try {
    const parsed = JSON.parse(text.trim());
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Fall through
  }

  throw new Error("Could not extract valid JSON array from AI response.");
}
