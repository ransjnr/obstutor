import { NextResponse } from "next/server";
import { generateFlashcards } from "../gemini-client";

export async function POST(req) {
  try {
    // Try to parse the request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          error: "Invalid request body - not valid JSON",
          flashcards: [
            {
              question: "Error occurred",
              answer:
                "There was an error processing your request. Please try again.",
            },
          ],
        },
        { status: 400 }
      );
    }

    const { topic, numCards } = body;

    if (!topic) {
      return NextResponse.json(
        {
          error: "Topic is required",
          flashcards: [
            {
              question: "Missing topic",
              answer: "Please provide a topic to generate flashcards.",
            },
          ],
        },
        { status: 400 }
      );
    }

    try {
      const flashcards = await generateFlashcards(topic, numCards || 5);
      return NextResponse.json({ flashcards });
    } catch (apiError) {
      console.error("Error from Gemini API:", apiError);

      // Return a fallback response with sample flashcards rather than error
      return NextResponse.json({
        error: `Gemini API error: ${apiError.message}`,
        flashcards: [
          {
            question: `What is the main concept of ${topic}?`,
            answer:
              "We couldn't generate specific content for this topic. Please try a different topic or try again later.",
          },
          {
            question: "Why are flashcards an effective study tool?",
            answer:
              "Flashcards promote active recall, which helps strengthen memory and improve long-term retention of information.",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Error in flashcards API:", error);
    return NextResponse.json(
      {
        error: `Failed to generate flashcards: ${error.message}`,
        flashcards: [
          {
            question: "Server error occurred",
            answer:
              "There was a problem with our servers. Please try again later.",
          },
        ],
      },
      { status: 500 }
    );
  }
}
