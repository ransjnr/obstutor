import { NextResponse } from "next/server";
import { analyzeSlidesContent, generateQuizFromSlides } from "../gemini-client";

export async function POST(req) {
  try {
    let formData;
    try {
      formData = await req.formData();
    } catch (formError) {
      console.error("Error parsing form data:", formError);
      return NextResponse.json(
        {
          error: "Failed to parse form data",
          summary: "Could not process the submitted file. Please try again.",
          quizQuestions: null,
        },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    const type = formData.get("type") || "both"; // summary, quiz, or both

    if (!file) {
      return NextResponse.json(
        {
          error: "File is required",
          summary: "Please upload a file to analyze.",
          quizQuestions: null,
        },
        { status: 400 }
      );
    }

    // Extract content from the file
    let content;
    let fileInfo = {
      type: "",
      name: "",
      size: 0,
    };

    try {
      // Collect file metadata for better processing
      if (file) {
        fileInfo = {
          type: file.type || "",
          name: file.name || "",
          size: file.size || 0,
        };
        console.log(
          `Processing file: ${fileInfo.name}, type: ${fileInfo.type}, size: ${fileInfo.size} bytes`
        );
      }

      // For PDFs and other complex document types
      content = await file.text();

      // Detect if the content appears to be binary
      const isBinary =
        content &&
        (content.includes("%PDF") ||
          /[\x00-\x1F\x80-\xFF]/.test(content.substring(0, 500)) ||
          content.includes("PK")); // ZIP files and office documents

      if (isBinary) {
        console.log(
          `Binary content detected in ${fileInfo.name}. Using enhanced extraction.`
        );

        // For binary content, extract as much text as possible
        // Remove control characters but preserve spacing and structure
        content = content
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ") // Remove control chars
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r") // Preserve line breaks
          .replace(/\\t/g, "\t") // Preserve tabs
          .replace(/\\\\/g, "\\")
          .replace(/\\"/g, '"') // Unescape
          .replace(/([^\x20-\x7E\n\r\t])/g, " "); // Replace other non-printable chars

        if (content.length < 500) {
          // If we couldn't extract much text, add special instructions
          content = `This appears to be a ${
            fileInfo.type || fileInfo.name
          } file with limited text content that can be extracted directly. 
          The document may contain images, charts, or formatted text that is not easily extractable as plain text.
          ${content}`;
        }
      }
    } catch (fileError) {
      console.error("Error reading file:", fileError);

      // Provide more helpful error for the user
      return NextResponse.json(
        {
          error: `Error processing file: ${fileError.message}`,
          summary: `Could not process the ${
            fileInfo.name || "file"
          }. This may be due to an unsupported format or file corruption. Please try converting to PDF or text format.`,
          quizQuestions: null,
        },
        { status: 400 }
      );
    }

    // Even if content seems empty, don't reject it completely
    // Instead, provide file info to the AI model
    if (!content || content.trim().length === 0) {
      content = `This file (${
        fileInfo.name || "document"
      }) appears to contain no extractable text content. 
      It may contain only images, charts, or other non-text elements.
      Please provide educational summaries and quiz questions about biology/medical topics that would likely be covered in a document with this name/type.`;
    }

    let summary = null;
    let summaries = [];
    let quizQuestions = null;
    let errors = [];

    if (type === "summary" || type === "both") {
      try {
        summary = await analyzeSlidesContent(content);

        // Convert the summary string into a structured format
        if (summary && typeof summary === "string") {
          // Split by paragraphs or bullet points
          const paragraphs = summary
            .split(/\n\s*\n|\n-\s+|\n•\s+/)
            .filter((p) => p.trim().length > 0)
            .map((p) => p.trim());

          if (paragraphs.length > 0) {
            summaries = paragraphs.map((paragraph, index) => {
              // Try to extract a title if the paragraph starts with a heading-like pattern
              const titleMatch = paragraph.match(/^(.*?):/);
              const title = titleMatch
                ? titleMatch[1].trim()
                : `Slide Section ${index + 1}`;

              // Use the rest as the summary, or the whole paragraph if no title was found
              const summaryText = titleMatch
                ? paragraph.substring(titleMatch[0].length).trim()
                : paragraph;

              return {
                title,
                summary: summaryText,
              };
            });
          } else {
            // If we can't split it well, just use the whole thing as one summary
            summaries = [
              {
                title: "Slide Analysis",
                summary: summary,
              },
            ];
          }
        }
      } catch (summaryError) {
        console.error("Error generating summary:", summaryError);
        errors.push(`Summary error: ${summaryError.message}`);

        // Provide sample summaries as fallback
        summaries = [
          {
            title: "Key Concepts Overview",
            summary:
              "The analysis encountered an issue processing your slides. Here are some general points that might be relevant based on typical biology content: cell structures, molecular mechanisms, physiological processes, and their clinical applications.",
          },
          {
            title: "Important Terminology",
            summary:
              "While we couldn't analyze your specific content, biology documents typically cover important terms related to cellular components, biochemical pathways, anatomical structures, and related medical concepts.",
          },
        ];
      }
    }

    if (type === "quiz" || type === "both") {
      try {
        quizQuestions = await generateQuizFromSlides(content);

        // Format quiz questions to expected structure if needed
        if (quizQuestions && Array.isArray(quizQuestions)) {
          // No need to transform - we'll use the enhanced format directly
          // Just make sure all required fields are present
          quizQuestions = quizQuestions.map((q) => {
            // Ensure all questions have the necessary fields
            return {
              question: q.question || "Could not generate a proper question",
              options: Array.isArray(q.options) ? q.options : [],
              answer: q.answer || "Could not determine the correct answer",
              explanation: q.explanation || "No explanation provided",
              type: q.type || "multiple-choice",
              difficulty: q.difficulty || "medium",
            };
          });
        }
      } catch (quizError) {
        console.error("Error generating quiz:", quizError);
        errors.push(`Quiz error: ${quizError.message}`);

        // Use enhanced sample quiz questions as fallback
        quizQuestions = [
          {
            question:
              "Which cellular organelle is primarily responsible for energy production in eukaryotic cells?",
            options: [
              "A. Nucleus",
              "B. Mitochondria",
              "C. Golgi apparatus",
              "D. Endoplasmic reticulum",
              "E. Lysosome",
            ],
            answer: "B. Mitochondria",
            explanation:
              "Mitochondria are known as the powerhouse of the cell and are responsible for producing ATP through cellular respiration. The nucleus contains genetic material, the Golgi apparatus processes and packages proteins, the endoplasmic reticulum is involved in protein synthesis and transport, and lysosomes contain digestive enzymes.",
            type: "multiple-choice",
            difficulty: "easy",
          },
          {
            question:
              "Which of the following best describes the process of cellular respiration?",
            options: [
              "A. Converting light energy into chemical energy",
              "B. Breaking down glucose to produce ATP, CO2, and H2O",
              "C. Using oxygen to directly synthesize proteins",
              "D. Converting CO2 and H2O into glucose",
            ],
            answer: "B. Breaking down glucose to produce ATP, CO2, and H2O",
            explanation:
              "Cellular respiration is the metabolic process where cells break down glucose and other nutrients to produce energy in the form of ATP, releasing carbon dioxide and water as byproducts. Option A describes photosynthesis, option C incorrectly describes protein synthesis, and option D describes photosynthesis in reverse.",
            type: "multiple-choice",
            difficulty: "medium",
          },
          {
            question:
              "In a patient presenting with symptoms of hyperglycemia, which of the following would you expect to observe?",
            options: [
              "A. Decreased blood glucose levels",
              "B. Increased insulin sensitivity",
              "C. Polyuria (excessive urination)",
              "D. Hypoglycemic seizures",
            ],
            answer: "C. Polyuria (excessive urination)",
            explanation:
              "Hyperglycemia (high blood glucose) typically causes polyuria as the kidneys try to eliminate excess glucose through increased urine production. Options A and D are associated with hypoglycemia (low blood glucose), not hyperglycemia. Option B would actually lower blood glucose levels, not raise them.",
            type: "case-based",
            difficulty: "hard",
          },
        ];
      }
    }

    return NextResponse.json({
      summary,
      summaries,
      quizQuestions,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in slides analysis API:", error);
    return NextResponse.json(
      {
        error: `Failed to analyze slides: ${error.message}`,
        summary:
          "A server error occurred while processing your request. Please try again later.",
        summaries: [
          {
            title: "Error Processing Slides",
            summary:
              "We encountered a technical issue analyzing your slides. Please try again with a different file format or content.",
          },
        ],
        quizQuestions: [
          {
            question: "Sample Question (Error Occurred)",
            answer:
              "This is a sample answer since we couldn't analyze your specific content.",
          },
        ],
      },
      { status: 500 }
    );
  }
}
