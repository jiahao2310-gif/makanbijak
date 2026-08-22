import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "missing-key"
);

export async function generateText(
  prompt: string,
  modelName = "gemini-3.6-flash"
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateWithImage(
  prompt: string,
  base64Image: string,
  mimeType = "image/jpeg",
  modelName = "gemini-3.6-flash"
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType } },
  ]);
  return result.response.text();
}
