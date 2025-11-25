import { GoogleGenAI, Type } from "@google/genai";
import { ParsedNoteData, Note } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseNoteWithGemini = async (
  text: string, 
  existingNotes: Note[] = [],
  userTimezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): Promise<ParsedNoteData> => {
  try {
    const now = new Date().toISOString();
    
    // Simplify existing notes for context window efficiency
    const contextNotes = existingNotes.map(n => ({
      id: n.id,
      content: n.content,
      schedule: n.scheduleDate || 'none'
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Current time: ${now}.
        User Timezone: ${userTimezone}.
        
        Existing Notes Context:
        ${JSON.stringify(contextNotes)}

        User Input: "${text}"

        Tasks:
        1. Determine if the user wants to CREATE a new note or UPDATE an existing one.
           - If the user says "Change meeting with X...", "Reschedule...", or refers to an existing event, set action to "UPDATE" and find the matching targetId from the context.
           - Otherwise, set action to "CREATE".
        2. Extract/Update summary.
        3. Extract/Update tags (remove #).
        4. Extract/Update schedule date (ISO 8601). If updating, replace the old date with the new one.
           - If "next monday", calculate based on Current Time.
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
          },
          required: ["summary", "tags", "isEvent", "action"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      summary: result.summary || text,
      tags: result.tags || [],
      scheduleDate: result.scheduleDate || null,
      isEvent: result.isEvent || false,
      action: result.action || 'CREATE',
      targetId: result.targetId || null
    };

  } catch (error) {
    console.error("Gemini parsing error:", error);
    const tags = (text.match(/#[a-zA-Z0-9_]+/g) || []).map(t => t.slice(1));
    return {
      summary: text,
      tags: tags,
      scheduleDate: null,
      isEvent: false,
      action: 'CREATE',
      targetId: null
    };
  }
};

export const analyzeUserProductivity = async (notes: Note[]): Promise<string> => {
    if (notes.length === 0) return "No data to analyze. Write something first.";

    const notesSummary = notes.map(n => 
        `- [${n.tags.join(', ')}] ${n.content} (${n.isDone ? 'COMPLETED' : 'PENDING'})`
    ).join('\n');

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `
                You are a brutally honest, neo-brutalist design persona AI.
                Analyze these user notes:
                ${notesSummary}

                1. Identify main focus areas.
                2. Comment on their completion rate (Done vs Pending).
                3. Roast them if they are lazy, Hype them if they are grinding.
                4. Max 100 words. Uppercase mostly. No markdown.
            `
        });
        return response.text || "ANALYSIS FAILED.";
    } catch (e) {
        console.error(e);
        return "SYSTEM ERROR. COULD NOT JUDGE YOU.";
    }
};