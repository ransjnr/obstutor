"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AILayout({ children }) {
  // Start with sidebar closed by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative h-full">
      {/* Toggle button for sidebar */}
      <button
        onClick={toggleSidebar}
        className="fixed top-20 left-0 bg-white p-2 rounded-r-md shadow-md z-20 transition-all duration-300"
        style={{ left: isSidebarOpen ? "240px" : "0" }}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* AI Sidebar */}
      <motion.div
        initial={{ width: "0px" }}
        animate={{ width: isSidebarOpen ? "240px" : "0px" }}
        transition={{ duration: 0.3 }}
        className="fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto z-10"
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">AI History</h2>
          <div className="space-y-2">
            <div className="text-sm text-gray-500">
              Your recent conversations and generated content will appear here.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ marginLeft: "0px" }}
        animate={{ marginLeft: isSidebarOpen ? "240px" : "0px" }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
