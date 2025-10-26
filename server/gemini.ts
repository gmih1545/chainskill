import { GoogleGenAI } from "@google/genai";
import type { Question } from "@shared/schema";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface GeneratedTest {
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

export async function generateTestQuestions(topic: string): Promise<Question[]> {
  try {
    const systemPrompt = `You are an expert test creator. Generate exactly 5 multiple-choice questions about "${topic}".
Each question should:
1. Be clear and specific
2. Have exactly 4 options
3. Have only one correct answer
4. Be challenging but fair
5. Test practical knowledge

Respond with JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0
    }
  ]
}

The correctAnswer is the index (0-3) of the correct option.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  correctAnswer: { type: "number" }
                },
                required: ["question", "options", "correctAnswer"]
              }
            }
          },
          required: ["questions"]
        }
      },
      contents: `Generate 5 challenging multiple-choice questions about: ${topic}`,
    });

    const rawJson = response.text;

    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const data: GeneratedTest = JSON.parse(rawJson);

    if (!data.questions || data.questions.length !== 5) {
      throw new Error("Invalid number of questions generated");
    }

    // Convert to Question[] format with IDs
    return data.questions.map((q, index) => ({
      id: `q-${index + 1}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));

  } catch (error) {
    console.error("Error generating test questions:", error);
    throw new Error(`Failed to generate test: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
