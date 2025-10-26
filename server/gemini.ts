import { GoogleGenAI } from "@google/genai";
import type { Question, Category } from "@shared/schema";

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

interface GeneratedCategories {
  categories: Array<{
    name: string;
  }>;
}

// Generate categories based on level and parent category
export async function generateCategories(level: number, parentCategory?: string): Promise<Category[]> {
  try {
    let systemPrompt = "";
    let userPrompt = "";

    if (level === 1) {
      // Main categories - increased to 10
      systemPrompt = `You are an expert in professional skills and career development. Generate exactly 10 main professional categories for skill testing.

Categories should cover diverse areas like:
- Technology/Development
- Design/Creative
- Business/Management
- Marketing/Sales
- Data/Analytics
- Operations/Support
- Finance/Accounting
- Healthcare/Medical
- Education/Training
- Engineering/Manufacturing

Respond with JSON in this exact format:
{
  "categories": [
    { "name": "Category Name" }
  ]
}`;
      userPrompt = "Generate 10 diverse main professional categories for skill assessment";
    } else if (level === 2) {
      // Narrow categories - increased to 15
      systemPrompt = `You are an expert in professional skills. Generate exactly 15 narrower subcategories within "${parentCategory}".

These should be specific areas within ${parentCategory} that professionals specialize in.

Respond with JSON in this exact format:
{
  "categories": [
    { "name": "Subcategory Name" }
  ]
}`;
      userPrompt = `Generate 15 specific subcategories within ${parentCategory}`;
    } else {
      // Specific categories - increased to 20
      systemPrompt = `You are an expert in professional skills. Generate exactly 20 very specific skill areas within "${parentCategory}".

These should be concrete, testable skills or technologies that professionals work with.

Respond with JSON in this exact format:
{
  "categories": [
    { "name": "Specific Skill Name" }
  ]
}`;
      userPrompt = `Generate 20 specific testable skills within ${parentCategory}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" }
                },
                required: ["name"]
              }
            }
          },
          required: ["categories"]
        }
      },
      contents: userPrompt,
    });

    const rawJson = response.text;

    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const data: GeneratedCategories = JSON.parse(rawJson);

    // Convert to Category[] format with IDs
    return data.categories.map((cat, index) => ({
      id: `cat-${level}-${index + 1}`,
      name: cat.name,
      level,
    }));

  } catch (error) {
    console.error("Error generating categories:", error);
    throw new Error(`Failed to generate categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate 10 test questions (updated from 5)
export async function generateTestQuestions(
  mainCategory: string,
  narrowCategory: string,
  specificCategory: string
): Promise<Question[]> {
  try {
    const topic = `${mainCategory} > ${narrowCategory} > ${specificCategory}`;
    const systemPrompt = `You are an expert test creator. Generate exactly 10 multiple-choice questions about "${specificCategory}" in the context of "${narrowCategory}" and "${mainCategory}".

Each question should:
1. Be clear and specific
2. Have exactly 4 options
3. Have only one correct answer
4. Be challenging but fair
5. Test practical knowledge
6. Be worth 10 points each (total 100 points)
7. Progress from easier to harder

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
      contents: `Generate 10 challenging multiple-choice questions about: ${topic}`,
    });

    const rawJson = response.text;

    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const data: GeneratedTest = JSON.parse(rawJson);

    if (!data.questions || data.questions.length !== 10) {
      throw new Error("Invalid number of questions generated");
    }

    // Convert to Question[] format with IDs and points
    return data.questions.map((q, index) => ({
      id: `q-${index + 1}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: 10, // Each question worth 10 points
    }));

  } catch (error) {
    console.error("Error generating test questions:", error);
    throw new Error(`Failed to generate test: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
