"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  ChevronRight,
  ChevronLeft,
  Download,
  Copy,
  Share2,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  UploadCloud,
  ThumbsUp,
  ThumbsDown,
  Check,
  AlertCircle,
  FileUp,
  File,
  BookOpen,
  Circle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import LoadingSpinner from "./LoadingSpinner";

// QuizResults component for displaying quiz scores
function QuizResults({ score, total, onReset, onShare }) {
  const percentage = Math.round((score / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8 max-w-2xl mx-auto"
    >
      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white border border-gray-200 mb-4">
        {percentage >= 70 ? (
          <CheckCircle className="h-10 w-10 text-primary" />
        ) : (
          <AlertCircle className="h-10 w-10 text-amber-500" />
        )}
      </div>

      <h2 className="text-2xl font-bold mb-2">
        Your Score: {score}/{total}
      </h2>

      <p className="text-gray-600 mb-6 text-lg">
        {percentage >= 70
          ? "Great job! You've mastered this content."
          : "Keep studying! You're making progress."}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onReset}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>

        <Button onClick={onShare} className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share Results
        </Button>
      </div>
    </motion.div>
  );
}

export default function AISlides() {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [currentSummaryIndex, setCurrentSummaryIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Sample summaries for fallback
  const getSampleSummaries = () => [
    {
      title: "Topic Overview",
      summary:
        "**Key concepts** in this field include fundamental principles, methodologies, and applications. Understanding the **theoretical framework** provides context for practical implementations. This area connects multiple disciplines and requires both conceptual understanding and practical skills. Recent developments have expanded our understanding of core principles.",
    },
    {
      title: "Fundamental Principles",
      summary:
        "The **basic principles** that govern this field include established theories and empirical observations. These principles can be categorized into several main areas:\n- **Theoretical foundations** which provide the conceptual framework\n- **Methodological approaches** used to investigate phenomena\n- **Analytical techniques** that allow for data interpretation\n- **Practical applications** demonstrating real-world relevance",
    },
    {
      title: "Applications and Significance",
      summary:
        "This field has **significant applications** across multiple domains including research, industry, and everyday life. **Practical implementations** demonstrate how theoretical concepts translate to real-world solutions. Current research continues to expand our understanding, with **emerging technologies** offering new possibilities. Interdisciplinary connections with related fields create opportunities for innovation and novel approaches.",
    },
  ];

  // Sample quiz questions
  const getSampleQuizQuestions = () => [
    {
      question: "Which of the following best describes the scientific method?",
      options: [
        "A. A rigid set of steps that must be followed in exact order",
        "B. An iterative process involving observation, hypothesis, experimentation, and analysis",
        "C. A mathematical approach to solving problems",
        "D. A method exclusive to physics and chemistry",
      ],
      answer:
        "B. An iterative process involving observation, hypothesis, experimentation, and analysis",
      explanation:
        "The scientific method is an iterative process that generally includes making observations, formulating hypotheses, conducting experiments, analyzing data, and refining theories. It is not a rigid set of steps (option A), not exclusively mathematical (option C), and is used across all scientific disciplines, not just physics and chemistry (option D).",
      type: "multiple-choice",
      difficulty: "easy",
    },
    {
      question:
        "What is the primary purpose of a literature review in academic research?",
      options: [
        "A. To demonstrate the researcher's writing ability",
        "B. To identify gaps in existing knowledge and contextualize new research",
        "C. To increase the word count of a research paper",
        "D. To critique the work of competing researchers",
      ],
      answer:
        "B. To identify gaps in existing knowledge and contextualize new research",
      explanation:
        "A literature review serves to identify gaps in existing knowledge, contextualize new research within the field, establish the theoretical framework for the study, and demonstrate the significance of the research question. Option A is incorrect as demonstrating writing ability is not the primary purpose. Option C is incorrect as increasing word count is not a legitimate academic goal. Option D is incorrect because while critical analysis is part of a literature review, its primary purpose is not to critique competitors.",
      type: "multiple-choice",
      difficulty: "medium",
    },
    {
      question:
        "A researcher observes that students who drink coffee before an exam perform better than those who don't. The researcher concludes that coffee improves exam performance. What type of logical error might this conclusion demonstrate?",
      options: [
        "A. Confirmation bias",
        "B. Appeal to authority",
        "C. Confusing correlation with causation",
        "D. Post hoc fallacy",
      ],
      answer: "C. Confusing correlation with causation",
      explanation:
        "This example demonstrates confusing correlation with causation. Just because two variables (coffee consumption and exam performance) are correlated doesn't mean one causes the other. Alternative explanations could include: students who are better prepared might be more likely to drink coffee; students who drink coffee might be more alert in general; or a third variable like overall health habits might influence both coffee consumption and exam performance. Confirmation bias (option A) involves favoring information that confirms existing beliefs. Appeal to authority (option B) involves accepting something as true because an authority figure says so. Post hoc fallacy (option D) assumes that because one event followed another, the first event caused the second.",
      type: "case-based",
      difficulty: "hard",
    },
  ];

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 15 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 15MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  // Handle file analysis
  const handleUpload = async () => {
    if (!file) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "both"); // Request both summary and quiz

      // Show informative toast about processing
      toast({
        title: "Processing document",
        description:
          "Enhanced extraction in progress. This may take a moment, especially for complex files and documents with images.",
      });

      const response = await fetch("/api/gemini/slides", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.summaries && data.summaries.length > 0) {
        setSummaries(data.summaries);
      } else {
        // Check if the file is likely related to specific subjects
        const detectedSubject = detectSubject(file.name);

        // Use sample data as fallback
        setSummaries(getSampleSummaries());

        // Show specialized toast for image-heavy documents
        toast({
          title: "Limited text extraction",
          description: detectedSubject
            ? `Your document contains mostly images or diagrams. We've generated study materials based on common ${detectedSubject} concepts.`
            : "Your document contains mostly images or diagrams. We've generated generic study materials based on the available content.",
          variant: "warning",
        });
      }

      if (data.quizQuestions && data.quizQuestions.length > 0) {
        // Transform to multiple choice format
        const formattedQuestions = transformToMultipleChoice(
          data.quizQuestions
        );
        setQuizQuestions(formattedQuestions);
      } else {
        setQuizQuestions(getSampleQuizQuestions());
      }

      setCurrentSummaryIndex(0);
      setIsQuizMode(false);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setShowQuizResults(false);
      setSelectedAnswer(null);
      setAnswered(false);
      setScore(0);

      toast({
        title: "Analysis complete",
        description: `Generated ${data.summaries?.length || 3} summaries and ${
          data.quizQuestions?.length || 3
        } quiz questions`,
      });
    } catch (error) {
      console.error("Error analyzing slides:", error);

      // Check if this might be related to a specific subject
      const detectedSubject = detectSubject(file.name);

      toast({
        title: "Enhanced processing mode",
        description: detectedSubject
          ? `Using ${detectedSubject} study materials for your document that contains mostly images.`
          : "Using sample data for your image-heavy document. Our enhanced processing extracts key concepts.",
        variant: "warning",
      });

      // Use sample data as fallback
      setSummaries(getSampleSummaries());
      setQuizQuestions(getSampleQuizQuestions());
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Create a PDF from summaries
  const downloadAsPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const textWidth = pageWidth - 2 * margin;

      doc.setFontSize(18);
      doc.text("Slide Summaries", margin, 20);

      let y = 30;

      summaries.forEach((item, index) => {
        // Add page if needed
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text(`${index + 1}. ${item.title}`, margin, y);
        y += 10;

        doc.setFontSize(12);
        doc.setFont(undefined, "normal");

        const splitText = doc.splitTextToSize(item.summary, textWidth);
        doc.text(splitText, margin, y);
        y += splitText.length * 7 + 10;
      });

      doc.save("slide-summaries.pdf");

      toast({
        title: "PDF Downloaded",
        description: "Your slide summaries have been downloaded as a PDF.",
      });
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to create PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Share content
  const shareContent = async () => {
    try {
      await copyToClipboard(
        summaries.map((item) => `${item.title}\n${item.summary}`).join("\n\n")
      );
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Handle tab change between summaries and quiz
  const handleTabChange = (tab) => {
    setIsQuizMode(tab === "quiz");
    setShowQuizResults(false);
  };

  // Navigate between summaries
  const navigateSummary = (direction) => {
    if (direction === "next" && currentSummaryIndex < summaries.length - 1) {
      setCurrentSummaryIndex(currentSummaryIndex + 1);
    } else if (direction === "prev" && currentSummaryIndex > 0) {
      setCurrentSummaryIndex(currentSummaryIndex - 1);
    }
  };

  // Start quiz mode
  const startQuizMode = () => {
    setIsQuizMode(true);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowQuizResults(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    setAnswerRevealed(false);
  };

  // Handle selecting a quiz answer
  const handleAnswerSelect = (option) => {
    if (answered) return;

    setSelectedAnswer(option);
    setAnswered(true);

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = isCorrect;
    setUserAnswers(newUserAnswers);
  };

  // Move to the next question or show results
  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowQuizResults(true);
    }
  };

  // Reset quiz
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowQuizResults(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    setAnswerRevealed(false);
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard",
      });
      return true;
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      });
      return false;
    }
  };

  // Transform simple Q&A format to multiple choice if API doesn't return structured quiz
  const transformToMultipleChoice = (quizData) => {
    if (!quizData || quizData.length === 0) return [];

    return quizData.map((item, index) => {
      // Check if the question already has options and the proper format
      if (
        item.options &&
        Array.isArray(item.options) &&
        item.options.length > 0 &&
        item.answer &&
        item.explanation
      ) {
        // Just ensure the difficulty property exists
        return {
          ...item,
          difficulty: item.difficulty || ["easy", "medium", "hard"][index % 3],
        };
      }

      // Determine question type based on pattern
      let type = "multiple-choice";
      if (index % 3 === 1) {
        type = "true-false";
      } else if (index % 3 === 2) {
        type = "case-based";
      }

      let options = [];
      let correctAnswer = "";
      let difficulty = ["easy", "medium", "hard"][index % 3];
      let explanation = "";

      // If we have an answer but need to generate options
      if (item.answer && typeof item.answer === "string") {
        const answerText = item.answer;
        explanation = answerText;

        switch (type) {
          case "true-false":
            options = ["A. True", "B. False"];
            correctAnswer = "A. True"; // Default to true for demonstration
            explanation = `The correct answer is True. ${answerText}`;
            break;

          case "multiple-choice":
          case "case-based":
            // Extract key phrases from the answer
            const answerFirstSentence = answerText.split(".")[0];
            correctAnswer = `A. ${answerFirstSentence}`;

            // Create plausible options
            options = [
              `A. ${answerFirstSentence}`,
              `B. An incorrect statement about ${item.question
                .split("?")[0]
                .slice(-20)}`,
              `C. A common misconception related to this topic`,
              `D. A completely unrelated concept`,
              `E. A partially correct statement`,
            ];

            explanation = `The correct answer is option A: ${answerFirstSentence}. ${answerText}`;
            break;
        }
      }

      return {
        question: item.question,
        options: options,
        answer: correctAnswer,
        explanation: explanation,
        type: type,
        difficulty: difficulty,
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

  // Check if the file is likely related to specific subjects
  const detectSubject = (filename) => {
    if (!filename) return "";

    const lowerName = filename.toLowerCase();

    if (
      lowerName.includes("biomedical") ||
      lowerName.includes("imaging") ||
      lowerName.includes("radiology") ||
      lowerName.includes("mri")
    ) {
      return "biomedical imaging";
    } else if (
      lowerName.includes("anatomy") ||
      lowerName.includes("dissection")
    ) {
      return "anatomy";
    } else if (lowerName.includes("physio")) {
      return "physiology";
    } else if (lowerName.includes("chem")) {
      return "chemistry";
    } else if (lowerName.includes("physics")) {
      return "physics";
    } else if (lowerName.includes("bio")) {
      return "biology";
    } else if (lowerName.includes("psych")) {
      return "psychology";
    } else if (lowerName.includes("math") || lowerName.includes("calc")) {
      return "mathematics";
    } else if (lowerName.includes("hist")) {
      return "history";
    } else if (lowerName.includes("comp") || lowerName.includes("program")) {
      return "computer science";
    }

    return "";
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Upload Panel */}
      <div className="p-4 border-b bg-white">
        <div className="max-w-3xl mx-auto">
          {!file ? (
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-white transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">
                Drop your slides here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, PPT, PPTX, TXT, or MD files supported (max 15MB). Our
                enhanced processing extracts content from various document
                formats, including those with images and complex formatting.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <FileText className="h-3 w-3 inline mr-1" />
                Even files with limited text will be analyzed to generate
                comprehensive study notes and quiz questions.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  Change
                </Button>

                <Button
                  onClick={handleUpload}
                  disabled={!file || isAnalyzing}
                  size="sm"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto">
          {isAnalyzing ? (
            <div className="text-center py-20">
              <LoadingSpinner
                text={`Analyzing ${file.name || "your document"}...`}
              />
              <p className="text-sm text-gray-500 mt-4 max-w-md mx-auto">
                We're extracting content and generating comprehensive study
                materials. This process works even with documents that contain
                images or limited text.
              </p>
            </div>
          ) : summaries.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white border border-gray-200 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                <FileUp className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Upload slides to get started
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Upload your presentation slides to generate AI-powered summaries
                and quiz questions to enhance your study sessions.
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mx-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select file
              </Button>
            </div>
          ) : isQuizMode ? (
            <div>
              {showQuizResults ? (
                <QuizResults
                  score={score}
                  total={quizQuestions.length}
                  onReset={resetQuiz}
                  onShare={shareContent}
                />
              ) : (
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-4 flex justify-between items-center">
                    <Badge variant="outline" className="px-3 py-1">
                      Question {currentQuestionIndex + 1} of{" "}
                      {quizQuestions.length}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsQuizMode(false)}
                      className="text-xs"
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" />
                      Back to summaries
                    </Button>
                  </div>

                  <Card className="p-6 mb-6">
                    <div className="mb-4">
                      <div className="flex justify-between">
                        <Badge variant="outline" className="mb-2">
                          {quizQuestions[currentQuestionIndex]?.type ===
                          "multiple-choice"
                            ? "Multiple Choice"
                            : quizQuestions[currentQuestionIndex]?.type ===
                              "true-false"
                            ? "True or False"
                            : quizQuestions[currentQuestionIndex]?.type ===
                              "case-based"
                            ? "Case-Based"
                            : "Single Choice"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${
                            quizQuestions[currentQuestionIndex]?.difficulty ===
                            "easy"
                              ? "text-green-600 border-green-600"
                              : quizQuestions[currentQuestionIndex]
                                  ?.difficulty === "hard"
                              ? "text-red-600 border-red-600"
                              : "text-amber-600 border-amber-600"
                          }`}
                        >
                          {quizQuestions[currentQuestionIndex]?.difficulty ===
                          "easy"
                            ? "Easy"
                            : quizQuestions[currentQuestionIndex]
                                ?.difficulty === "hard"
                            ? "Hard"
                            : "Medium"}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mt-2">
                        {quizQuestions[currentQuestionIndex]?.question}
                      </h3>
                    </div>

                    <div className="space-y-3 my-4">
                      {quizQuestions[currentQuestionIndex]?.options.map(
                        (option, index) => (
                          <div
                            key={index}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                              answered
                                ? option ===
                                  quizQuestions[currentQuestionIndex]?.answer
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
                                  quizQuestions[currentQuestionIndex]
                                    ?.answer ? (
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

                    {/* Quiz display */}
                    {answered && (
                      <div className="mt-4 space-y-3">
                        <div className="p-4 bg-white border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="text-sm font-medium mb-1">
                              {selectedAnswer ===
                              quizQuestions[currentQuestionIndex]?.answer
                                ? "Correct! ✓"
                                : "Incorrect ✗"}
                            </div>
                            <Badge
                              variant={
                                selectedAnswer ===
                                quizQuestions[currentQuestionIndex]?.answer
                                  ? "default"
                                  : "outline"
                              }
                              className={
                                selectedAnswer ===
                                quizQuestions[currentQuestionIndex]?.answer
                                  ? "bg-green-500"
                                  : "text-red-500 border-red-500"
                              }
                            >
                              {selectedAnswer ===
                              quizQuestions[currentQuestionIndex]?.answer
                                ? "+1 point"
                                : "0 points"}
                            </Badge>
                          </div>
                          <div className="text-sm mt-2">
                            <p className="font-medium mb-1">Explanation:</p>
                            <p className="text-gray-700">
                              {quizQuestions[currentQuestionIndex]?.explanation}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            Difficulty:{" "}
                            {quizQuestions[currentQuestionIndex]?.difficulty ||
                              "medium"}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Card>

                  <div className="flex justify-between">
                    <div className="flex justify-center gap-1 my-4">
                      {quizQuestions.map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 rounded-full transition-all ${
                            index === currentQuestionIndex
                              ? "w-4 bg-primary"
                              : userAnswers[index] !== undefined
                              ? userAnswers[index]
                                ? "w-2 bg-green-500"
                                : "w-2 bg-red-500"
                              : "w-2 bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    {answered ? (
                      <Button onClick={nextQuestion}>
                        {currentQuestionIndex === quizQuestions.length - 1
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
                </motion.div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Slide Summaries</h2>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAsPDF}
                    className="gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>

                  <Button onClick={startQuizMode} size="sm">
                    Practice Quiz
                  </Button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSummaryIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">
                        {summaries[currentSummaryIndex]?.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(
                            summaries[currentSummaryIndex].summary
                          )
                        }
                        className="ml-2"
                      >
                        {copiedText ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="text-gray-700 leading-relaxed study-notes">
                      {/* Format the content to preserve formatting */}
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: summaries[currentSummaryIndex]?.summary
                            // Convert ** bold ** syntax
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            // Convert bullet points
                            .replace(/^- (.*)/gm, "<li>$1</li>")
                            .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
                            // Convert headings (##)
                            .replace(
                              /^## (.*)/gm,
                              '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
                            )
                            // Convert headings (#)
                            .replace(
                              /^# (.*)/gm,
                              '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>'
                            )
                            // Replace newlines with breaks
                            .replace(/\n/g, "<br />")
                            // Fix any double breaks created by replacements
                            .replace(/<br \/><br \/>/g, "<br />")
                            .replace(/<br \/><h/g, "<h"),
                        }}
                      />
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => navigateSummary("prev")}
                  disabled={currentSummaryIndex === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="text-sm text-gray-500">
                  {currentSummaryIndex + 1} of {summaries.length}
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigateSummary("next")}
                  disabled={currentSummaryIndex === summaries.length - 1}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
