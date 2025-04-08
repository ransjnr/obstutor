"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIFlashcards from "./_components/AIFlashcards";
import AISlides from "./_components/AISlides";
import AIExamTips from "./_components/AIExamTips";
import { Library, Upload, LightbulbIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function AIPage() {
  const [selectedTab, setSelectedTab] = useState("flashcards");

  // Animation variants for tab content
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ background: '#ffffff' }}>
      {/* Header */}
      <div className="relative py-8 px-6 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl font-bold text-primary mb-3">Obstutor AI</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your intelligent study companion for Biology and Biomedical
            sciences. Generate flashcards, analyze slides, or get expert exam
            tips.
          </p>
        </div>

        {/* Background decoration elements removed */}
      </div>

      {/* Tabs Container */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-6 pt-6 pb-12"
      >
        <TabsList className="grid w-full grid-cols-3 mb-8 rounded-xl p-1 bg-white shadow-sm flex-shrink-0 border border-gray-100">
          <motion.div
            className="absolute h-[calc(100%-8px)] top-1 bottom-1z-0 transition-all duration-300"
            style={{
              width: `calc(100% / 3 - 8px)`,
              left: `calc((100% / 3) * ${
                selectedTab === "flashcards"
                  ? 0
                  : selectedTab === "slides"
                  ? 1
                  : 2
              } + 4px)`,
              background: "transparent",
            }}
            layout
            transition={{ type: "spring", duration: 0.5 }}
          />

          <TabsTrigger
            value="flashcards"
            className="flex items-center gap-2 py-3 z-10 relative"
          >
            <Library className="h-4 w-4" />
            <span className="hidden sm:inline">Flashcard Quizzes</span>
            <span className="sm:hidden">Flashcards</span>
          </TabsTrigger>

          <TabsTrigger
            value="slides"
            className="flex items-center gap-2 py-3 z-10 relative"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Slides Analysis</span>
            <span className="sm:hidden">Slides</span>
          </TabsTrigger>

          <TabsTrigger
            value="tips"
            className="flex items-center gap-2 py-3 z-10 relative"
          >
            <LightbulbIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Exam Tips</span>
            <span className="sm:hidden">Tips</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          <TabsContent
            value="flashcards"
            className="h-full m-0 data-[state=active]:animate-in data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:fade-in-0"
          >
            <motion.div
              className="bg-white rounded-xl shadow-sm h-full"
              initial="hidden"
              animate={selectedTab === "flashcards" ? "visible" : "hidden"}
              variants={contentVariants}
            >
              <AIFlashcards />
            </motion.div>
          </TabsContent>

          <TabsContent
            value="slides"
            className="h-full m-0 data-[state=active]:animate-in data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:fade-in-0"
          >
            <motion.div
              className="bg-white rounded-xl shadow-sm h-full"
              initial="hidden"
              animate={selectedTab === "slides" ? "visible" : "hidden"}
              variants={contentVariants}
            >
              <AISlides />
            </motion.div>
          </TabsContent>

          <TabsContent
            value="tips"
            className="h-full m-0 data-[state=active]:animate-in data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:fade-in-0"
          >
            <motion.div
              className="bg-white rounded-xl shadow-sm h-full"
              initial="hidden"
              animate={selectedTab === "tips" ? "visible" : "hidden"}
              variants={contentVariants}
            >
              <AIExamTips />
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>

      {/* AI Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <motion.div
          className="flex items-center gap-2 bg-white rounded-full py-2 px-4 shadow-md border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 text-primary" />
            <motion.div
              className="absolute inset-0 rounded-full bg-white"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </div>
          <span className="text-xs text-gray-600">
            Developed by Ransford Oppong
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default AIPage;
