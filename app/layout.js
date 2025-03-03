import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en">
        <head>
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-FH8BPBFD4W"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag("js", new Date());
            gtag("config", "G-FH8BPBFD4W");
          `}
          </Script>
        </head>
        <body>
          {children}

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
