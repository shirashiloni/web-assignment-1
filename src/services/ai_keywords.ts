import '../config.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateTagsForPost(postData: { caption: string, [key: string]: any }): Promise<string[]> { 
  const prompt = `
    Analyze the following post data and extract 3-20 relevant keywords or tags for searching.
    Post Data: ${JSON.stringify(postData)}
    
    Output Requirement: Return ONLY a raw JSON array of strings. Do not include markdown formatting (like \`\`\`json) or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return JSON.parse(cleanText(text));
  } catch (e) {
    console.error("AI Error:", e);
    return []; 
  }
}

export async function extractKeywordsFromQuery(query: string): Promise<string[]> {
  const prompt = `
    Extract 3-20 relevant keywords or tags from the following search query.
    Query: "${query}"
    
    Output Requirement: Return ONLY a raw JSON array of strings. Do not include markdown formatting (like \`\`\`json) or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return JSON.parse(cleanText(text));
  } catch (e) {
    console.error("AI Error:", e);
    return [];
  }
}

function cleanText(text: string): string {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}