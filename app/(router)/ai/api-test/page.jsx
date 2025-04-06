"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function GeminiApiTest() {
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testGeminiApi();
  }, []);

  const testGeminiApi = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/test");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "API test failed");
      } else {
        setTestResult(data);
      }
    } catch (error) {
      console.error("Error testing API:", error);
      setError(error.message || "Failed to connect to API test endpoint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 sm:px-10 sm:py-6">
      <h1 className="text-2xl font-bold text-primary mb-2">Gemini API Test</h1>
      <p className="text-gray-500 mb-6">
        This page tests your Gemini API configuration
      </p>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">API Configuration Test</h2>
            <Button onClick={testGeminiApi} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Run Test Again"
              )}
            </Button>
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Testing your Gemini API configuration...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-md">
              <h3 className="font-bold mb-2">Error</h3>
              <p>{error}</p>

              <div className="mt-6 border-t border-red-200 pt-4">
                <h4 className="font-medium mb-2">Troubleshooting Steps:</h4>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>
                    Check that your GOOGLE_GEMINI_API_KEY is set correctly in
                    .env.local
                  </li>
                  <li>Verify that your API key is valid and has not expired</li>
                  <li>
                    Make sure you have billing set up for your Google AI Studio
                    account
                  </li>
                  <li>
                    Check your browser console for additional error details
                  </li>
                </ol>
              </div>
            </div>
          ) : testResult ? (
            <div className="p-4 bg-green-50 text-green-800 rounded-md">
              <h3 className="font-bold mb-2">Success</h3>
              <p>{testResult.message}</p>

              <div className="mt-4">
                <h4 className="font-medium">API Key:</h4>
                <p className="font-mono bg-green-100 p-2 rounded mt-1">
                  {testResult.apiKey}
                </p>
              </div>

              <div className="mt-4">
                <h4 className="font-medium">API Response:</h4>
                <p className="bg-green-100 p-2 rounded mt-1">
                  {testResult.response}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-medium mb-4">Gemini API Setup Help</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg">
                Step 1: Get a Gemini API Key
              </h3>
              <p className="text-gray-600">
                Visit{" "}
                <a
                  href="https://ai.google.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>{" "}
                and sign up for an account. Then create a new API key from the
                dashboard.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg">
                Step 2: Add the API Key to Your Project
              </h3>
              <p className="text-gray-600">
                Add the following line to your .env.local file:
              </p>
              <div className="bg-gray-100 p-3 rounded mt-2 font-mono text-sm">
                GOOGLE_GEMINI_API_KEY=your-api-key-here
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg">
                Step 3: Restart Your Development Server
              </h3>
              <p className="text-gray-600">
                After adding the API key, restart your development server for
                the changes to take effect.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
