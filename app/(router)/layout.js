"use client";
import Script from "next/script";
import React, { useState, useEffect } from "react";
import SideNav from "./_components/SideNav";
import Header from "./_components/Header";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

function layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Check if we're in the AI section
  const isAISection = pathname.startsWith("/ai");

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle sidebar collapse
  const handleSidebarCollapse = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div style={{ background: "#ffffff" }}>
      {/* Hide the main sidebar when in AI section */}
      {!isAISection && (
        <div
          className={`${
            isSidebarOpen
              ? isSidebarCollapsed
                ? "sm:w-20"
                : "sm:w-64"
              : "sm:w-0"
          } transition-all duration-300 hidden sm:block fixed`}
        >
          <SideNav
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleSidebarCollapse}
          />
        </div>
      )}

      <div
        className={`${
          !isAISection
            ? isSidebarOpen
              ? isSidebarCollapsed
                ? "sm:ml-20"
                : "sm:ml-64"
              : "sm:ml-0"
            : "sm:ml-0"
        } transition-all duration-300`}
      >
        <div className="flex items-center">
          {!isAISection && (
            <button
              onClick={toggleSidebar}
              className="p-3 text-gray-500 hover:text-primary focus:outline-none md:hidden"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <div className="flex-1">
            <Header />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

export default layout;
