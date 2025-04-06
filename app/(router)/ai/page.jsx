"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIFlashcards from "./_components/AIFlashcards";
import AISlides from "./_components/AISlides";
import AITips from "./_components/AITips";
import AIChat from "./_components/AIChat";
import { motion } from "framer-motion";
import { Library, Upload, LightbulbIcon, MessageSquare } from "lucide-react";

function AIPage() {
  return (
    <div className="p-5 sm:px-10 sm:py-6 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 max-w-4xl mx-auto text-center"
      >
        <h1 className="text-3xl font-bold text-primary mb-3">Obstutor AI</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your intelligent study companion for Biology and Biomedical sciences.
          Use our AI-powered tools to create flashcards, analyze slides, get
          exam tips, or chat with our specialized medical AI assistant.
        </p>
      </motion.div>

      <Tabs defaultValue="chat" className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-4 mb-8 rounded-xl p-1 bg-white shadow-sm">
          <TabsTrigger value="chat" className="flex items-center gap-2 py-3">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger
            value="flashcards"
            className="flex items-center gap-2 py-3"
          >
            <Library className="h-4 w-4" />
            <span className="hidden sm:inline">Flashcard Quizzes</span>
            <span className="sm:hidden">Cards</span>
          </TabsTrigger>
          <TabsTrigger value="slides" className="flex items-center gap-2 py-3">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Slides Analysis</span>
            <span className="sm:hidden">Slides</span>
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2 py-3">
            <LightbulbIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Exam Tips</span>
            <span className="sm:hidden">Tips</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <AIChat />
          </motion.div>
        </TabsContent>

        <TabsContent value="flashcards">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <AIFlashcards />
          </motion.div>
        </TabsContent>

        <TabsContent value="slides">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <AISlides />
          </motion.div>
        </TabsContent>

        <TabsContent value="tips">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <AITips />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AIPage;
