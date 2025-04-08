"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Loader2,
  ChevronDown,
  BookOpen,
  Search,
  Brain,
  MessageSquare,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  PenLine,
  Copy,
  ExternalLink,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import LoadingSpinner from "./LoadingSpinner";

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

// Sample suggested questions
const suggestedQuestions = [
  "How do neurons transmit signals?",
  "Explain the process of DNA replication",
  "What are the major components of the immune system?",
  "How does cellular respiration work?",
  "What are the stages of mitosis?",
  "Explain the structure and function of antibodies",
];

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
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: "Introduction to Cell Biology", date: "2 hours ago" },
    { id: 2, title: "DNA Structure and Function", date: "Yesterday" },
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messageBeingEdited, setMessageBeingEdited] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
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

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "60px"; // Reset height
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 200)}px`; // Set height with max of 200px
    }
  }, [input]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput("");
    setIsProcessing(true);
    setShowSuggestions(false);

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
      }, 1500);
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

  // Copy message to clipboard
  const copyMessage = (content, index) => {
    navigator.clipboard.writeText(content).then(
      () => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        toast({
          description: "Copied to clipboard",
          duration: 2000,
        });
      },
      (err) => {
        toast({
          variant: "destructive",
          description: "Failed to copy text",
          duration: 2000,
        });
      }
    );
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  // Start new chat
  const startNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm your biology and biomedical sciences assistant. How can I help you today?",
      },
    ]);
    setShowSuggestions(true);
    setInput("");
  };

  // Edit message
  const handleEditMessage = (index) => {
    if (messages[index].role === "user") {
      setMessageBeingEdited(index);
      setInput(messages[index].content);
      textareaRef.current?.focus();
    }
  };

  // Submit edited message
  const submitEditedMessage = () => {
    if (messageBeingEdited !== null && input.trim()) {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[messageBeingEdited] = {
          ...newMessages[messageBeingEdited],
          content: input.trim(),
        };

        // Remove all subsequent messages (both user and assistant)
        const newMessagesSliced = newMessages.slice(0, messageBeingEdited + 1);

        return newMessagesSliced;
      });

      setInput("");
      setMessageBeingEdited(null);

      // Simulate processing edited message
      setIsProcessing(true);
      setTimeout(() => {
        const editedMessage = input.trim();
        const aiResponse = getSampleResponse(editedMessage);

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: aiResponse },
        ]);

        setIsProcessing(false);
      }, 1500);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setMessageBeingEdited(null);
    setInput("");
  };

  const [showScrollButton, setShowScrollButton] = useState(false);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Chat history sidebar (hidden on mobile) */}
      <div className="w-64 border-r border-gray-100 bg-white hidden lg:flex flex-col h-full">
        <div className="p-4 border-b border-gray-100">
          <Button
            onClick={startNewChat}
            className="w-full justify-start text-left"
            variant="outline"
          >
            <PenLine className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Recent Conversations
          </h3>
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="p-2 rounded-md hover:bg-gray-100 cursor-pointer group flex items-start"
              >
                <MessageSquare className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm flex-grow overflow-hidden">
                  <p className="font-medium text-gray-700 truncate">
                    {chat.title}
                  </p>
                  <p className="text-xs text-gray-400">{chat.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full bg-white overflow-hidden min-w-0">
        {/* Chat header */}
        <div className="border-b border-gray-100 p-3 flex justify-between items-center flex-shrink-0 bg-white">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">BioMed Assistant</h3>
              <p className="text-xs text-green-600 flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={startNewChat} size="sm" variant="ghost">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          </div>
        </div>

        {/* Messages container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0"
          onScroll={checkScrollPosition}
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex group ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-3xl ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 ${
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

                  <div className="relative group">
                    <Card
                      className={`${
                        message.role === "user"
                          ? "bg-primary text-white border-primary"
                          : "bg-white"
                      }`}
                    >
                      <CardContent className="p-3">
                        <div
                          className={`${
                            message.role === "user"
                              ? "text-white"
                              : "prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100"
                          }`}
                        >
                          {messageBeingEdited === index ? (
                            <div className="bg-yellow-50 p-2 rounded border border-yellow-200 text-yellow-800 text-xs mb-2">
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              Editing this message will remove all subsequent
                              responses
                            </div>
                          ) : null}
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Message actions */}
                    <div
                      className={`absolute ${
                        message.role === "user"
                          ? "left-0 -translate-x-full"
                          : "right-0 translate-x-full"
                      } top-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <div className="bg-white rounded-md shadow-sm border border-gray-100 flex overflow-hidden">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-none"
                          onClick={() => copyMessage(message.content, index)}
                        >
                          {copiedIndex === index ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>

                        {message.role === "user" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleEditMessage(index)}
                          >
                            <PenLine className="h-4 w-4 text-gray-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isProcessing && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex flex-row">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 mr-2">
                  <Bot className="h-4 w-4 text-gray-600" />
                </div>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center">
                      <div className="flex space-x-1">
                        <motion.div
                          className="h-2 w-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <motion.div
                          className="h-2 w-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0.2,
                          }}
                        />
                        <motion.div
                          className="h-2 w-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0.4,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Suggested questions */}
          {showSuggestions && messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6"
            >
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Suggested questions:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 cursor-pointer transition-colors flex items-start"
                  >
                    <Search className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{question}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />

          {/* Scroll to bottom button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={scrollToBottom}
                className="absolute bottom-28 right-6 p-2 bg-white text-gray-600 rounded-full shadow-lg z-10 border border-gray-200"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  messageBeingEdited !== null
                    ? "Edit your message..."
                    : "Ask about biology and biomedical sciences..."
                }
                className="min-h-[60px] pr-16 py-3 resize-none rounded-xl border-gray-200 focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    messageBeingEdited !== null
                      ? submitEditedMessage()
                      : handleSubmit();
                  }
                }}
              />

              {messageBeingEdited !== null ? (
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    className="h-8 w-8 rounded-md hover:bg-gray-100"
                    onClick={cancelEdit}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button
                    size="icon"
                    type="button"
                    className="h-8 w-8 rounded-md"
                    disabled={!input.trim()}
                    onClick={submitEditedMessage}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isProcessing}
                  className="absolute bottom-2 right-2 h-8 w-8 rounded-md"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-400">
                {messageBeingEdited !== null ? (
                  <span className="text-yellow-500 font-medium">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    Editing message
                  </span>
                ) : (
                  "Press Enter to send, Shift+Enter for new line"
                )}
              </p>

              <div className="text-xs text-gray-400 flex items-center">
                <BookOpen className="h-3 w-3 mr-1" />
                <span>Specialized in biology and biomedical sciences</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
