"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Upload,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  Lightbulb,
  Presentation,
  Share2,
  Trophy,
  Check,
  X,
  Brain,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { jsPDF } from "jspdf";
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

export default function AISlides() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [fileName, setFileName] = useState("");
  const [activeSummaryIndex, setActiveSummaryIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("summaries");

  // Quiz mode state
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizScore, setQuizScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [confettiTriggered, setConfettiTriggered] = useState(false);

  const confettiCanvasRef = useRef(null);
  const { toast } = useToast();

  // Sample data for fallback
  const getSampleSummaries = () => [
    {
      title: "Introduction to Cell Biology",
      summary:
        "Cell biology focuses on understanding the structure, function, and behavior of cells. This slide introduces the fundamental concepts of cellular organization, including the cell membrane, cytoplasm, nucleus, and various organelles. The cell is the basic unit of life, capable of independent existence and containing the necessary information to control its own growth and reproduction.",
    },
    {
      title: "Cell Membrane Structure",
      summary:
        "The cell membrane, or plasma membrane, is a selectively permeable barrier composed of a phospholipid bilayer with embedded proteins. The phospholipids have hydrophilic heads and hydrophobic tails, creating a structure that regulates the passage of materials into and out of the cell. Integral proteins span the entire membrane while peripheral proteins attach to the membrane surface.",
    },
    {
      title: "Membrane Transport",
      summary:
        "Cells utilize various transport mechanisms to move substances across the membrane. Passive transport, including diffusion and osmosis, requires no energy and moves molecules from high to low concentration. Active transport uses energy (ATP) to move substances against their concentration gradient. Endocytosis and exocytosis involve the movement of larger materials through vesicle formation.",
    },
    {
      title: "Cellular Organelles",
      summary:
        "Eukaryotic cells contain specialized compartments called organelles that perform specific functions. The nucleus houses genetic material, mitochondria generate energy, endoplasmic reticulum synthesizes proteins and lipids, Golgi apparatus processes and packages proteins, lysosomes contain digestive enzymes, and peroxisomes detoxify harmful substances.",
    },
    {
      title: "Cell Division",
      summary:
        "Cell division is the process by which cells reproduce. Mitosis is the division of the nucleus resulting in two identical daughter cells, while cytokinesis is the division of the cytoplasm. The cell cycle consists of interphase (G1, S, G2 phases) and the mitotic phase. Proper regulation of cell division is essential for normal growth, development, and tissue repair.",
    },
  ];

  const getSampleQuizQuestions = () => [
    {
      question: "What is the main function of the cell membrane?",
      answer:
        "The main function of the cell membrane is to act as a selectively permeable barrier that regulates the passage of materials into and out of the cell.",
    },
    {
      question: "Differentiate between passive and active transport.",
      answer:
        "Passive transport requires no energy and moves molecules from high to low concentration, while active transport requires energy (ATP) and moves substances against their concentration gradient.",
    },
    {
      question: "Name and describe the function of three cellular organelles.",
      answer:
        "1) Nucleus: houses genetic material and controls cellular activities, 2) Mitochondria: generates energy in the form of ATP through cellular respiration, 3) Endoplasmic reticulum: synthesizes proteins and lipids.",
    },
    {
      question: "What are the phases of the cell cycle?",
      answer:
        "The cell cycle consists of interphase (G1, S, G2) and the mitotic phase (mitosis and cytokinesis). G1 is the first growth phase, S is the DNA synthesis phase, G2 is the second growth phase, and the mitotic phase is when nuclear and cytoplasmic division occur.",
    },
    {
      question: "Explain the structure of the phospholipid bilayer.",
      answer:
        "The phospholipid bilayer consists of two layers of phospholipid molecules. Each phospholipid has a hydrophilic (water-loving) head and two hydrophobic (water-repelling) fatty acid tails. The heads face outward toward the aqueous environment, while the tails face inward away from water, creating a stable barrier.",
    },
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    // Reset quiz state
    setQuizMode(false);
    setCurrentQuizQuestion(0);
    setUserAnswers([]);
    setQuizScore(0);
    setShowAnswer(false);
    setQuizCompleted(false);
    setShowResults(false);
    setConfettiTriggered(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/gemini/slides", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to analyze slides");
        }

        // Check if we received a summary string (API response) or an array (expected format)
        let processedSummaries = [];
        if (data.summary && typeof data.summary === "string") {
          // Transform the summary string into a proper summaries array
          const paragraphs = data.summary
            .split("\n\n")
            .filter((p) => p.trim().length > 0);

          if (paragraphs.length > 0) {
            processedSummaries = paragraphs.map((paragraph, index) => ({
              title: `Slide ${index + 1}`,
              summary: paragraph.trim(),
            }));
          } else {
            // If we can't split it well, just use the whole thing as one summary
            processedSummaries = [
              {
                title: "Slide Analysis",
                summary: data.summary,
              },
            ];
          }
        } else if (data.summaries && Array.isArray(data.summaries)) {
          // Use the summaries array as is
          processedSummaries = data.summaries;
        }

        // Process quiz questions
        let processedQuizQuestions = [];
        if (data.quizQuestions && Array.isArray(data.quizQuestions)) {
          processedQuizQuestions = data.quizQuestions;
        }

        setSummaries(processedSummaries);
        setQuizQuestions(processedQuizQuestions);
        setActiveSummaryIndex(0);
        setActiveTab("summaries");

        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${processedSummaries.length} slide sections`,
        });
      } catch (apiError) {
        console.error("API Error:", apiError);

        // Use sample data as fallback
        const sampleSummaries = getSampleSummaries();
        const sampleQuizzes = getSampleQuizQuestions();

        setSummaries(sampleSummaries);
        setQuizQuestions(sampleQuizzes);
        setActiveSummaryIndex(0);
        setActiveTab("summaries");

        toast({
          title: "Using Sample Data",
          description:
            "We couldn't connect to our AI service. Using sample data instead.",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error analyzing slides:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to analyze slides. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = () => {
    if (!summaries || !summaries.length) {
      toast({
        title: "No content to download",
        description: "There are no summaries or quiz questions to download.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.text(`AI Analysis of: ${fileName || "Slides"}`, 20, y);
    y += 15;

    if (activeTab === "summaries") {
      doc.setFontSize(16);
      doc.text("Slide Summaries", 20, y);
      y += 10;

      if (summaries && Array.isArray(summaries)) {
        summaries.forEach((summary, index) => {
          y += 10;
          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.text(
            `Slide ${index + 1}: ${summary?.title || "Slide Summary"}`,
            20,
            y
          );
          y += 10;

          doc.setFontSize(12);
          doc.setFont(undefined, "normal");
          const summaryText = summary?.summary || "No summary available.";
          const summaryLines = doc.splitTextToSize(summaryText, 170);
          doc.text(summaryLines, 20, y);
          y += summaryLines.length * 7;

          if (y > 250) {
            doc.addPage();
            y = 20;
          }
        });
      }
    } else {
      doc.setFontSize(16);
      doc.text("Quiz Questions", 20, y);
      y += 10;

      if (quizQuestions && Array.isArray(quizQuestions)) {
        quizQuestions.forEach((quiz, index) => {
          y += 10;
          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.text(`Question ${index + 1}:`, 20, y);
          y += 10;

          doc.setFontSize(12);
          doc.setFont(undefined, "normal");
          const questionText = quiz?.question || "Question unavailable";
          const questionLines = doc.splitTextToSize(questionText, 170);
          doc.text(questionLines, 20, y);
          y += questionLines.length * 7 + 5;

          doc.setFont(undefined, "bold");
          doc.text("Answer:", 20, y);
          y += 10;

          doc.setFont(undefined, "normal");
          const answerText = quiz?.answer || "Answer unavailable";
          const answerLines = doc.splitTextToSize(answerText, 170);
          doc.text(answerLines, 20, y);
          y += answerLines.length * 7 + 10;

          if (y > 250) {
            doc.addPage();
            y = 20;
          }
        });
      }
    }

    doc.save(
      `obstutor-${activeTab === "summaries" ? "summaries" : "quiz"}-${
        fileName || "slides"
      }.pdf`
    );

    toast({
      title: "PDF Downloaded",
      description: `Your ${
        activeTab === "summaries" ? "summaries" : "quiz questions"
      } have been downloaded as a PDF file.`,
    });
  };

  const shareContent = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Obstutor Analysis: ${fileName}`,
          text: "Check out this slide analysis I created with Obstutor AI!",
        });

        toast({
          title: "Shared Successfully",
          description: "Your analysis has been shared.",
        });
      } else {
        await navigator.clipboard.writeText(
          `I analyzed "${fileName}" with Obstutor AI and got ${
            summaries?.length || 0
          } slide summaries and ${quizQuestions?.length || 0} quiz questions!`
        );

        toast({
          title: "Link Copied",
          description: "Share text copied to clipboard!",
        });
      }
    } catch (error) {
      console.error("Error sharing content:", error);
      toast({
        title: "Error",
        description: "Failed to share. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const navigateSummary = (direction) => {
    if (!summaries || !Array.isArray(summaries) || summaries.length === 0)
      return;

    if (direction === "next" && activeSummaryIndex < summaries.length - 1) {
      setActiveSummaryIndex(activeSummaryIndex + 1);
    } else if (direction === "prev" && activeSummaryIndex > 0) {
      setActiveSummaryIndex(activeSummaryIndex - 1);
    }
  };

  const startQuizMode = () => {
    if (!quizQuestions || quizQuestions.length === 0) {
      toast({
        title: "No quiz questions available",
        description: "There are no quiz questions to display.",
        variant: "destructive",
      });
      return;
    }

    setQuizMode(true);
    setCurrentQuizQuestion(0);
    setUserAnswers(new Array(quizQuestions.length).fill(null));
    setQuizScore(0);
    setShowAnswer(false);
    setQuizCompleted(false);
    setShowResults(false);
    setConfettiTriggered(false);

    toast({
      title: "Quiz Mode Activated!",
      description: `Test your knowledge with ${quizQuestions.length} questions based on the slides.`,
    });
  };

  const handleQuizAnswer = (isCorrect) => {
    // Update user answers
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuizQuestion] = isCorrect;
    setUserAnswers(newUserAnswers);

    // Update score if correct
    if (isCorrect) {
      setQuizScore((prevScore) => prevScore + 1);
    }

    // Show the answer
    setShowAnswer(true);

    // Check if all questions have been answered
    const allAnswered = newUserAnswers.every((answer) => answer !== null);

    // Wait a bit before proceeding
    setTimeout(() => {
      if (currentQuizQuestion < quizQuestions.length - 1 && !allAnswered) {
        // Move to next question
        setCurrentQuizQuestion((prevQuestion) => prevQuestion + 1);
        setShowAnswer(false);
      } else {
        // Quiz completed
        setQuizCompleted(true);
        setShowResults(true);

        // Trigger confetti for high scores
        if (quizScore / quizQuestions.length >= 0.7) {
          triggerConfetti();
        }
      }
    }, 1500);
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
      colors: ["#4F46E5", "#3B82F6", "#06B6D4", "#6366F1"],
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
    setCurrentQuizQuestion(0);
    setUserAnswers(new Array(quizQuestions.length).fill(null));
    setQuizScore(0);
    setShowAnswer(false);
    setQuizCompleted(false);
    setShowResults(false);
    setActiveTab("quiz");
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel - Upload and controls */}
        <div className="lg:w-1/3 space-y-6">
          <Card className="overflow-hidden border border-gray-100">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
              <div className="flex items-center gap-2">
                <Presentation className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Slides Analyzer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Upload Presentation</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                  </div>
                  {fileName && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <FileText className="h-3 w-3" />
                      {fileName}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Analyze Slides
                    </>
                  )}
                </Button>

                {loading && (
                  <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1 mt-2">
                    <Clock className="h-3 w-3 animate-pulse" />
                    This may take up to 30 seconds
                  </div>
                )}
              </div>

              {!file && (
                <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-amber-500" />
                    Tips for best results:
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
                    <li>Upload clear, text-based PDF slides</li>
                    <li>Ensure content is in English</li>
                    <li>Avoid slides with only images</li>
                    <li>For better results, include 5-15 slides</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {summaries && summaries.length > 0 && (
            <Card className="border border-gray-100">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  {quizMode ? (
                    <>
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Quiz Progress</span>
                          <span>
                            {userAnswers.filter((a) => a !== null).length} of{" "}
                            {quizQuestions.length}
                          </span>
                        </div>
                        <Progress
                          value={
                            (userAnswers.filter((a) => a !== null).length /
                              quizQuestions.length) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetQuiz}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        Exit Quiz Mode
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant={activeTab === "quiz" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setActiveTab("quiz");
                          if (quizQuestions && quizQuestions.length > 0) {
                            startQuizMode();
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2"
                        disabled={!quizQuestions || quizQuestions.length === 0}
                      >
                        <Brain className="h-4 w-4" />
                        Start Quiz Mode
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadAsPDF}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download{" "}
                        {activeTab === "summaries" ? "Summaries" : "Quiz"} PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareContent}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Share This Analysis
                      </Button>
                    </>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium mb-2">Analysis Stats:</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      {summaries.length} Slides
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Lightbulb className="h-3 w-3" />
                      {quizQuestions?.length || 0} Quiz Questions
                    </Badge>
                    {quizCompleted && (
                      <Badge
                        variant="default"
                        className="flex items-center gap-1 bg-green-600"
                      >
                        <Trophy className="h-3 w-3" />
                        Score: {quizScore}/{quizQuestions.length}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right panel - Results */}
        <div className="lg:w-2/3">
          {summaries && summaries.length > 0 ? (
            <Card className="border border-gray-100">
              <div className="border-b border-gray-100">
                <div className="flex">
                  <Button
                    variant={activeTab === "summaries" ? "ghost" : "ghost"}
                    className={`flex-1 rounded-none h-12 ${
                      activeTab === "summaries"
                        ? "border-b-2 border-primary font-medium"
                        : "text-gray-500"
                    }`}
                    onClick={() => handleTabChange("summaries")}
                  >
                    Slide Summaries
                  </Button>
                  <Button
                    variant={activeTab === "quiz" ? "ghost" : "ghost"}
                    className={`flex-1 rounded-none h-12 ${
                      activeTab === "quiz"
                        ? "border-b-2 border-primary font-medium"
                        : "text-gray-500"
                    }`}
                    onClick={() => handleTabChange("quiz")}
                  >
                    Quiz Questions
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab + (quizMode ? "-quiz" : "")}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "summaries" && !quizMode ? (
                      <div className="space-y-6">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-semibold">
                            Slide {activeSummaryIndex + 1} of{" "}
                            {summaries?.length || 0}
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateSummary("prev")}
                              disabled={activeSummaryIndex === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateSummary("next")}
                              disabled={
                                activeSummaryIndex ===
                                (summaries?.length || 0) - 1
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {summaries && summaries[activeSummaryIndex] && (
                          <Card className="bg-gray-50 border border-gray-200">
                            <CardContent className="p-6">
                              <h3 className="text-lg font-semibold mb-3">
                                {summaries[activeSummaryIndex].title ||
                                  "Slide Summary"}
                              </h3>
                              <p className="text-gray-700 leading-relaxed">
                                {summaries[activeSummaryIndex].summary ||
                                  "No summary available."}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        <div className="flex justify-center">
                          <div className="flex gap-1">
                            {summaries &&
                              Array.isArray(summaries) &&
                              summaries.map((_, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  className={`w-8 h-8 p-0 ${
                                    index === activeSummaryIndex
                                      ? "bg-primary text-primary-foreground"
                                      : "text-gray-400"
                                  }`}
                                  onClick={() => setActiveSummaryIndex(index)}
                                >
                                  {index + 1}
                                </Button>
                              ))}
                          </div>
                        </div>
                      </div>
                    ) : activeTab === "quiz" && !quizMode ? (
                      <div className="space-y-6">
                        <h3 className="font-semibold mb-4">
                          Quiz Questions ({quizQuestions?.length || 0})
                        </h3>
                        {quizQuestions &&
                          Array.isArray(quizQuestions) &&
                          quizQuestions.map((quiz, index) => (
                            <Card
                              key={index}
                              className="bg-gray-50 border border-gray-200 mb-4"
                            >
                              <CardContent className="p-6">
                                <div className="mb-1">
                                  <Badge>Question {index + 1}</Badge>
                                </div>
                                <h4 className="font-medium text-lg mb-3">
                                  {quiz?.question || "Question unavailable"}
                                </h4>
                                <div className="pt-3 border-t border-gray-200">
                                  <p className="text-sm text-gray-500 mb-1">
                                    Answer:
                                  </p>
                                  <p className="text-gray-700">
                                    {quiz?.answer || "Answer unavailable"}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      // Quiz Mode
                      <div className="space-y-6">
                        {quizQuestions &&
                          quizQuestions[currentQuizQuestion] && (
                            <motion.div
                              key={`quiz-${currentQuizQuestion}-${
                                showAnswer ? "answer" : "question"
                              }`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Card className="bg-gray-50 border border-gray-200 mb-6">
                                <CardContent className="p-6">
                                  <div className="mb-2 flex justify-between items-center">
                                    <Badge className="px-3 py-1">
                                      Question {currentQuizQuestion + 1} of{" "}
                                      {quizQuestions.length}
                                    </Badge>
                                    {showAnswer && (
                                      <Badge
                                        variant={
                                          userAnswers[currentQuizQuestion]
                                            ? "default"
                                            : "destructive"
                                        }
                                        className="px-3 py-1"
                                      >
                                        {userAnswers[currentQuizQuestion]
                                          ? "Correct!"
                                          : "Incorrect"}
                                      </Badge>
                                    )}
                                  </div>

                                  <h4 className="font-medium text-lg mb-6">
                                    {quizQuestions[currentQuizQuestion]
                                      .question || "Question unavailable"}
                                  </h4>

                                  {!showAnswer ? (
                                    <div className="flex flex-col gap-3 mt-6">
                                      <p className="text-sm text-center text-gray-500 mb-1">
                                        Do you know the answer?
                                      </p>
                                      <div className="flex gap-3 justify-center">
                                        <Button
                                          variant="default"
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => handleQuizAnswer(true)}
                                        >
                                          <Check className="mr-2 h-4 w-4" />
                                          Yes, I know it
                                        </Button>
                                        <Button
                                          variant="default"
                                          className="bg-rose-600 hover:bg-rose-700"
                                          onClick={() =>
                                            handleQuizAnswer(false)
                                          }
                                        >
                                          <X className="mr-2 h-4 w-4" />
                                          Still learning
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      transition={{ duration: 0.3 }}
                                      className="p-4 bg-gray-100 rounded-lg border border-gray-200"
                                    >
                                      <p className="text-sm font-medium mb-2 text-gray-700">
                                        Answer:
                                      </p>
                                      <p className="text-gray-700">
                                        {quizQuestions[currentQuizQuestion]
                                          .answer || "Answer unavailable"}
                                      </p>
                                    </motion.div>
                                  )}
                                </CardContent>
                              </Card>

                              <div className="flex gap-2 justify-center">
                                {Array.from({
                                  length: quizQuestions.length,
                                }).map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-3 h-3 rounded-full ${
                                      index === currentQuizQuestion
                                        ? "bg-primary"
                                        : userAnswers[index] !== null
                                        ? userAnswers[index]
                                          ? "bg-green-500"
                                          : "bg-rose-500"
                                        : "bg-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                  <Presentation className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Analysis Yet</h3>
                <p className="text-gray-500 mb-6">
                  Upload your presentation slides to get AI-powered summaries
                  and quiz questions.
                </p>
                <p className="text-sm text-gray-400">
                  Upload a PDF file to start
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Trophy
                className={`h-5 w-5 ${
                  quizScore / quizQuestions.length >= 0.7
                    ? "text-yellow-500"
                    : "text-blue-500"
                }`}
              />
              Quiz Results
            </DialogTitle>
            <DialogDescription className="text-center">
              You've completed the slides quiz!
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
                  {Math.round((quizScore / quizQuestions.length) * 100)}%
                </span>
              </motion.div>

              <h3 className="text-xl font-semibold mb-1">
                {quizScore} of {quizQuestions.length} correct
              </h3>

              <p className="text-gray-500 mb-4">
                {quizScore / quizQuestions.length >= 0.8
                  ? "Excellent work! You've mastered this content!"
                  : quizScore / quizQuestions.length >= 0.6
                  ? "Good job! You're on the right track!"
                  : "Keep practicing! You'll improve with more study."}
              </p>
            </div>

            {quizScore / quizQuestions.length >= 0.7 && (
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
                  Slide Master -{" "}
                  {fileName ? fileName.split(".")[0] : "Content Expert"}
                </p>
              </motion.div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowResults(false);
                resetQuiz();
              }}
              className="sm:flex-1"
            >
              Review Content Again
            </Button>
            <Button
              onClick={() => {
                setShowResults(false);
                setQuizMode(false);
                setActiveTab("summaries");
              }}
              className="sm:flex-1"
            >
              Back to Summaries
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
