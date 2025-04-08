import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

// Create and configure the model
export const geminiProModel = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

// Create a function to generate flashcards
export async function generateFlashcards(topic, numCards = 5) {
  const prompt = `Generate ${numCards} flashcards about ${topic} for a biology or biomedical student.
  
  Instructions:
  1. Focus specifically on the topic "${topic}" in the field of biology or biomedicine
  2. Each flashcard should have a clear question and a CONCISE answer (around 100 characters)
  3. Make the questions challenging but appropriate for a university-level student
  4. Answers must be direct, clean statements - NO markdown formatting, NO bullet points, NO asterisks
  5. Focus on key definitions, facts, or relationships in clean, plain text format
  
  Format your response as a JSON array with 'question' and 'answer' fields for each card.
  Do not include any explanatory text before or after the JSON.
  
  Example format:
  [
    {
      "question": "What are the four chambers of the human heart?",
      "answer": "Right atrium, right ventricle, left atrium, and left ventricle. These chambers work together to pump blood throughout the body."
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
  let cleanedContent = "";
  let contentInfo = {
    seemsEmpty: false,
    contentLength: content ? content.length : 0,
    contentType: "unknown",
  };

  try {
    if (content) {
      // Detect content type
      if (
        content.includes("This appears to be a") &&
        content.includes("file with limited text content")
      ) {
        contentInfo.contentType = "limited-extraction";
        contentInfo.seemsEmpty = content.length < 300;
        console.log("Detected content with limited extraction");
      } else if (content.includes("%PDF")) {
        contentInfo.contentType = "pdf";
      } else if (content.includes("<html") || content.includes("<body")) {
        contentInfo.contentType = "html";
      }

      // Enhanced cleaning that better handles PDFs and other document formats
      cleanedContent = content
        .replace(/[^\x20-\x7E\n\r\t]/g, " ") // Replace non-printable chars
        .replace(/\\["'\\bfnrt/]/g, " ") // Remove escaped characters
        .replace(/\s{3,}/g, "\n") // Convert large whitespace blocks to newlines
        .trim();

      // Preserve important structure indicators
      cleanedContent = cleanedContent
        .replace(/\b[IVX]{1,5}\.\s+/g, "\n$&") // Roman numerals
        .replace(/\b[A-Z]\.\s+/g, "\n$&") // A. B. C. etc.
        .replace(/\b\d+\.\s+/g, "\n$&") // 1. 2. 3. etc.
        .replace(/\b[a-z]\)\s+/g, "\n$&"); // a) b) c) etc.
    }
  } catch (error) {
    console.error("Error cleaning content:", error);
    cleanedContent = content ? content.toString().substring(0, 10000) : "";
  }

  // Adapt prompt based on content quality
  let enhancedPrompt = "";

  if (contentInfo.seemsEmpty || cleanedContent.length < 200) {
    // Special prompt for documents with very limited text
    enhancedPrompt = `You are an expert medical/biology tutor creating comprehensive study notes. The student submitted a document that appears to contain limited textual content (possibly containing images, charts, or diagrams that couldn't be extracted).

From the file information and any available text: 
---
${cleanedContent.substring(0, 5000)}
---

Please:
1. Acknowledge that the document appears to have limited text content
2. Create comprehensive study notes on the likely topics based on any context clues in the filename or available text
3. Focus on creating USEFUL study materials covering fundamental biology/medical topics that would typically be in such course materials
4. Include a disclaimer that these notes are generated based on limited information
5. Follow all the formatting instructions for well-structured notes below

The notes should:
- Cover core biological/medical concepts likely relevant to the student's course
- Be organized with clear headings and a logical structure
- Include key definitions, mechanisms, and clinical relevance
- Use formatting (bold, bullet points) to aid study`;
  } else {
    // Standard prompt for documents with sufficient text
    enhancedPrompt = `You are an expert medical/biology tutor creating comprehensive study notes from a student's lecture slides or course material. The student is preparing for exams and needs well-structured, clear summaries to aid their revision.

Given the following content which may be from a presentation, document, or study material:
---
${cleanedContent.substring(0, 15000)} ${
      cleanedContent.length > 15000 ? "... [content truncated]" : ""
    }
---

Instructions:
1. Create a comprehensive set of study notes organized by main topics and subtopics
2. Extract and highlight KEY FACTS, DEFINITIONS, and CONCEPTS that would likely appear in an exam
3. Use a clear, hierarchical structure with numbered sections and subsections
4. Include any important:
   - Mechanisms and processes
   - Cause-effect relationships
   - Classifications and categories
   - Clinical correlations or applications
   - Diagrams/figures mentioned (describe them clearly)
5. Format your response in a way that's easy to read and memorize:
   - Use bullet points for lists
   - Bold important terms and definitions
   - Use tables for comparing/contrasting information when appropriate
   - Include mnemonics or memory aids where helpful`;
  }

  // Common footer for both prompts
  const promptFooter = `
Each major topic should have:
- A descriptive heading
- A brief overview/summary (1-2 sentences)
- Key points in bullet form
- Any relevant details organized logically

Your output should be scientifically accurate, comprehensive yet concise, and specifically designed to help a student efficiently review and retain the material for exams.`;

  // Combine appropriate prompt with footer
  const finalPrompt = enhancedPrompt + promptFooter;

  try {
    const result = await geminiProModel.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4000,
      },
    });
    return result.response.text();
  } catch (error) {
    console.error("Error analyzing slides:", error);
    throw error;
  }
}

// Create a function to generate quiz questions from slides
export async function generateQuizFromSlides(content) {
  // Clean the content to ensure it's usable
  let cleanedContent = "";
  let contentInfo = {
    limitedText: false,
    fileType: "",
  };

  try {
    if (content) {
      // Check if this is content with limited extraction
      if (
        content.includes("This appears to be a") &&
        content.includes("file with limited text content")
      ) {
        contentInfo.limitedText = true;
        // Try to extract file type from the content
        const typeMatch = content.match(/be a ([^\s]+) file with/);
        if (typeMatch && typeMatch[1]) {
          contentInfo.fileType = typeMatch[1];
        }
        console.log(
          `Detected file with limited text content. Type: ${
            contentInfo.fileType || "unknown"
          }`
        );
      }

      // Enhanced cleaning that better handles PDFs and other document formats
      cleanedContent = content
        .replace(/[^\x20-\x7E\n\r\t]/g, " ") // Replace non-printable chars
        .replace(/\\["'\\bfnrt/]/g, " ") // Remove escaped characters
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();
    }
  } catch (error) {
    console.error("Error cleaning content:", error);
    cleanedContent = content ? content.toString().substring(0, 10000) : "";
  }

  // Choose the appropriate prompt based on content quality
  let finalPrompt = "";

  if (contentInfo.limitedText || cleanedContent.length < 200) {
    // Prompt for limited content - generate general biology/medical questions
    finalPrompt = `You are an experienced medical school exam writer creating high-quality multiple-choice questions (MCQs) based on a document that has limited extractable text. The document appears to be related to biology or medical education.

From the limited context available:
---
${cleanedContent.substring(0, 5000)}
---

Create 8 relevant multiple-choice questions covering fundamental biology/medical topics that would typically be covered in university-level courses. Since we don't have much content from the document itself, focus on core concepts in biology and medicine that would be valuable for a student's exam preparation.

The questions should:
1. Cover various cognitive levels (recall, comprehension, application, analysis)
2. Address fundamental biological/medical concepts likely to appear in any course
3. Include a mix of difficulty levels (easy, medium, hard)
4. Be scientifically accurate and educational

Each question must include:
- "question": Clear question text
- "options": Array of labeled answer choices ("A. [option]", "B. [option]", etc.)
- "answer": The correct option (matching exactly one of the options)
- "explanation": Detailed explanation of why the answer is correct and why other options are wrong
- "type": Question type ("multiple-choice", "true-false", or "case-based")
- "difficulty": Level ("easy", "medium", or "hard")`;
  } else {
    // Standard prompt for normal content
    finalPrompt = `You are an experienced medical school exam writer creating high-quality multiple-choice questions (MCQs) based on lecture slides or course materials. Create questions that test understanding, application, and analysis - not just memorization.

Given the following content from biomedical/biology course material:
---
${cleanedContent.substring(0, 15000)} ${
      cleanedContent.length > 15000 ? "... [content truncated]" : ""
    }
---

Create 8 exam-style multiple-choice questions that:

1. TEST DIFFERENT COGNITIVE LEVELS: Include a mix of:
   - Knowledge/recall questions (basic facts)
   - Comprehension questions (understanding concepts)
   - Application questions (applying knowledge to new situations)
   - Analysis questions (case scenarios, interpreting data)

2. COVER KEY EXAM TOPICS: Focus on the most important concepts, especially:
   - Definitions of critical terms
   - Mechanisms and processes
   - Clinical applications
   - Common misconceptions or easily confused concepts

3. USE REALISTIC EXAM FORMATS:
   - Single-best-answer questions (4-5 options with one correct answer)
   - Extended matching questions (scenario followed by options)
   - True/False questions
   
4. CREATE PLAUSIBLE DISTRACTORS (wrong answers) that:
   - Represent common student misconceptions
   - Include partially correct information
   - Have similar appearance to the correct answer

5. For EACH QUESTION include:
   - "question": Clear, focused question text
   - "options": Array of answer choices (labeled A, B, C, D, etc.)
   - "answer": The correct answer (must match one option exactly)
   - "explanation": Thorough explanation of the correct answer AND why each distractor is wrong
   - "type": Question type (e.g., "multiple-choice", "true-false", "case-based")
   - "difficulty": Level ("easy", "medium", or "hard")`;
  }

  // Add the common response format instructions
  finalPrompt += `

Return ONLY a properly formatted JSON array with these fields for each question.

Example format:
[
  {
    "question": "Which of the following best describes the function of mitochondria in eukaryotic cells?",
    "options": ["A. Protein synthesis", "B. Energy production through cellular respiration", "C. Lipid metabolism", "D. DNA replication", "E. Intracellular digestion"],
    "answer": "B. Energy production through cellular respiration",
    "explanation": "Mitochondria are the primary site of ATP production through oxidative phosphorylation. Option A is incorrect as protein synthesis occurs primarily in ribosomes. Option C is partially correct as some lipid metabolism occurs in mitochondria, but this is not their primary function. Option D is incorrect as DNA replication occurs in the nucleus. Option E is incorrect as intracellular digestion is performed by lysosomes.",
    "type": "multiple-choice",
    "difficulty": "easy"
  }
]`;

  try {
    const result = await geminiProModel.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4000,
      },
    });
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
              Array.isArray(q.options) &&
              typeof q.answer === "string" &&
              q.options.includes(q.answer) &&
              typeof q.explanation === "string"
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
