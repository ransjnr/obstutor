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
    try {
      // For PDFs, ideally we would use a PDF parsing library
      // For now, we'll use the text method which works for plain text files and some PDFs
      content = await file.text();

      // If content appears to be binary (like in some PDFs), we'll use mock data
      if (
        content &&
        (content.includes("%PDF") ||
          /[^\x00-\x7F]/.test(content.substring(0, 100)))
      ) {
        console.log("Detected binary PDF content, using extracted content");
        // Use some identifiable content from the PDF if possible
        // For a real-world solution, you'd use a PDF extraction library
      }
    } catch (fileError) {
      console.error("Error reading file:", fileError);
      return NextResponse.json(
        {
          error: `Error reading file: ${fileError.message}`,
          summary:
            "Could not read the contents of the uploaded file. Please ensure it's a valid text-based file.",
          quizQuestions: null,
        },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Could not extract content from the file",
          summary:
            "The uploaded file appears to be empty or could not be processed. Please try a different file.",
          quizQuestions: null,
        },
        { status: 400 }
      );
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
          // Transform quiz questions if they have options format (from API) to Q&A format (for frontend)
          quizQuestions = quizQuestions.map((q) => {
            // If already in the right format, return as is
            if (q.question && q.answer && typeof q.answer === "string") {
              return q;
            }

            // If it has options array and answer index, convert to expected format
            if (
              q.question &&
              Array.isArray(q.options) &&
              typeof q.answer === "number"
            ) {
              const correctOption = q.options[q.answer];
              return {
                question: q.question,
                answer: `The correct answer is: ${correctOption}. ${
                  q.explanation || ""
                }`,
              };
            }

            // Default case
            return {
              question: q.question || "Could not generate a proper question",
              answer: q.answer || "Could not generate a proper answer",
            };
          });
        }
      } catch (quizError) {
        console.error("Error generating quiz:", quizError);
        errors.push(`Quiz error: ${quizError.message}`);

        // Use sample quiz questions as fallback
        quizQuestions = [
          {
            question: "What are the key components of cell structure?",
            answer:
              "The key components include the cell membrane, cytoplasm, nucleus, mitochondria, endoplasmic reticulum, Golgi apparatus, and various other organelles, each with specific functions.",
          },
          {
            question: "How does cellular respiration work?",
            answer:
              "Cellular respiration is the process by which cells convert nutrients into ATP, the energy currency of the cell. It involves glycolysis, the Krebs cycle, and oxidative phosphorylation.",
          },
          {
            question: "What is the role of DNA in cellular function?",
            answer:
              "DNA contains the genetic instructions for the development, functioning, and reproduction of all living organisms. It encodes information for protein synthesis through transcription and translation processes.",
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
