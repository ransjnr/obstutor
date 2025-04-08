"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Book,
  BookOpen,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Check,
  X,
  Copy,
  ArrowRight,
  CheckCircle,
  ThumbsUp,
  BrainCircuit,
  XCircle,
  Circle,
  Badge,
  AlertCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import LoadingSpinner from "./LoadingSpinner";

export default function AIFlashcards() {
  const [topic, setTopic] = useState("");
  const [numCards, setNumCards] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answeredCards, setAnsweredCards] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);

  const { toast } = useToast();

  // Sample flashcards for fallback
  const getSampleFlashcards = () => [
    {
      question: "What is the primary function of mitochondria in cells?",
      answer: "Generate ATP through cellular respiration",
    },
    {
      question: "Describe the process of DNA replication.",
      answer: "Semi-conservative copying of DNA during cell division",
    },
    {
      question: "What are the four main types of tissue in the human body?",
      answer: "Epithelial, connective, muscle, and nervous tissue",
    },
    {
      question:
        "What is the function of white blood cells in the immune system?",
      answer: "Protect against pathogens and foreign materials",
    },
    {
      question: "Explain the concept of homeostasis.",
      answer: "Maintenance of stable internal conditions",
    },
  ];

  // Format answer for display
  const formatAnswer = (answer) => {
    if (!answer) return "";

    // Comprehensive cleaning of formatting characters
    return answer
      .replace(/[•*\-+]/g, "") // Remove bullet points, asterisks, and other list markers
      .replace(/\\n|\\r|\n|\r/g, " ") // Replace all newlines
      .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
      .replace(/^\s+|\s+$/g, "") // Trim whitespace from start and end
      .replace(/^[0-9]+\.\s*/g, "") // Remove numbered list formatting
      .replace(/^[#]+\s*/g, "") // Remove markdown heading formatting
      .replace(/`/g, "") // Remove code ticks
      .trim();
  };

  // Handle flashcard generation
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate flashcards.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setQuizMode(false);
    setAnsweredCards([]);
    setCorrectAnswers(0);
    setShowResults(false);
    setQuizQuestions([]);
    setSelectedAnswer(null);
    setAnswered(false);

    try {
      const response = await fetch("/api/gemini/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          numCards: parseInt(numCards) || 5,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("API Error:", data.error);
        toast({
          title: "Error Generating Flashcards",
          description:
            "There was an error generating your flashcards. Using sample flashcards instead.",
          variant: "destructive",
        });
        setFlashcards(getSampleFlashcards());
      } else if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
        toast({
          title: "Flashcards Generated",
          description: `Created ${data.flashcards.length} flashcards about ${topic}`,
        });
      } else {
        toast({
          title: "No Flashcards Generated",
          description: "Try a different topic or check your connection.",
          variant: "destructive",
        });
        setFlashcards(getSampleFlashcards());
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Connection Error",
        description:
          "Failed to connect to the server. Using sample flashcards instead.",
        variant: "destructive",
      });
      setFlashcards(getSampleFlashcards());
    } finally {
      setIsLoading(false);
    }
  };

  // Create and download a PDF of flashcards
  const downloadAsPDF = () => {
    if (flashcards.length === 0) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Title
      doc.setFontSize(20);
      doc.text(`Flashcards: ${topic}`, margin, 20);

      let y = 40;

      flashcards.forEach((card, index) => {
        // Add new page if needed
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        // Question
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text(`Card ${index + 1}: Question`, margin, y);
        y += 10;

        doc.setFontSize(12);
        doc.setFont(undefined, "normal");
        const questionLines = doc.splitTextToSize(card.question, contentWidth);
        doc.text(questionLines, margin, y);
        y += questionLines.length * 7 + 5;

        // Answer
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("Answer:", margin, y);
        y += 10;

        doc.setFontSize(12);
        doc.setFont(undefined, "normal");
        const answerLines = doc.splitTextToSize(card.answer, contentWidth);
        doc.text(answerLines, margin, y);
        y += answerLines.length * 7 + 20;
      });

      doc.save(`${topic.replace(/\s+/g, "-").toLowerCase()}-flashcards.pdf`);

      toast({
        title: "PDF Downloaded",
        description: "Your flashcards have been saved as a PDF",
      });
    } catch (error) {
      console.error("PDF creation error:", error);
      toast({
        title: "Download Failed",
        description: "There was a problem creating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Share flashcards
  const shareFlashcards = async () => {
    if (flashcards.length === 0) return;

    try {
      const text = flashcards
        .map(
          (card, index) =>
            `Card ${index + 1}:\nQuestion: ${card.question}\nAnswer: ${
              card.answer
            }\n`
        )
        .join("\n");

      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);

      toast({
        title: "Copied to Clipboard",
        description: "Flashcards have been copied to your clipboard",
      });
    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "Share Failed",
        description: "Failed to copy flashcards to clipboard",
        variant: "destructive",
      });
    }
  };

  // Navigate to the next card
  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Navigate to the previous card
  const prevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setCurrentCardIndex((prevIndex) => prevIndex - 1);
    }
  };

  // Generate quiz questions from flashcards
  const generateQuizQuestions = () => {
    if (flashcards.length === 0) return [];

    return flashcards.map((card, index) => {
      // Determine the type of question (variety of formats)
      const questionType =
        index % 3 === 0
          ? "multiple-choice"
          : index % 3 === 1
          ? "true-false"
          : "single-choice";

      let options = [];
      let correctAnswer = "";

      switch (questionType) {
        case "multiple-choice":
          // Create plausible options from the answer
          const answer = card.answer;
          const mainAnswer = answer.split(".")[0]; // Get first sentence as correct answer
          correctAnswer = mainAnswer;

          // Generate 3 other plausible options
          options = [
            mainAnswer,
            `A somewhat related but incorrect statement about ${topic}.`,
            `A common misconception about ${card.question.split("?")[0]}.`,
            `An entirely unrelated fact about ${topic}.`,
          ];

          // Shuffle options
          options = shuffleArray(options);
          break;

        case "true-false":
          correctAnswer = "True";
          options = ["True", "False"];
          break;

        case "single-choice":
          // Extract key term from the answer
          const terms =
            card.answer.match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*\b/g) ||
            [];
          correctAnswer =
            terms.length > 0
              ? terms[0]
              : card.answer.split(" ").slice(0, 2).join(" ");

          // Generate options including the correct one
          options = [
            correctAnswer,
            `Alternative term 1 related to ${topic}`,
            `Alternative term 2 related to ${topic}`,
            `Alternative term 3 related to ${topic}`,
          ];

          // Shuffle options
          options = shuffleArray(options);
          break;
      }

      return {
        question: card.question,
        options: options,
        correctAnswer: correctAnswer,
        type: questionType,
        explanation: card.answer,
      };
    });
  };

  // Shuffle array helper function
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Start quiz mode with multiple choice questions
  const startQuizMode = () => {
    if (flashcards.length === 0) return;

    const generatedQuestions = generateQuizQuestions();
    setQuizQuestions(generatedQuestions);
    setQuizMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setAnsweredCards(new Array(flashcards.length).fill(null));
    setCorrectAnswers(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setAnswered(false);

    toast({
      title: "Quiz Mode Activated",
      description: "Test your knowledge with multiple choice questions",
    });
  };

  // Handle selecting a quiz answer
  const handleAnswerSelect = (option) => {
    setSelectedAnswer(option);
    setAnswered(true);

    const currentQuestion = quizQuestions[currentCardIndex];
    const isCorrect = option === currentQuestion.correctAnswer;

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }

    const newAnsweredCards = [...answeredCards];
    newAnsweredCards[currentCardIndex] = isCorrect;
    setAnsweredCards(newAnsweredCards);
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentCardIndex < quizQuestions.length - 1) {
      setCurrentCardIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setIsFlipped(false);
    } else {
      // Show results when all questions are answered
      setShowResults(true);
    }
  };

  // Reset the quiz
  const resetQuiz = () => {
    setQuizMode(false);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setAnsweredCards([]);
    setCorrectAnswers(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  // Suggested biology/medical topics
  const topicSuggestions = [
    "Cell Biology",
    "Human Anatomy",
    "Neuroscience",
    "Immunology",
    "Genetics",
    "Microbiology",
    "Physiology",
    "Pharmacology",
  ];

  return (
    <div className="min-h-full flex flex-col">
      {/* Input Panel */}
      <div className="p-4 border-b bg-white">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="topic" className="mb-2 block text-sm">
              Topic
            </Label>
            <div className="relative">
              <Input
                id="topic"
                placeholder="e.g., Cell Biology, Genetics, Anatomy..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="flex-shrink-0">
            <Label htmlFor="numCards" className="mb-2 block text-sm">
              Cards
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="numCards"
                type="number"
                min="1"
                max="20"
                value={numCards}
                onChange={(e) =>
                  setNumCards(
                    Math.min(20, Math.max(1, parseInt(e.target.value) || 5))
                  )
                }
                className="w-16"
              />

              <Button
                onClick={handleGenerate}
                disabled={isLoading || !topic.trim()}
                className="min-w-[90px]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <LoadingSpinner text="Generating flashcards..." />
        ) : flashcards.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8 text-center">
            <div>
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Generate flashcards to get started
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Enter a biology or medical topic and specify how many cards
                you'd like to create.
              </p>
            </div>
          </div>
        ) : quizMode && showResults ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white border border-gray-200 mb-4">
                {correctAnswers > flashcards.length / 2 ? (
                  <CheckCircle className="h-10 w-10 text-primary" />
                ) : (
                  <AlertCircle className="h-10 w-10 text-amber-500" />
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>

              <p className="text-lg mb-6">
                Your Score: {correctAnswers} of {flashcards.length}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={resetQuiz}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>

                <Button
                  onClick={() => {
                    setQuizMode(false);
                    setShowResults(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Book className="h-4 w-4" />
                  Study Mode
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{topic} Flashcards</h2>

              <div className="flex flex-wrap gap-2">
                {!quizMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadAsPDF}
                      className="gap-1 hidden sm:flex"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareFlashcards}
                      className="gap-1 hidden sm:flex"
                    >
                      {copiedText ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                      {copiedText ? "Copied!" : "Copy All"}
                    </Button>

                    <Button onClick={startQuizMode} size="sm" className="gap-1">
                      <BrainCircuit className="h-4 w-4" />
                      Quiz Mode
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      setQuizMode(false);
                      setAnsweredCards([]);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    Exit Quiz Mode
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {!quizMode ? (
                // Study mode - existing card display
                <>
                  <div className="flex-1 flex items-center justify-center mb-4">
                    <div className="w-full max-w-2xl">
                      <div
                        className="relative w-full"
                        style={{ perspective: "1000px" }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`card-${currentCardIndex}-${
                              isFlipped ? "back" : "front"
                            }`}
                            initial={{
                              rotateY: isFlipped ? -90 : 90,
                              opacity: 0,
                            }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="w-full"
                            style={{
                              transformStyle: "preserve-3d",
                            }}
                          >
                            <Card
                              className="w-full h-64 sm:h-80 p-6 flex flex-col shadow-md cursor-pointer"
                              onClick={() => setIsFlipped(!isFlipped)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="text-xs font-medium text-gray-500 mb-4">
                                  Card {currentCardIndex + 1} of{" "}
                                  {flashcards.length}
                                </div>

                                <div className="text-xs font-medium text-primary px-2 py-1 rounded-full bg-primary/5">
                                  {isFlipped ? "Answer" : "Question"}
                                </div>
                              </div>

                              <div className="flex-1 flex items-center justify-center">
                                {!isFlipped ? (
                                  // Question side
                                  <div className="text-center">
                                    <h3 className="text-xl font-semibold mb-4">
                                      {flashcards[currentCardIndex]?.question}
                                    </h3>
                                    <p className="text-sm text-gray-500 italic mt-4">
                                      Click to see answer
                                    </p>
                                  </div>
                                ) : (
                                  // Answer side
                                  <div className="w-full">
                                    <div className="text-center mb-2">
                                      <div className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-primary/10 mb-3">
                                        <BookOpen className="h-3 w-3 mr-1 text-primary" />
                                        <span className="text-xs font-medium text-primary">
                                          Answer
                                        </span>
                                      </div>
                                    </div>
                                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 shadow-sm">
                                      <div className="text-center">
                                        <p className="text-lg font-medium text-primary">
                                          {formatAnswer(
                                            flashcards[currentCardIndex]?.answer
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-center mt-3">
                                      <p className="text-xs text-gray-500">
                                        Click to see question
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={prevCard}
                      disabled={currentCardIndex === 0}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="text-sm text-gray-500">
                      {currentCardIndex + 1} of {flashcards.length}
                    </div>

                    <Button
                      variant="outline"
                      onClick={nextCard}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                // Quiz mode - multiple choice questions
                <>
                  <div className="flex-1 mb-4">
                    <Card className="max-w-2xl mx-auto p-6">
                      <div className="text-xs text-gray-500 mb-4">
                        Question {currentCardIndex + 1} of{" "}
                        {quizQuestions.length}
                      </div>

                      <div className="mb-4">
                        <Badge variant="outline" className="mb-2">
                          {quizQuestions[currentCardIndex]?.type ===
                          "multiple-choice"
                            ? "Multiple Choice"
                            : quizQuestions[currentCardIndex]?.type ===
                              "true-false"
                            ? "True or False"
                            : "Single Choice"}
                        </Badge>
                        <h3 className="text-lg font-medium">
                          {quizQuestions[currentCardIndex]?.question}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {quizQuestions[currentCardIndex]?.options.map(
                          (option, index) => (
                            <div
                              key={index}
                              className={`p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors ${
                                answered
                                  ? option ===
                                    quizQuestions[currentCardIndex]
                                      ?.correctAnswer
                                    ? "border-green-500 bg-green-50"
                                    : selectedAnswer === option
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200"
                                  : selectedAnswer === option
                                  ? "border-primary"
                                  : "border-gray-200"
                              }`}
                              onClick={() => {
                                if (!answered) handleAnswerSelect(option);
                              }}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                                  {answered ? (
                                    option ===
                                    quizQuestions[currentCardIndex]
                                      ?.correctAnswer ? (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : selectedAnswer === option ? (
                                      <XCircle className="h-5 w-5 text-red-500" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-gray-300" />
                                    )
                                  ) : selectedAnswer === option ? (
                                    <Check className="h-5 w-5 text-primary" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-gray-300" />
                                  )}
                                </div>
                                <div className="ml-3 text-sm">{option}</div>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {answered && (
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                          <div className="text-sm font-medium mb-1 text-primary">
                            {selectedAnswer ===
                            quizQuestions[currentCardIndex]?.correctAnswer
                              ? "Correct!"
                              : "Incorrect"}
                          </div>
                          <div className="text-sm text-center">
                            <span className="font-medium">Answer: </span>
                            {formatAnswer(
                              quizQuestions[currentCardIndex]?.explanation
                            )}
                          </div>
                        </div>
                      )}
                    </Card>

                    <div className="flex justify-end mt-4">
                      {answered ? (
                        <Button onClick={nextQuestion}>
                          {currentCardIndex === quizQuestions.length - 1
                            ? "See Results"
                            : "Next Question"}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handleAnswerSelect(null)}
                        >
                          Skip Question
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
