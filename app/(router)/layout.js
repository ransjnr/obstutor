"use client";
import Script from "next/script";
import React from "react";
import SideNav from "./_components/SideNav";
import Header from "./_components/Header";

function layout({ children }) {
  return (
    <div>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-FH8BPBFD4W"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          dataLayer.push(arguments);
          gtag("js", new Date());
          gtag("config", "G-FH8BPBFD4W");
          }`}
      </Script>
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
