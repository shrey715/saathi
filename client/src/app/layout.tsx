// "use client";

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/nav/AppShell";

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
    <html lang="en">
      <body className="antialiased min-h-screen">
        <AppShell>{children}</AppShell>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}