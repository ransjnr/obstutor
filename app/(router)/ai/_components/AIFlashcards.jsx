"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Download,
  Share2,
  LibraryIcon,
  CheckCircle,
  Trophy,
  Brain,
  ArrowRight,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jsPDF } from "jspdf";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import confetti from "canvas-confetti";

const topics = [
  "Anatomy",
  "Physiology",
  "Cell Biology",
  "Genetics",
  "Immunology",
  "Microbiology",
  "Neuroscience",
  "Pathology",
  "Pharmacology",
  "Biochemistry",
];

export default function AIFlashcards() {
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  // Quiz mode state
  const [quizMode, setQuizMode] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [answeredCards, setAnsweredCards] = useState([]);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [userKnows, setUserKnows] = useState(false);
  const [confettiTriggered, setConfettiTriggered] = useState(false);

  const confettiCanvasRef = useRef(null);
  const { toast } = useToast();

  // Sample flashcards data for fallback
  const getSampleFlashcards = (selectedTopic) => [
    {
      question: "What are the four chambers of the human heart?",
      answer:
        "The four chambers of the human heart are the right atrium, right ventricle, left atrium, and left ventricle.",
    },
    {
      question: "What is the function of mitochondria in a cell?",
      answer:
        "Mitochondria are the powerhouses of the cell, responsible for generating energy in the form of ATP through cellular respiration.",
    },
    {
      question: "Name the four nitrogenous bases found in DNA.",
      answer:
        "The four nitrogenous bases in DNA are Adenine (A), Guanine (G), Cytosine (C), and Thymine (T).",
    },
    {
      question: "What is the difference between innate and adaptive immunity?",
      answer:
        "Innate immunity is the body's first line of defense and responds quickly but non-specifically to pathogens. Adaptive immunity is specific to particular pathogens, develops more slowly, and has memory.",
    },
    {
      question: "What is homeostasis?",
      answer:
        "Homeostasis is the process by which organisms maintain stable internal conditions necessary for survival, despite changes in the external environment.",
    },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setGenerationComplete(false);
    setQuizMode(false);
    setQuizScore(0);
    setAnsweredCards([]);
    setShowQuizResult(false);
    setCurrentStreak(0);
    setBestStreak(0);
    setConfettiTriggered(false);

    try {
      const selectedTopic = topic === "custom" ? customTopic : topic;

      try {
        // Prepare the request
        const response = await fetch("/api/gemini/flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: selectedTopic,
            numCards: 5,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Check if the API returned actual flashcards with content
        if (
          data.flashcards &&
          Array.isArray(data.flashcards) &&
          data.flashcards.length > 0
        ) {
          // Validate each flashcard has question and answer fields
          const validFlashcards = data.flashcards.filter(
            (card) =>
              card &&
              card.question &&
              card.question.trim() !== "" &&
              card.answer &&
              card.answer.trim() !== ""
          );

          if (validFlashcards.length > 0) {
            setFlashcards(validFlashcards);
            setCurrentCard(0);
            setFlipped(false);
            setGenerationComplete(true);
            setAnsweredCards(new Array(validFlashcards.length).fill(false));

            toast({
              title: "Flashcards Generated",
              description: `Created ${validFlashcards.length} flashcards about ${selectedTopic}`,
            });
            return; // Success - exit early
          }
        }

        // If we get here, we got a response but no valid flashcards
        throw new Error("No valid flashcards were generated");
      } catch (apiError) {
        console.error("API Error:", apiError);

        // Get topic-specific sample cards if possible
        const sampleCards = getSampleFlashcardsForTopic(selectedTopic);
        setFlashcards(sampleCards);
        setCurrentCard(0);
        setFlipped(false);
        setGenerationComplete(true);
        setAnsweredCards(new Array(sampleCards.length).fill(false));

        toast({
          title: "Using Sample Flashcards",
          description:
            "We couldn't connect to our AI service. Using sample flashcards instead.",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sample flashcards with topic-specific options
  const getSampleFlashcardsForTopic = (selectedTopic) => {
    // Convert topic to lowercase for easier matching
    const lowercaseTopic = selectedTopic.toLowerCase();

    // Topic-specific flashcard sets
    if (lowercaseTopic.includes("anatomy") || lowercaseTopic.includes("body")) {
      return [
        {
          question: "What are the four chambers of the human heart?",
          answer:
            "The four chambers are right atrium, right ventricle, left atrium, and left ventricle.",
        },
        {
          question: "Which bones make up the axial skeleton?",
          answer:
            "The axial skeleton consists of the skull, vertebral column, ribs, and sternum.",
        },
        {
          question: "What are the three main types of muscle tissue?",
          answer:
            "The three types are skeletal muscle, cardiac muscle, and smooth muscle.",
        },
        {
          question: "Name the lobes of the human brain.",
          answer:
            "The brain has four major lobes: frontal, parietal, temporal, and occipital.",
        },
        {
          question: "What is the largest organ in the human body?",
          answer: "The skin is the largest organ in the human body.",
        },
      ];
    } else if (
      lowercaseTopic.includes("cell") ||
      lowercaseTopic.includes("molecular")
    ) {
      return [
        {
          question: "What is the function of mitochondria in a cell?",
          answer:
            "Mitochondria are the powerhouses of the cell, responsible for generating energy in the form of ATP through cellular respiration.",
        },
        {
          question: "What is the role of ribosomes in a cell?",
          answer:
            "Ribosomes are the sites of protein synthesis, where mRNA is translated into proteins.",
        },
        {
          question: "Describe the structure of the cell membrane.",
          answer:
            "The cell membrane is a phospholipid bilayer with embedded proteins that controls what enters and exits the cell.",
        },
        {
          question:
            "What is the difference between prokaryotic and eukaryotic cells?",
          answer:
            "Prokaryotic cells lack membrane-bound organelles and a nucleus, while eukaryotic cells have a nucleus and various membrane-bound organelles.",
        },
        {
          question: "What happens during the process of mitosis?",
          answer:
            "Mitosis is cell division that results in two identical daughter cells, involving prophase, metaphase, anaphase, and telophase stages.",
        },
      ];
    } else if (
      lowercaseTopic.includes("genetics") ||
      lowercaseTopic.includes("dna") ||
      lowercaseTopic.includes("gene")
    ) {
      return [
        {
          question: "Name the four nitrogenous bases found in DNA.",
          answer:
            "The four nitrogenous bases in DNA are Adenine (A), Guanine (G), Cytosine (C), and Thymine (T).",
        },
        {
          question: "What is the central dogma of molecular biology?",
          answer:
            "The central dogma states that genetic information flows from DNA to RNA to protein (DNA → RNA → Protein).",
        },
        {
          question: "What is a gene?",
          answer:
            "A gene is a segment of DNA that contains the instructions for making a specific protein or RNA molecule.",
        },
        {
          question: "Describe the process of DNA replication.",
          answer:
            "DNA replication is semi-conservative: the double helix unwinds, each strand serves as a template, and complementary nucleotides pair up to form two identical DNA molecules.",
        },
        {
          question: "What are the differences between mitosis and meiosis?",
          answer:
            "Mitosis produces two genetically identical diploid cells, while meiosis produces four genetically diverse haploid cells used in sexual reproduction.",
        },
      ];
    } else if (
      lowercaseTopic.includes("immune") ||
      lowercaseTopic.includes("immunity")
    ) {
      return [
        {
          question:
            "What is the difference between innate and adaptive immunity?",
          answer:
            "Innate immunity is the body's first line of defense and responds quickly but non-specifically to pathogens. Adaptive immunity is specific to particular pathogens, develops more slowly, and has memory.",
        },
        {
          question: "What are antibodies and what is their function?",
          answer:
            "Antibodies (immunoglobulins) are Y-shaped proteins produced by B cells that bind to specific antigens to neutralize or mark them for destruction.",
        },
        {
          question: "What are the five classes of antibodies?",
          answer:
            "The five classes of antibodies are IgG, IgM, IgA, IgD, and IgE, each with different functions and locations in the body.",
        },
        {
          question: "What is the role of T cells in the immune system?",
          answer:
            "T cells are involved in cell-mediated immunity. Helper T cells activate other immune cells, while cytotoxic T cells directly kill infected or cancerous cells.",
        },
        {
          question: "What is inflammation and why is it important?",
          answer:
            "Inflammation is a protective response to tissue damage or infection. It involves increased blood flow, capillary permeability, and migration of immune cells to eliminate the cause and repair damaged tissue.",
        },
      ];
    } else {
      // Default general biology flashcards
      return getSampleFlashcards();
    }
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(22);
    doc.text(`Flashcards: ${topic === "custom" ? customTopic : topic}`, 20, y);
    y += 15;

    doc.setFontSize(12);
    flashcards.forEach((card, index) => {
      doc.setFont(undefined, "bold");
      doc.text(`Card ${index + 1} - Question:`, 20, y);
      y += 10;

      doc.setFont(undefined, "normal");
      const questionLines = doc.splitTextToSize(card.question, 170);
      doc.text(questionLines, 20, y);
      y += questionLines.length * 7;

      doc.setFont(undefined, "bold");
      doc.text(`Card ${index + 1} - Answer:`, 20, y);
      y += 10;

      doc.setFont(undefined, "normal");
      const answerLines = doc.splitTextToSize(card.answer, 170);
      doc.text(answerLines, 20, y);
      y += answerLines.length * 7 + 10;

      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(
      `obstutor-flashcards-${topic === "custom" ? customTopic : topic}.pdf`
    );

    toast({
      title: "PDF Downloaded",
      description: "Your flashcards have been downloaded as a PDF file.",
    });
  };

  const shareFlashcards = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Obstutor Flashcards: ${
            topic === "custom" ? customTopic : topic
          }`,
          text: "Check out these flashcards I created with Obstutor AI!",
        });

        toast({
          title: "Shared Successfully",
          description: "Your flashcards have been shared.",
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        await navigator.clipboard.writeText(
          `I created flashcards on "${
            topic === "custom" ? customTopic : topic
          }" with Obstutor AI!`
        );

        toast({
          title: "Link Copied",
          description: "Share link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error("Error sharing flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to share flashcards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setFlipped(false);
    }
  };

  const startQuizMode = () => {
    setQuizMode(true);
    setQuizScore(0);
    setAnsweredCards(new Array(flashcards.length).fill(false));
    setCurrentCard(0);
    setFlipped(false);
    setCurrentStreak(0);
    setBestStreak(0);
    setUserKnows(false);

    toast({
      title: "Quiz Mode Activated!",
      description: "Test your knowledge by marking cards as Known or Unknown.",
    });
  };

  const handleQuizAnswer = (knows) => {
    if (answeredCards[currentCard]) return; // Already answered this card

    // Update the answered cards array
    const newAnsweredCards = [...answeredCards];
    newAnsweredCards[currentCard] = true;
    setAnsweredCards(newAnsweredCards);

    setUserKnows(knows);

    // Update the score
    if (knows) {
      setQuizScore((prevScore) => prevScore + 1);
      setCurrentStreak((prev) => prev + 1);
      if (currentStreak + 1 > bestStreak) {
        setBestStreak(currentStreak + 1);
      }
    } else {
      setCurrentStreak(0);
    }

    // Check if all cards have been answered
    const allAnswered = newAnsweredCards.every((card) => card);
    if (allAnswered) {
      // Show results after a short delay
      setTimeout(() => {
        setShowQuizResult(true);
        if (quizScore / flashcards.length >= 0.8) {
          triggerConfetti();
        }
      }, 1000);
    } else {
      // Move to next unanswered card after a delay
      setTimeout(() => {
        let nextCard = currentCard;
        for (let i = 1; i <= flashcards.length; i++) {
          const index = (currentCard + i) % flashcards.length;
          if (!newAnsweredCards[index]) {
            nextCard = index;
            break;
          }
        }
        setCurrentCard(nextCard);
        setFlipped(false);
        setUserKnows(false);
      }, 1500);
    }
  };

  const triggerConfetti = () => {
    if (confettiTriggered) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const myConfetti = confetti.create(canvas, { resize: true });

    myConfetti({
      particleCount: 150,
      spread: 160,
      origin: { y: 0.6 },
      gravity: 0.8,
    });

    // Clean up after 2.5 seconds
    setTimeout(() => {
      document.body.removeChild(canvas);
    }, 2500);

    setConfettiTriggered(true);
  };

  const resetQuiz = () => {
    setQuizMode(false);
    setQuizScore(0);
    setAnsweredCards(new Array(flashcards.length).fill(false));
    setShowQuizResult(false);
    setCurrentStreak(0);
    setBestStreak(0);
    setUserKnows(false);
    setConfettiTriggered(false);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel - Generator */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <LibraryIcon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Flashcard Generator</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Select Topic</Label>
                <Select
                  value={topic}
                  onValueChange={(value) => setTopic(value)}
                >
                  <SelectTrigger id="topic" className="w-full">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Topic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {topic === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customTopic">Enter Custom Topic</Label>
                  <Input
                    id="customTopic"
                    placeholder="e.g., Cardiovascular System"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                  />
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={
                  loading || !topic || (topic === "custom" && !customTopic)
                }
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Flashcards"
                )}
              </Button>

              {!flashcards.length && (
                <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Popular topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Cellular Respiration",
                      "DNA Replication",
                      "Immune System",
                      "Neurotransmitters",
                      "Blood Types",
                    ].map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => {
                          setTopic("custom");
                          setCustomTopic(suggestion);
                        }}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {generationComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Generation Complete</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {flashcards.length} flashcards created about{" "}
                {topic === "custom" ? customTopic : topic}.
              </p>

              {!quizMode ? (
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={startQuizMode}
                    className="w-full flex items-center gap-2"
                    variant="default"
                  >
                    <Brain className="h-4 w-4" />
                    Start Quiz Mode
                  </Button>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadAsPDF}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareFlashcards}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {answeredCards.filter(Boolean).length} of{" "}
                        {flashcards.length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (answeredCards.filter(Boolean).length /
                          flashcards.length) *
                        100
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-blue-50 p-2 rounded-md">
                      <p className="text-xs text-gray-500">Current Streak</p>
                      <p className="text-lg font-bold text-blue-600">
                        {currentStreak}
                      </p>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-md">
                      <p className="text-xs text-gray-500">Best Streak</p>
                      <p className="text-lg font-bold text-amber-600">
                        {bestStreak}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetQuiz}
                    className="w-full"
                  >
                    Cancel Quiz
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right panel - Flashcards */}
        <div className="lg:w-2/3">
          {flashcards.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-[400px] relative">
                  <div
                    className={`w-full h-full cursor-pointer ${
                      quizMode && answeredCards[currentCard]
                        ? "pointer-events-none"
                        : ""
                    }`}
                    onClick={() => !quizMode && setFlipped(!flipped)}
                  >
                    <AnimatePresence initial={false} mode="wait">
                      <motion.div
                        key={flipped ? "back" : "front"}
                        initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-xl"
                      >
                        <div className="text-center">
                          <div className="mb-4 flex justify-center">
                            {!quizMode ? (
                              <Badge
                                variant={flipped ? "secondary" : "default"}
                                className="px-3 py-1 rounded-full"
                              >
                                {flipped ? "Answer" : "Question"}
                              </Badge>
                            ) : (
                              <Badge
                                variant="default"
                                className="px-3 py-1 rounded-full"
                              >
                                {answeredCards[currentCard]
                                  ? userKnows
                                    ? "You knew this! ✓"
                                    : "Keep studying this one ✗"
                                  : "Question"}
                              </Badge>
                            )}
                          </div>
                          <h2 className="text-2xl font-semibold mb-3">
                            {!quizMode || !flipped
                              ? `Question ${currentCard + 1}`
                              : "Answer"}
                          </h2>
                          <p className="text-lg leading-relaxed">
                            {!quizMode || !flipped
                              ? flashcards[currentCard].question
                              : flashcards[currentCard].answer}
                          </p>

                          {quizMode && !answeredCards[currentCard] && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-600 mb-2">
                                Do you know this?
                              </p>
                              <div className="flex justify-center gap-3">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleQuizAnswer(true)}
                                >
                                  I Know This
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-rose-600 hover:bg-rose-700"
                                  onClick={() => handleQuizAnswer(false)}
                                >
                                  Still Learning
                                </Button>
                              </div>
                            </div>
                          )}

                          {!quizMode && (
                            <div className="mt-8 text-sm text-gray-500">
                              {flipped
                                ? "Click to see question"
                                : "Click to see answer"}
                            </div>
                          )}

                          {quizMode && answeredCards[currentCard] && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setFlipped(!flipped)}
                              >
                                {flipped ? "View Question" : "View Answer"}
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Card {currentCard + 1} of {flashcards.length}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevCard}
                        disabled={
                          currentCard === 0 ||
                          (quizMode && !answeredCards[currentCard])
                        }
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextCard}
                        disabled={
                          currentCard === flashcards.length - 1 ||
                          (quizMode && !answeredCards[currentCard])
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {flashcards.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant={currentCard === index ? "default" : "outline"}
                      className={`w-full h-10 ${
                        quizMode && answeredCards[index] ? "bg-opacity-50" : ""
                      }`}
                      onClick={() => {
                        if (!quizMode || answeredCards[index]) {
                          setCurrentCard(index);
                          setFlipped(false);
                        }
                      }}
                    >
                      {index + 1}
                      {quizMode && answeredCards[index] && (
                        <span className="ml-1 text-xs">✓</span>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                  <LibraryIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No Flashcards Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Select a topic and generate flashcards to start studying.
                </p>
                <p className="text-sm text-gray-400">
                  Generated flashcards will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Results Dialog */}
      <Dialog open={showQuizResult} onOpenChange={setShowQuizResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Trophy
                className={`h-5 w-5 ${
                  quizScore / flashcards.length >= 0.8
                    ? "text-yellow-500"
                    : "text-blue-500"
                }`}
              />
              Quiz Results
            </DialogTitle>
            <DialogDescription className="text-center">
              You've completed the flashcard quiz!
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-white shadow-lg mb-4"
              >
                <span className="text-3xl font-bold">
                  {Math.round((quizScore / flashcards.length) * 100)}%
                </span>
              </motion.div>

              <h3 className="text-xl font-semibold mb-1">
                {quizScore} of {flashcards.length} correct
              </h3>

              <p className="text-gray-500 mb-4">
                {quizScore / flashcards.length >= 0.8
                  ? "Excellent work! You've mastered this topic!"
                  : quizScore / flashcards.length >= 0.6
                  ? "Good job! You're on the right track!"
                  : "Keep practicing! You'll improve with more study."}
              </p>

              <div className="flex justify-center gap-2 mb-2">
                <div className="bg-blue-50 px-3 py-2 rounded-lg">
                  <p className="text-xs text-gray-500">Best Streak</p>
                  <p className="text-lg font-bold text-blue-600">
                    {bestStreak}
                  </p>
                </div>
              </div>
            </div>

            {quizScore / flashcards.length >= 0.8 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-amber-50 rounded-lg p-4 text-center mb-4"
              >
                <div className="flex justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                </div>
                <h4 className="font-medium text-amber-800 mb-1">
                  Achievement Unlocked!
                </h4>
                <p className="text-sm text-amber-700">
                  {topic === "custom" ? customTopic : topic} Master
                </p>
              </motion.div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={resetQuiz} className="sm:flex-1">
              Study Again
            </Button>
            <Button
              onClick={() => {
                setShowQuizResult(false);
                handleGenerate();
              }}
              className="sm:flex-1"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              New Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
