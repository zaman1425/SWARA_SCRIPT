import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwaraScript – Music Programming Language Compiler",
  description: "Design and Implementation of a Domain-Specific Music Programming Language Compiler with Intermediate Event Code Generation, Optimization, and Web-Based Audio Synthesis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
