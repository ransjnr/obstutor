"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
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
  const { toast } = useToast();

  // Filter tips based on active category
  const filteredTips =
    activeCategory === "all"
      ? tips
      : tips.filter((tip) => tip.category === activeCategory);

  const handleSaveTip = (tipId) => {
    if (savedTips.includes(tipId)) {
      setSavedTips(savedTips.filter((id) => id !== tipId));
      toast({
        title: "Tip removed from saved",
        description: "This tip has been removed from your saved collection.",
        variant: "default",
      });
    } else {
      setSavedTips([...savedTips, tipId]);
      toast({
        title: "Tip saved",
        description: "This tip has been added to your saved collection.",
        variant: "default",
      });
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

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar */}
        <div className="lg:w-1/4 space-y-6">
          <Card className="bg-white border border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lightbulb className="h-5 w-5 text-primary" />
                <span>Exam Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="category">Filter by Category</Label>
                <Select
                  value={activeCategory}
                  onValueChange={setActiveCategory}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {[...new Set(tips.map((tip) => tip.category))].map(
                      (category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="flex items-center gap-2"
                        >
                          {category}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 mt-6 pt-4 border-t border-gray-100">
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

              <div className="mt-6 space-y-2">
                {activeTab === "all" ? (
                  filteredTips.map((tip, index) => {
                    const TipIcon = categoryIcons[tip.category] || Lightbulb;
                    return (
                      <Button
                        key={tip.id}
                        variant={
                          activeTipIndex === index ? "default" : "outline"
                        }
                        className={`w-full justify-start text-left h-auto py-3 px-4 ${
                          activeTipIndex === index
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }`}
                        onClick={() => setActiveTipIndex(index)}
                      >
                        <div className="flex items-center gap-2">
                          <TipIcon className="h-4 w-4 flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-medium">{tip.title}</span>
                            <span className="text-xs opacity-80">
                              {tip.category}
                            </span>
                          </div>
                        </div>
                      </Button>
                    );
                  })
                ) : savedTips.length > 0 ? (
                  tips
                    .filter((tip) => savedTips.includes(tip.id))
                    .map((tip, index) => {
                      const TipIcon = categoryIcons[tip.category] || Lightbulb;
                      return (
                        <Button
                          key={tip.id}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-3 px-4"
                          onClick={() => {
                            const newIndex = filteredTips.findIndex(
                              (t) => t.id === tip.id
                            );
                            if (newIndex !== -1) {
                              setActiveTipIndex(newIndex);
                              setActiveTab("all");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <TipIcon className="h-4 w-4 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium">{tip.title}</span>
                              <span className="text-xs opacity-80">
                                {tip.category}
                              </span>
                            </div>
                          </div>
                        </Button>
                      );
                    })
                ) : (
                  <div className="py-8 text-center">
                    <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No saved tips yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click the bookmark icon to save tips for later
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:w-3/4">
          {filteredTips.length > 0 ? (
            <motion.div
              key={filteredTips[activeTipIndex].id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white border border-gray-100">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="font-normal">
                      {filteredTips[activeTipIndex].category}
                    </Badge>
                    <div className="flex gap-2">
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
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleShareTip(filteredTips[activeTipIndex])
                        }
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-2xl mt-2">
                    {filteredTips[activeTipIndex].title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Overview</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {filteredTips[activeTipIndex].description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-lg font-medium mb-3">Key Tips</h3>
                      <div className="space-y-3">
                        {filteredTips[activeTipIndex].tips.map((tip, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-primary" />
                              </div>
                            </div>
                            <p className="text-gray-700">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-lg font-medium mb-3">
                        Apply This Tip
                      </h3>
                      <Card className="bg-gray-50 border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Lightbulb className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">Try it today</h4>
                              <p className="text-sm text-gray-600">
                                Start implementing this tip in your study
                                routine within the next 24 hours for maximum
                                benefit. Research shows that immediate
                                application significantly increases retention of
                                new study methodologies.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveTipIndex(Math.max(0, activeTipIndex - 1))
                  }
                  disabled={activeTipIndex === 0}
                  className="w-24"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveTipIndex(
                      Math.min(filteredTips.length - 1, activeTipIndex + 1)
                    )
                  }
                  disabled={activeTipIndex === filteredTips.length - 1}
                  className="w-24"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Tips Found</h3>
                <p className="text-gray-500 mb-6">
                  No tips matching your current filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveCategory("all")}
                >
                  View All Tips
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
