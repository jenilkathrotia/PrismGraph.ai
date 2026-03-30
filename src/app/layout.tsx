import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResearchGraph AI — AI-Powered Research Intelligence Console",
  description:
    "Transform research PDFs into a live knowledge graph. Explore papers, discover insights, and verify claims with AI-powered intelligence. Built with Neo4j + RocketRide AI.",
  keywords: ["research", "knowledge graph", "AI", "Neo4j", "paper analysis", "academic research"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
