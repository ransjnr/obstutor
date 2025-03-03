"use client";
import Script from "next/script";
import React from "react";
import SideNav from "./_components/SideNav";
import Header from "./_components/Header";

function layout({ children }) {
  return (
    <div>
      <div className="sm:w-64 hidden sm:block fixed">
        <SideNav />
      </div>

      <div className="ml-64">
        <Header />

        {children}
      </div>
    </div>
  );
}

export default layout;
