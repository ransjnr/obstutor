"use client";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="flex-grow flex items-center justify-center p-6">
      <div className="text-center">
        <div className="inline-block mb-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
        <p className="text-lg font-medium text-gray-800">{text}</p>
        <p className="text-sm text-gray-500 mt-1">Please wait a moment...</p>
      </div>
    </div>
  );
}
