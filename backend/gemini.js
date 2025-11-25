
const { GoogleGenAI, Type } = require("@google/genai");
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Replicate the logic from the frontend service, but secure
async function parseNote(text, existingNotes, timezone) {
  try {
    const now = new Date().toISOString();
    const contextNotes = existingNotes.map(n => ({
      id: n.id,
      content: n.content,
      schedule: n.scheduleDate || 'none'
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Current time: ${now}. User Timezone: ${timezone}.
        Existing Notes Context: ${JSON.stringify(contextNotes)}
        User Input: "${text}"
        
        Tasks:
        1. Determine action (CREATE or UPDATE).
        2. Extract summary, tags, scheduleDate.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            scheduleDate: { type: Type.STRING, nullable: true },
            isEvent: { type: Type.BOOLEAN },
            action: { type: Type.STRING, enum: ["CREATE", "UPDATE"] },
            targetId: { type: Type.STRING, nullable: true }
          }
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (err) {
    console.error("AI Parse Error", err);
    throw err;
  }
}

async function analyzeNotes(notesSummary) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
      Analyze these notes in a brutalist style:
      ${notesSummary}
      Identify focus, completion rate, and roast the user. Max 100 words. Uppercase.
    `
  });
  return response.text;
}

module.exports = { parseNote, analyzeNotes };
