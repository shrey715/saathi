// "use client";

import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// Import React components at the top
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Saathi",
  description: "Your AI companion for mental wellbeing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <main className="pb-20">{children}</main>
        </ThemeProvider>
        <Footer />
      </body>
    </html>
  );
}