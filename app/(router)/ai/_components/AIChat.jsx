"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Sample responses for different categories of questions
const getSampleResponse = (question) => {
  const lowerQuestion = question.toLowerCase();

  // Sample responses for different types of questions
  if (lowerQuestion.includes("cell") || lowerQuestion.includes("organelle")) {
    return "In eukaryotic cells, organelles perform specialized functions:\n\n- The **nucleus** contains genetic material\n- **Mitochondria** generate ATP through cellular respiration\n- The **endoplasmic reticulum** synthesizes proteins and lipids\n- The **Golgi apparatus** modifies and packages macromolecules\n- **Lysosomes** contain digestive enzymes for breaking down waste materials";
  } else if (
    lowerQuestion.includes("dna") ||
    lowerQuestion.includes("gene") ||
    lowerQuestion.includes("genetic")
  ) {
    return "DNA (deoxyribonucleic acid) is a double-stranded molecule that contains genetic instructions. Key processes include:\n\n1. **Replication**: DNA makes copies of itself during cell division\n2. **Transcription**: DNA is copied to mRNA\n3. **Translation**: mRNA is used to assemble proteins\n\nMutations are changes in the DNA sequence that can affect protein function and potentially lead to disease.";
  } else if (
    lowerQuestion.includes("immune") ||
    lowerQuestion.includes("antibody")
  ) {
    return "The immune system protects the body through two main types of immunity:\n\n**Innate Immunity**:\n- Immediate, non-specific defense\n- Includes physical barriers, phagocytes, and inflammation\n\n**Adaptive Immunity**:\n- Develops after exposure to specific antigens\n- Involves B cells (producing antibodies) and T cells (cell-mediated immunity)\n\nAntibodies (immunoglobulins) are Y-shaped proteins that bind to specific antigens for neutralization or destruction.";
  } else if (
    lowerQuestion.includes("heart") ||
    lowerQuestion.includes("cardiac") ||
    lowerQuestion.includes("blood")
  ) {
    return "The cardiovascular system consists of the heart, blood vessels, and blood. The heart has four chambers:\n\n- **Right atrium**: Receives deoxygenated blood from the body\n- **Right ventricle**: Pumps blood to the lungs for oxygenation\n- **Left atrium**: Receives oxygenated blood from the lungs\n- **Left ventricle**: Pumps oxygenated blood to the body tissues\n\nThe blood circulation path is: body → right atrium → right ventricle → lungs → left atrium → left ventricle → body.";
  } else if (
    lowerQuestion.includes("neuron") ||
    lowerQuestion.includes("brain") ||
    lowerQuestion.includes("nervous")
  ) {
    return "Neurons are specialized cells that transmit information through electrical and chemical signals. Structure:\n\n- **Cell body (soma)**: Contains the nucleus and organelles\n- **Dendrites**: Receive signals from other neurons\n- **Axon**: Transmits signals to other neurons\n\nThe brain is organized into regions with specialized functions:\n- **Cerebrum**: Higher cognitive functions\n- **Cerebellum**: Movement coordination\n- **Brainstem**: Basic life functions";
  } else {
    return "As a biology and biomedical science assistant, I can help you understand concepts related to:\n\n- Cell biology\n- Genetics\n- Immunology\n- Physiology\n- Neuroscience\n- And many other topics\n\nCould you please provide more specific information about what you'd like to learn?";
  }
};

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your biology and biomedical sciences assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef(null);
  const { toast } = useToast();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check if should show scroll button
  const checkScrollPosition = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isScrollable = container.scrollHeight > container.clientHeight;
    const isScrolledUp =
      container.scrollTop <
      container.scrollHeight - container.clientHeight - 100;

    setShowScrollButton(isScrollable && isScrolledUp);
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add scroll event listener
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      return () => container.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput("");
    setIsProcessing(true);

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      // Simulate AI processing
      setTimeout(() => {
        // Get sample response based on question
        const aiResponse = getSampleResponse(userMessage);

        // Add AI response to chat
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: aiResponse },
        ]);

        setIsProcessing(false);
        checkScrollPosition();
      }, 1000);
    } catch (error) {
      console.error("Error processing message:", error);
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative"
        onScroll={checkScrollPosition}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-[75%] ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  message.role === "user"
                    ? "ml-2 bg-primary"
                    : "mr-2 bg-gray-200"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <Card
                className={`${
                  message.role === "user" ? "bg-primary text-white" : "bg-white"
                }`}
              >
                <CardContent className="p-3">
                  <div
                    className={
                      message.role === "user" ? "" : "prose prose-sm max-w-none"
                    }
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="flex flex-row">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 mr-2">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-6 right-6 p-2 bg-primary text-white rounded-full shadow-lg z-10"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about biology and biomedical sciences..."
              className="min-h-[60px] resize-none pr-10 py-3"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {input.length > 0 && (
                <span>
                  Press{" "}
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd>{" "}
                  to send
                </span>
              )}
            </div>
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isProcessing}
            className="h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-400 mt-2">
          Obstutor AI is specifically trained for biology and biomedical
          sciences to provide accurate academic information.
        </p>
      </div>
    </div>
  );
}
