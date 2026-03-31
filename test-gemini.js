const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Say hello world");
    console.log(result.response.text());
  } catch (e) {
    console.error("ERROR 2.0-flash:", e.message);
    try {
      const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result2 = await model2.generateContent("Say hello world");
      console.log("1.5-flash worked:", result2.response.text());
    } catch (e2) {
      console.error("ERROR 1.5-flash:", e2.message);
    }
  }
}
test();
