"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Clock,
  Bookmark,
  Share2,
  Search,
  BookOpen,
  CheckCircle,
  XCircle,
  ArrowRight,
  Coffee,
  HeartPulse,
  Pill,
  Stethoscope,
  LucideFileText,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Star,
  ChevronDown,
  Heart,
  Award,
  BadgeCheck,
  Zap,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Send,
  Copy,
  CheckCheck,
  MessageSquare,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Exam tips data
const tips = [
  {
    id: 1,
    category: "Study Techniques",
    title: "Spaced Repetition",
    description:
      "Use spaced repetition to review material at increasing intervals. This technique leverages the psychological spacing effect, which demonstrates that information is more effectively remembered when studied in multiple sessions with increasing intervals between each session.",
    icon: Clock,
    tips: [
      "Create flashcards for key concepts and review them using a spaced repetition system",
      "Review material 1 day, 3 days, 7 days, and 14 days after initial learning",
      "Focus more time on difficult concepts, less on those you know well",
      "Use apps like Anki or Quizlet that have built-in spaced repetition",
    ],
  },
  {
    id: 2,
    category: "Mental Health",
    title: "Stress Management",
    description:
      "Managing stress is crucial for effective studying and exam performance. Chronic stress can impair memory formation and recall, while appropriate stress management techniques can improve cognitive function and information retention.",
    icon: Brain,
    tips: [
      "Practice deep breathing exercises when feeling overwhelmed",
      "Take regular short breaks (5-10 minutes) every 45-60 minutes of study",
      "Maintain physical activity - even a 20-minute walk can reduce stress",
      "Get 7-8 hours of sleep to allow for memory consolidation",
      "Try mindfulness meditation to improve focus and reduce anxiety",
    ],
  },
  {
    id: 3,
    category: "Exam Strategy",
    title: "Practice Testing",
    description:
      "Regular self-testing is one of the most effective study methods according to cognitive science research. Testing yourself activates retrieval processes that enhance long-term memory and helps identify knowledge gaps.",
    icon: BookOpen,
    tips: [
      "Complete practice questions under timed conditions to simulate exam pressure",
      "Review incorrect answers thoroughly to understand why you made mistakes",
      "Create your own questions based on lecture material and textbooks",
      "Form study groups to quiz each other on difficult concepts",
      "Use question banks specific to medical exams to familiarize with format and style",
    ],
  },
  {
    id: 4,
    category: "Health Optimization",
    title: "Nutrition and Brain Function",
    description:
      "Diet significantly impacts cognitive function and learning ability. Proper nutrition can enhance focus, memory, and mental endurance during demanding study sessions.",
    icon: Coffee,
    tips: [
      "Eat foods rich in omega-3 fatty acids (fish, walnuts, flaxseeds) to support brain function",
      "Stay hydrated - even mild dehydration can impair concentration and cognitive performance",
      "Include antioxidant-rich foods like berries, dark chocolate, and green tea",
      "Avoid high-sugar meals before studying, as they can lead to energy crashes",
      "Consider moderate caffeine intake (200-300mg) to enhance alertness, but avoid late consumption",
    ],
  },
  {
    id: 5,
    category: "Memory Techniques",
    title: "Active Recall",
    description:
      "Active recall involves actively stimulating memory during the learning process. It's more effective than passive methods like re-reading notes because it strengthens neural pathways associated with the information.",
    icon: Lightbulb,
    tips: [
      "After reading a section, close your book and summarize the key points",
      "Create concept maps connecting related ideas without referring to notes",
      "Teach concepts to someone else (or an imaginary student) in your own words",
      "Use the Feynman Technique: explain complex topics in simple language",
      "Write practice essays from memory, then check for accuracy",
    ],
  },
];

// Medical specialties for filter
const specialties = [
  "General Medicine",
  "Surgery",
  "Pediatrics",
  "Obstetrics & Gynecology",
  "Psychiatry",
  "Neurology",
  "Cardiology",
  "Emergency Medicine",
];

const categoryIcons = {
  "Study Techniques": Clock,
  "Mental Health": Brain,
  "Exam Strategy": BookOpen,
  "Health Optimization": Coffee,
  "Memory Techniques": Lightbulb,
};

export default function AITips() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSpecialty, setActiveSpecialty] = useState("");
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [savedTips, setSavedTips] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [slideDirection, setSlideDirection] = useState("right");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharingPlatform, setSharingPlatform] = useState("linkedin");
  const [copiedText, setCopiedText] = useState(false);
  const { toast } = useToast();

  // Filter tips based on active category
  const filteredTips =
    activeCategory === "all"
      ? tips
      : tips.filter((tip) => tip.category === activeCategory);

  // Get achievement status
  const getAchievementStatus = () => {
    const percentage = (savedTips.length / tips.length) * 100;
    if (percentage >= 80) return "Expert";
    if (percentage >= 50) return "Advanced";
    if (percentage >= 30) return "Intermediate";
    if (percentage > 0) return "Beginner";
    return "Not Started";
  };

  // Generate share templates based on platform
  const generateShareTemplate = (platform) => {
    const currentTip = filteredTips[activeTipIndex];
    const achievementText =
      savedTips.length > 0
        ? `I've saved ${savedTips.length}/${
            tips.length
          } study tips and reached ${getAchievementStatus()} level!`
        : "";

    const baseContent = {
      title: `${currentTip.title} - Study Tip from Obstutor AI`,
      text: currentTip.description,
      tipHighlight: currentTip.tips[0], // First tip as highlight
      category: currentTip.category,
      achievement: achievementText,
      hashtags: "#MedicalStudy #ObstutorAI #StudyTips #BiomedStudying",
      link: "https://obstutor.edu/ai-tips", // Example link
    };

    switch (platform) {
      case "linkedin":
        return `🎓 Study Tip: ${baseContent.title}\n\n${baseContent.text}\n\nKey Insight: "${baseContent.tipHighlight}"\n\n${baseContent.achievement}\n\nI'm using Obstutor AI to optimize my biomedical studies. Check it out if you're looking to level up your study routine!\n\n${baseContent.hashtags}`;

      case "twitter":
        return `📚 ${baseContent.title}\n\n"${baseContent.tipHighlight}"\n\n${baseContent.achievement}\n\nImproving my study game with @ObstutorAI\n\n${baseContent.hashtags}`;

      case "instagram":
        return `📱 ${baseContent.title}\n\n${baseContent.text}\n\nSwipe ➡️ for more study tips in ${baseContent.category}!\n\n${baseContent.achievement}\n\n...\n${baseContent.hashtags} #StudyGram #MedSchool`;

      case "reddit":
        return `[Study Tip] ${baseContent.title} for Medical Students\n\nI just learned this study technique in the ${baseContent.category} category:\n\n${baseContent.text}\n\nMy top takeaway: ${baseContent.tipHighlight}\n\n${baseContent.achievement}\n\nHas anyone else tried this method? What study techniques have worked best for you?`;

      case "whatsapp":
        return `📋 *${baseContent.title}*\n\n${baseContent.text}\n\n✅ *Key Tip:* ${baseContent.tipHighlight}\n\n${baseContent.achievement}\n\nCheck out Obstutor AI for more study resources: ${baseContent.link}`;

      case "snapchat":
        return `📸 Just learned: ${baseContent.title}\n\n"${baseContent.tipHighlight}"\n\n${baseContent.achievement}\n\nSwipe up to check out Obstutor AI for more study tips! #StudySession`;

      default:
        return `${baseContent.title}\n\n${baseContent.text}\n\nKey Tip: ${baseContent.tipHighlight}\n\n${baseContent.achievement}`;
    }
  };

  // Copy text to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Share text has been copied to your clipboard!",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the text manually.",
        variant: "destructive",
      });
    }
  };

  // Handle platform share
  const handlePlatformShare = async (platform) => {
    const shareText = generateShareTemplate(platform);

    // For mobile devices with native sharing
    if (
      navigator.share &&
      (platform === "whatsapp" || platform === "snapchat")
    ) {
      try {
        await navigator.share({
          title: `Study Tip: ${filteredTips[activeTipIndex].title}`,
          text: shareText,
        });
        toast({
          title: "Shared Successfully",
          description: `Your study tips were shared on ${
            platform.charAt(0).toUpperCase() + platform.slice(1)
          }!`,
        });
        setShowShareDialog(false);
      } catch (err) {
        // Fall back to clipboard if sharing fails
        copyToClipboard(shareText);
      }
    } else {
      // Desktop fallback - copy to clipboard
      copyToClipboard(shareText);
    }
  };

  // Generate example quiz results for sharing
  const generateQuizResults = () => {
    const correctAnswers = 4;
    const totalQuestions = 5;
    const percentage = (correctAnswers / totalQuestions) * 100;

    return {
      score: `${correctAnswers}/${totalQuestions}`,
      percentage: `${percentage}%`,
      topic: filteredTips[activeTipIndex].category,
      level: getAchievementStatus(),
    };
  };

  const handleSaveTip = (tipId) => {
    const wasSaved = savedTips.includes(tipId);

    if (wasSaved) {
      setSavedTips(savedTips.filter((id) => id !== tipId));
      toast({
        title: "Tip removed from saved",
        description: "This tip has been removed from your saved collection.",
        variant: "default",
      });
    } else {
      setSavedTips([...savedTips, tipId]);

      // Show confetti for new save
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      // Check if this is a milestone (25%, 50%, 75%, 100%)
      const newSavedCount = savedTips.length + 1;
      const milestone = Math.floor((newSavedCount / tips.length) * 4) * 25;
      const isMilestone =
        (newSavedCount / tips.length) * 100 >= milestone &&
        (savedTips.length / tips.length) * 100 < milestone;

      if (isMilestone) {
        toast({
          title: `🏆 Achievement Unlocked: ${milestone}%`,
          description: `You've saved ${milestone}% of all study tips! Keep collecting for more insights.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Tip saved",
          description: "This tip has been added to your saved collection.",
          variant: "default",
        });
      }
    }
  };

  const handleShareTip = async (tip) => {
    try {
      const text = `Study Tip: ${tip.title}\n${tip.description}\n\nFrom Obstutor AI`;

      if (navigator.share) {
        await navigator.share({
          title: `Obstutor Study Tip: ${tip.title}`,
          text: text,
        });

        toast({
          title: "Shared Successfully",
          description: "Your tip has been shared.",
        });
      } else {
        await navigator.clipboard.writeText(text);

        toast({
          title: "Copied to Clipboard",
          description: "Tip content copied to clipboard!",
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

  // Toggle sidebar visibility on mobile
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Navigate to previous tip with animation
  const prevTip = () => {
    if (activeTipIndex > 0) {
      setSlideDirection("left");
      setActiveTipIndex(activeTipIndex - 1);
    }
  };

  // Navigate to next tip with animation
  const nextTip = () => {
    if (activeTipIndex < filteredTips.length - 1) {
      setSlideDirection("right");
      setActiveTipIndex(activeTipIndex + 1);
    }
  };

  // Effect to handle sidebar on screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // On large screens, sidebar should always be visible in lg view
        setIsSidebarVisible(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animation variants for tip cards
  const cardVariants = {
    enter: (direction) => ({
      x: direction === "right" ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction === "right" ? -300 : 300,
      opacity: 0,
    }),
  };

  // Get achievement level display
  const achievementLevel = getAchievementStatus();
  const achievementIcon = () => {
    switch (achievementLevel) {
      case "Expert":
        return <Trophy className="h-3.5 w-3.5 text-yellow-500" />;
      case "Advanced":
        return <Award className="h-3.5 w-3.5 text-blue-500" />;
      case "Intermediate":
        return <BadgeCheck className="h-3.5 w-3.5 text-green-500" />;
      case "Beginner":
        return <Zap className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <Star className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  // Get platform icon component
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "linkedin":
        return <Linkedin className="h-5 w-5" />;
      case "twitter":
        return <Twitter className="h-5 w-5" />;
      case "instagram":
        return <Instagram className="h-5 w-5" />;
      case "reddit":
        return <MessageSquare className="h-5 w-5" />;
      case "whatsapp":
        return <Send className="h-5 w-5" />;
      case "snapchat":
        return (
          <img
            src="/snapchat-icon.svg"
            alt="Snapchat"
            className="h-5 w-5"
            onError={(e) => (e.target.src = "/default-icon.svg")}
          />
        );
      default:
        return <Share2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="h-full p-6 overflow-auto">
      {/* Share Results Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Results</DialogTitle>
            <DialogDescription>
              Share your study progress and tips with your network!
            </DialogDescription>
          </DialogHeader>

          {/* Quiz Results Preview */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-block p-2 rounded-full bg-primary/10 mb-2">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Quiz Results</h3>
              <div className="flex justify-center items-center gap-2 my-2">
                <div className="text-3xl font-bold text-primary">
                  {generateQuizResults().score}
                </div>
                <div className="text-sm text-gray-500">
                  ({generateQuizResults().percentage})
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Topic: {generateQuizResults().topic}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-xs">
                {achievementIcon()}
                <span>{generateQuizResults().level}</span>
              </div>
            </motion.div>
          </div>

          {/* Platform Selection */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              "linkedin",
              "twitter",
              "instagram",
              "reddit",
              "whatsapp",
              "snapchat",
            ].map((platform) => (
              <Button
                key={platform}
                variant={platform === sharingPlatform ? "default" : "outline"}
                className="flex flex-col items-center justify-center p-3 h-auto"
                onClick={() => setSharingPlatform(platform)}
              >
                {getPlatformIcon(platform)}
                <span className="mt-1 text-xs capitalize">
                  {platform === "twitter" ? "X" : platform}
                </span>
              </Button>
            ))}
          </div>

          {/* Share Text Preview */}
          <div className="relative">
            <Textarea
              className="min-h-[150px] font-sm"
              value={generateShareTemplate(sharingPlatform)}
              readOnly
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() =>
                copyToClipboard(generateShareTemplate(sharingPlatform))
              }
            >
              {copiedText ? (
                <CheckCheck className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => handlePlatformShare(sharingPlatform)}>
              {sharingPlatform === "whatsapp" || sharingPlatform === "snapchat"
                ? "Open App"
                : "Copy & Share"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confetti effect when saving tips */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute w-full h-full"
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: "50%",
                  y: "50%",
                  scale: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: Math.random() * 0.8 + 0.2,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeOut",
                }}
                style={{
                  backgroundColor: [
                    "#FF5733",
                    "#33FF57",
                    "#3357FF",
                    "#F3FF33",
                    "#FF33F3",
                  ][Math.floor(Math.random() * 5)],
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  borderRadius: "50%",
                }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Mobile header with toggle button */}
      <div className="lg:hidden flex items-center justify-between px-4 py-1.5 border-b mb-2">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h2 className="font-medium text-base">Exam Tips</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5 text-xs">
            {achievementIcon()}
            <span>{achievementLevel}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-gray-500 h-8 px-2"
          >
            {isSidebarVisible ? (
              <ChevronLeft className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            <span className="text-xs">
              {isSidebarVisible ? "Hide" : "Show"}
            </span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full min-h-0">
        {/* Left sidebar - collapsible on mobile */}
        <div
          className={`
            ${isSidebarVisible ? "block" : "hidden lg:block"} 
            lg:w-1/4 border-r border-gray-100 overflow-y-auto
            ${
              isSidebarVisible ? "max-h-[200px] lg:max-h-full" : "h-0 lg:h-auto"
            }
            transition-all duration-300 ease-in-out flex-shrink-0
          `}
        >
          <div className="p-4 h-full overflow-auto">
            <div className="hidden lg:flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Exam Tips</h2>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-xs">
                {achievementIcon()}
                <span>{achievementLevel}</span>
              </div>
            </div>

            {/* Filter section */}
            <div className="space-y-2">
              <Label htmlFor="category">Filter by Category</Label>
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {[...new Set(tips.map((tip) => tip.category))].map(
                    (category) => {
                      const CategoryIcon = categoryIcons[category] || Lightbulb;
                      return (
                        <SelectItem
                          key={category}
                          value={category}
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4 text-primary" />
                            {category}
                          </div>
                        </SelectItem>
                      );
                    }
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Progress indicator */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">Your Progress</span>
                <span className="text-xs font-medium">
                  {Math.round((savedTips.length / tips.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(savedTips.length / tips.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <Label>Browse Tips</Label>
                <Badge variant="outline" className="text-xs">
                  {filteredTips.length} tips
                </Badge>
              </div>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">All Tips</TabsTrigger>
                  <TabsTrigger value="saved">
                    Saved
                    {savedTips.length > 0 && (
                      <Badge
                        className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                        variant="secondary"
                      >
                        {savedTips.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="mt-4 space-y-2 h-full max-h-[calc(100vh-450px)] lg:max-h-[calc(100%-250px)] overflow-y-auto pr-1">
              <AnimatePresence>
                {activeTab === "all" ? (
                  filteredTips.map((tip, index) => {
                    const TipIcon = categoryIcons[tip.category] || Lightbulb;
                    const isActive = activeTipIndex === index;
                    const isSaved = savedTips.includes(tip.id);

                    return (
                      <motion.div
                        key={tip.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          variant={isActive ? "default" : "outline"}
                          className={`w-full justify-start text-left h-auto py-2 px-3 ${
                            isActive ? "bg-primary text-primary-foreground" : ""
                          } relative group`}
                          onClick={() => {
                            setSlideDirection(
                              index > activeTipIndex ? "right" : "left"
                            );
                            setActiveTipIndex(index);
                            if (window.innerWidth < 1024) {
                              setIsSidebarVisible(false);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <TipIcon
                                className={`h-3.5 w-3.5 ${
                                  isActive ? "text-white" : "text-primary"
                                }`}
                              />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-medium text-sm truncate">
                                {tip.title}
                              </span>
                              <span className="text-xs opacity-80 truncate">
                                {tip.category}
                              </span>
                            </div>
                            {isSaved && (
                              <div className="ml-1 text-xs">
                                <Bookmark
                                  className={`h-3 w-3 ${
                                    isActive ? "text-white" : "text-primary"
                                  }`}
                                />
                              </div>
                            )}
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })
                ) : savedTips.length > 0 ? (
                  tips
                    .filter((tip) => savedTips.includes(tip.id))
                    .map((tip, index) => {
                      const TipIcon = categoryIcons[tip.category] || Lightbulb;
                      return (
                        <motion.div
                          key={tip.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-2 px-3 group"
                            onClick={() => {
                              const newIndex = filteredTips.findIndex(
                                (t) => t.id === tip.id
                              );
                              if (newIndex !== -1) {
                                setSlideDirection(
                                  newIndex > activeTipIndex ? "right" : "left"
                                );
                                setActiveTipIndex(newIndex);
                                setActiveTab("all");
                                if (window.innerWidth < 1024) {
                                  setIsSidebarVisible(false);
                                }
                              }
                            }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <TipIcon className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium text-sm truncate">
                                  {tip.title}
                                </span>
                                <span className="text-xs opacity-80 truncate">
                                  {tip.category}
                                </span>
                              </div>
                              <div className="ml-1 text-xs">
                                <Bookmark className="h-3 w-3 text-primary" />
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                      );
                    })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-4 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 mx-auto mb-2 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-sm">No saved tips yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click the bookmark icon to save tips for later
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Main content - tips detail */}
        <div
          className={`
            flex-1 overflow-y-auto p-2 sm:p-4 min-h-0
            ${isSidebarVisible ? "hidden lg:block lg:flex-1" : "block flex-1"}
          `}
        >
          {filteredTips.length > 0 ? (
            <AnimatePresence
              mode="wait"
              initial={false}
              custom={slideDirection}
            >
              <motion.div
                key={filteredTips[activeTipIndex].id}
                custom={slideDirection}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="h-full flex flex-col"
              >
                <Card className="bg-white border border-gray-100 h-full flex flex-col">
                  <CardHeader className="pb-2 border-b border-gray-100 flex-shrink-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {/* Only show on mobile when sidebar is hidden */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleSidebar}
                          className="mr-2 lg:hidden"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Badge
                          variant="outline"
                          className="font-normal flex items-center gap-1"
                        >
                          {(() => {
                            const TipIcon =
                              categoryIcons[
                                filteredTips[activeTipIndex].category
                              ] || Lightbulb;
                            return (
                              <TipIcon className="h-3 w-3 mr-1 text-primary" />
                            );
                          })()}
                          {filteredTips[activeTipIndex].category}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowShareDialog(true)}
                          aria-label="Share quiz results"
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Share2 className="h-4 w-4" />
                          </motion.div>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleSaveTip(filteredTips[activeTipIndex].id)
                          }
                          className={
                            savedTips.includes(filteredTips[activeTipIndex].id)
                              ? "text-primary"
                              : ""
                          }
                          aria-label={
                            savedTips.includes(filteredTips[activeTipIndex].id)
                              ? "Unsave tip"
                              : "Save tip"
                          }
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Bookmark className="h-4 w-4" />
                          </motion.div>
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-xl mt-2">
                      {filteredTips[activeTipIndex].title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-3 pb-0 overflow-y-auto flex-grow min-h-0">
                    <div className="space-y-4 pb-2">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Overview</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {filteredTips[activeTipIndex].description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <h3 className="text-lg font-medium mb-2">Key Tips</h3>
                        <div className="space-y-2">
                          {filteredTips[activeTipIndex].tips.map(
                            (tip, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-3"
                              >
                                <div className="flex-shrink-0 mt-1">
                                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-primary" />
                                  </div>
                                </div>
                                <p className="text-gray-700">{tip}</p>
                              </motion.div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <h3 className="text-lg font-medium mb-2">
                          Apply This Tip
                        </h3>
                        <Card className="bg-gray-50 border border-gray-200">
                          <CardContent className="p-3">
                            <div className="flex gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium mb-1">
                                  Try it today
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Start implementing this tip in your study
                                  routine within the next 24 hours for maximum
                                  benefit. Research shows that immediate
                                  application significantly increases retention
                                  of new study methodologies.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-3 flex-shrink-0 border-t border-gray-100">
                    {/* Pagination with dots */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevTip}
                          disabled={activeTipIndex === 0}
                          className="w-24"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <div className="flex items-center justify-center gap-1">
                          {filteredTips.length <= 7 ? (
                            // Show all dots if there are 7 or fewer tips
                            filteredTips.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSlideDirection(
                                    index > activeTipIndex ? "right" : "left"
                                  );
                                  setActiveTipIndex(index);
                                }}
                                className={`h-2 w-2 rounded-full transition-all ${
                                  index === activeTipIndex
                                    ? "bg-primary w-4"
                                    : "bg-gray-300"
                                }`}
                                aria-label={`Go to tip ${index + 1}`}
                              />
                            ))
                          ) : (
                            // Show limited dots with ellipsis for more than 7 tips
                            <>
                              {Array.from({ length: 5 }).map((_, index) => {
                                // Calculate which dots to show based on active index
                                let displayIndex;
                                if (activeTipIndex < 2) {
                                  // At the beginning, show first 5 dots
                                  displayIndex = index;
                                } else if (
                                  activeTipIndex >
                                  filteredTips.length - 3
                                ) {
                                  // At the end, show last 5 dots
                                  displayIndex =
                                    filteredTips.length - 5 + index;
                                } else {
                                  // In the middle, show active in center with 2 on each side
                                  displayIndex = activeTipIndex - 2 + index;
                                }

                                return (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      setSlideDirection(
                                        displayIndex > activeTipIndex
                                          ? "right"
                                          : "left"
                                      );
                                      setActiveTipIndex(displayIndex);
                                    }}
                                    className={`h-2 w-2 rounded-full transition-all ${
                                      displayIndex === activeTipIndex
                                        ? "bg-primary w-4"
                                        : "bg-gray-300"
                                    }`}
                                    aria-label={`Go to tip ${displayIndex + 1}`}
                                  />
                                );
                              })}
                            </>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextTip}
                          disabled={activeTipIndex === filteredTips.length - 1}
                          className="w-24"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                      <div className="text-center text-xs text-gray-500">
                        {activeTipIndex + 1} of {filteredTips.length}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  No Tips Found
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  No tips matching your current filters.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveCategory("all")}
                >
                  View All Tips
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
