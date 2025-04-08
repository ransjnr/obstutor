"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Brain,
  BookOpen,
  Lightbulb,
  Copy,
  Bookmark,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Exam tips data
const tips = [
  {
    id: 1,
    category: "Study Techniques",
    title: "Spaced Repetition for Long-Term Retention",
    description:
      "Spaced repetition is a proven technique that enhances long-term memory retention by reviewing material at increasing intervals over time. It's particularly effective for memorizing facts, terminology, and concepts in biology and medicine.",
    icon: Clock,
    tips: [
      "Review material 1 day, 3 days, 1 week, and 2 weeks after initial learning",
      "Use flashcard apps that automatically implement spaced repetition algorithms",
      "Schedule brief, focused review sessions rather than marathon cramming",
      "Prioritize difficult or easily forgotten material for more frequent review",
      "Combine with active recall by testing yourself rather than just re-reading",
    ],
  },
  {
    id: 2,
    category: "Mental Health",
    title: "Managing Pre-Exam Anxiety",
    description:
      "Exam anxiety can significantly impact performance, especially in high-pressure medical courses. Implementing evidence-based anxiety management techniques can help maintain optimal cognitive function during study and exams.",
    icon: Brain,
    tips: [
      "Practice diaphragmatic breathing (5 seconds in, 7 seconds out) before and during exams",
      "Use positive visualization techniques imagining successful exam completion",
      "Implement a consistent pre-exam routine to signal your brain it's time to focus",
      "Study in the same environment where you'll take the exam when possible",
      "Reframe anxious thoughts from 'threats' to 'challenges' to optimize performance",
    ],
  },
  {
    id: 3,
    category: "Exam Strategy",
    title: "Strategic Question Navigation",
    description:
      "Proper navigation of exam questions can maximize your score through effective time management and prioritization. This approach is especially valuable for the complex, scenario-based questions common in medical education.",
    icon: BookOpen,
    tips: [
      "Take 1-2 minutes at the start to scan the entire exam and allocate time per section",
      "Answer easy questions first to build confidence and secure points",
      "Flag difficult questions for review rather than getting stuck",
      "Watch for clues in later questions that might help with earlier difficult ones",
      "Budget time for a final review of all flagged or uncertain answers",
    ],
  },
  {
    id: 4,
    category: "Health Optimization",
    title: "Nutrition for Cognitive Performance",
    description:
      "Diet significantly impacts cognitive function and learning ability. Proper nutrition can enhance focus, memory, and mental endurance during demanding study sessions.",
    icon: Clock,
    tips: [
      "Eat foods rich in omega-3 fatty acids (fish, walnuts, flaxseeds) to support brain function",
      "Maintain steady glucose levels with complex carbohydrates rather than sugar spikes",
      "Stay hydrated; even mild dehydration reduces cognitive performance and concentration",
      "Consume antioxidant-rich berries and leafy greens to combat oxidative stress",
      "Time caffeine intake strategically, avoiding consumption late in the day",
    ],
  },
  {
    id: 5,
    category: "Memory Techniques",
    title: "Medical Mnemonics Creation",
    description:
      "Creating personalized mnemonics can dramatically improve retention of complex medical information, particularly for lists, sequences, and related concepts that are otherwise difficult to remember.",
    icon: Lightbulb,
    tips: [
      "Develop acronyms using the first letter of each item in a sequence or list",
      "Create vivid mental images that link abstract concepts to concrete visualizations",
      "Use the memory palace technique to associate information with familiar locations",
      "Make mnemonics humorous or absurd, as emotional content is more memorable",
      "Connect new information to existing knowledge through analogies and metaphors",
    ],
  },
];

// Category icons mapping
const categoryIcons = {
  "Study Techniques": Clock,
  "Mental Health": Brain,
  "Exam Strategy": BookOpen,
  "Health Optimization": Clock,
  "Memory Techniques": Lightbulb,
};

export default function AIExamTips() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [savedTips, setSavedTips] = useState([]);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState("right");
  const [copiedText, setCopiedText] = useState(false);
  const { toast } = useToast();

  // Filter tips based on category
  const filteredTips =
    activeCategory === "all"
      ? tips
      : tips.filter((tip) => tip.category === activeCategory);

  // Handle saving/unsaving tips
  const handleSaveTip = (tipId) => {
    if (savedTips.includes(tipId)) {
      setSavedTips(savedTips.filter((id) => id !== tipId));
      toast({
        title: "Tip removed from saved",
        description: "This tip has been removed from your saved collection.",
      });
    } else {
      setSavedTips([...savedTips, tipId]);
      toast({
        title: "Tip saved",
        description: "This tip has been added to your saved collection.",
      });
    }
  };

  // Copy tip to clipboard
  const copyToClipboard = async (tip) => {
    try {
      const textToCopy = `Study Tip: ${tip.title}\n\n${
        tip.description
      }\n\nKey Tips:\n${tip.tips.map((t) => `• ${t}`).join("\n")}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "You can now paste this tip wherever you need it.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      });
    }
  };

  // Navigate to previous tip
  const prevTip = () => {
    if (activeTipIndex > 0) {
      setSlideDirection("left");
      setActiveTipIndex(activeTipIndex - 1);
    }
  };

  // Navigate to next tip
  const nextTip = () => {
    if (activeTipIndex < filteredTips.length - 1) {
      setSlideDirection("right");
      setActiveTipIndex(activeTipIndex + 1);
    }
  };

  // Animation variants
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

  return (
    <div className="min-h-full flex flex-col">
      {/* Control Panel */}
      <div className="flex items-start gap-4 p-4 border-b bg-white">
        <div className="flex-1">
          <label htmlFor="category" className="mb-2 block text-sm">
            Category
          </label>
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger id="category" className="w-full">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.keys(categoryIcons).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col items-end">
          <label className="mb-2 block text-sm">Saved Tips</label>
          <Badge variant="outline" className="py-1 px-2">
            {savedTips.length} saved
          </Badge>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {filteredTips.length > 0 ? (
          <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
            <motion.div
              key={filteredTips[activeTipIndex].id}
              custom={slideDirection}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full flex flex-col"
            >
              <Card className="bg-white border border-gray-100 p-6 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <Badge
                    variant="outline"
                    className="font-normal flex items-center gap-1"
                  >
                    {(() => {
                      const TipIcon =
                        categoryIcons[filteredTips[activeTipIndex].category] ||
                        Lightbulb;
                      return <TipIcon className="h-3 w-3 mr-1 text-primary" />;
                    })()}
                    {filteredTips[activeTipIndex].category}
                  </Badge>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(filteredTips[activeTipIndex])
                      }
                      aria-label="Copy tip"
                    >
                      <Copy
                        className={`h-5 w-5 ${
                          copiedText ? "text-green-500" : ""
                        }`}
                      />
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
                      <Bookmark className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-4">
                  {filteredTips[activeTipIndex].title}
                </h2>

                <div className="space-y-6">
                  <div>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {filteredTips[activeTipIndex].description}
                    </p>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-xl font-semibold mb-3">Key Tips</h3>
                    <div className="space-y-3">
                      {filteredTips[activeTipIndex].tips.map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-3"
                        >
                          <div className="h-6 w-6 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <p className="text-gray-700">{tip}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">No Tips Found</h3>
            <p className="text-gray-500 mb-4">
              No tips matching your current filter.
            </p>
            <Button variant="outline" onClick={() => setActiveCategory("all")}>
              View All Tips
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center p-4 border-t bg-white">
        <Button
          variant="outline"
          onClick={prevTip}
          disabled={activeTipIndex === 0}
          className="w-24 h-10"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="text-sm text-gray-500">
          {activeTipIndex + 1} of {filteredTips.length}
        </div>

        <Button
          variant="outline"
          onClick={nextTip}
          disabled={activeTipIndex === filteredTips.length - 1}
          className="w-24 h-10"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
