import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Missing API key",
          message: "GOOGLE_GEMINI_API_KEY is not set in environment variables",
          status: "failed",
          solution: "Please add your Gemini API key to the .env.local file",
        },
        { status: 500 }
      );
    }

    // Test with direct API call to verify
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro-preview-03-25", // Updated to use newer model version
      });

      // Simple API test
      const prompt =
        "Reply with 'Gemini API is working!' if you receive this message.";
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return NextResponse.json({
        success: true,
        message: "Gemini API is working correctly",
        apiKey:
          apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5),
        response: text,
        status: "ok",
      });
    } catch (apiError) {
      console.error("Gemini API call failed:", apiError);

      // Provide more helpful error information
      return NextResponse.json({
        error: "Gemini API call failed",
        message: apiError.message,
        status: "error",
        errorDetails: {
          code: apiError.code || "unknown",
          name: apiError.name || "Error",
          stack:
            process.env.NODE_ENV === "development" ? apiError.stack : undefined,
        },
        apiKey: apiKey
          ? apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5)
          : "not set",
        solution:
          "Check your API key permissions and ensure it has access to the Gemini API",
      });
    }
  } catch (error) {
    console.error("Gemini API test failed:", error);
    return NextResponse.json(
      {
        error: "Gemini API test failed",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        status: "error",
        solution: "Check your Next.js server logs for more details",
      },
      { status: 500 }
    );
  }
}
