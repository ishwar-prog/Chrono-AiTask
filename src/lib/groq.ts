import OpenAI from "openai";

// Groq provides an OpenAI-compatible API endpoint built for incredible speed!
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1", // Point directly at Groq hardware
});

/**
 * Sends a prompt to Groq (Llama 3 70B) and returns the extremely fast text response.
 */
export async function askGroq(prompt: string, temperature = 0.3): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in .env.local. Please add a valid key.");
  }

  const MAX_RETRIES = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile", // Powerful 70-billion parameter model optimized for logic
        messages: [{ role: "user", content: prompt }],
        temperature: temperature,
      });
      
      const text = response.choices[0]?.message?.content;
      
      if (!text || text.trim().length === 0) {
        throw new Error("Groq returned an empty response.");
      }
      
      return text;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // If we get an error on Groq, we'll try again unless it's explicitly fatal
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 800)); // wait ~800ms to recover
      }
    }
  }

  throw lastError || new Error("Groq request failed after multiple retries.");
}

/**
 * Extracts a JSON array from an AI text response.
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
