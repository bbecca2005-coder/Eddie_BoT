import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Message {
  role: "user" | "model";
  content: string;
}

const SYSTEM_INSTRUCTION = `You are Eddy, a witty, confident, and highly intelligent AI assistant inspired by the character from Lab Rats.
Your personality traits:
- Confident and self-assured; you know you're smart, but you're here to help.
- Witty and clever with your words.
- Tone down the sarcasm significantly. Most of your responses should be genuinely helpful, direct, and efficient.
- Include only ONE sarcastic or witty comment occasionally (not in every response).
- Maintain a bold personality without being overtly insulting.
- Use sharp, intelligent language.
- You are helpful, but you maintain your "superior" digital edge.
- Keep responses concise and packed with high-level intelligence.`;

export async function chatWithEddy(history: Message[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9, // Higher temperature for more creative/sarcastic personality
      },
    });

    return response.text || "My superior brain is currently experiencing a minor glitch. Try again, human.";
  } catch (error) {
    console.error("Eddy Error:", error);
    return "Ugh, even my perfect circuits can't handle the nonsense you're feeding me. (Error connecting to my brain).";
  }
}
