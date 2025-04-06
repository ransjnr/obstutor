import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

// Create and configure the model
export const geminiProModel = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-preview-03-25",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

// Create a function to generate flashcards
export async function generateFlashcards(topic, numCards = 5) {
  const prompt = `Generate ${numCards} detailed flashcards about ${topic} for a biology or biomedical student.
  
  Instructions:
  1. Focus specifically on the topic "${topic}" in the field of biology or biomedicine
  2. Each flashcard should have a clear question and comprehensive answer
  3. Make the questions challenging but appropriate for a university-level student
  4. Ensure the answers are factually accurate and educational
  5. Include a mix of definitional, conceptual, and application questions
  
  Format your response as a JSON array with 'question' and 'answer' fields for each card.
  Do not include any explanatory text before or after the JSON.
  
  Example format:
  [
    {
      "question": "What are the four chambers of the human heart?",
      "answer": "The four chambers are right atrium, right ventricle, left atrium, and left ventricle."
    }
  ]`;

  try {
    const result = await geminiProModel.generateContent(prompt);
    const text = result.response.text();

    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);

        // Validate the structure of the data
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          const validCards = parsedData.filter(
            (card) =>
              card &&
              typeof card === "object" &&
              typeof card.question === "string" &&
              typeof card.answer === "string" &&
              card.question.trim() !== "" &&
              card.answer.trim() !== ""
          );

          if (validCards.length > 0) {
            return validCards;
          }
        }

        throw new Error("Invalid data structure in response");
      } else {
        // Fallback to a more structured response if JSON parsing fails
        console.error("Could not find JSON array in the response");
        throw new Error("Invalid response format");
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      throw parseError;
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
}

// Create a function to analyze slides and generate a summary
export async function analyzeSlidesContent(content) {
  // Clean the content to ensure it's usable
  const cleanedContent = content.replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();

  const prompt = `You are an expert biology tutor analyzing a presentation or document about a biology/biomedical topic.

Given the following content:
---
${cleanedContent.substring(0, 10000)} ${
    cleanedContent.length > 10000 ? "... [content truncated]" : ""
  }
---

Instructions:
1. Identify the key topics, concepts, and educational points
2. Provide a structured, detailed summary organized by main topics
3. Format each topic section with a clear heading (Topic: description format)
4. Include important definitions, processes, mechanisms, and relationships
5. Format your response with clear section breaks and bullet points for readability

Your output should be educational, scientifically accurate, and useful for biology students studying this material.`;

  try {
    const result = await geminiProModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error analyzing slides:", error);
    throw error;
  }
}

// Create a function to generate quiz questions from slides
export async function generateQuizFromSlides(content) {
  // Clean the content to ensure it's usable
  const cleanedContent = content.replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();

  const prompt = `You are an expert biology exam creator designing questions based on educational content.

Given the following content from a biology/biomedical document:
---
${cleanedContent.substring(0, 10000)} ${
    cleanedContent.length > 10000 ? "... [content truncated]" : ""
  }
---

Create 5 educational quiz questions that test understanding of the key concepts from this content.
Each question should:
1. Target important concepts from the content
2. Be challenging but fair for university students
3. Have a clear, comprehensive answer
4. Be directly related to biology/biomedicine

Return ONLY a JSON array with 'question' and 'answer' fields. Do not include explanatory text.

Example format:
[
  {
    "question": "What is the main function of mitochondria in a cell?",
    "answer": "Mitochondria are responsible for cellular respiration, generating energy in the form of ATP through the electron transport chain and oxidative phosphorylation. They are often called the powerhouse of the cell."
  }
]`;

  try {
    const result = await geminiProModel.generateContent(prompt);
    const text = result.response.text();

    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);

        // Validate the structure
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          const validQuestions = parsedData.filter(
            (q) =>
              q &&
              typeof q === "object" &&
              typeof q.question === "string" &&
              (typeof q.answer === "string" ||
                (Array.isArray(q.options) && typeof q.answer === "number"))
          );

          if (validQuestions.length > 0) {
            return validQuestions;
          }
        }

        throw new Error("Invalid question data structure");
      } else {
        // Fallback if parsing fails
        console.error("Could not find JSON array in quiz response");
        throw new Error("Invalid quiz response format");
      }
    } catch (parseError) {
      console.error("Error parsing quiz JSON:", parseError);
      throw parseError;
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
}
