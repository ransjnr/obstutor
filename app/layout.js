import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en">
        <body>
          {children}

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
