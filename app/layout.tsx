import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { UtsavProvider } from "@/hooks/useUtsavStore";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { ToastContainer } from "@/components/layout/ToastContainer";
import { SkipLink } from "@/components/layout/SkipLink";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Utsav — GenAI Celebration & Event Planner",
  description:
    "Organize royal Indian weddings, milestone birthdays, and community festivals with AI budgets in ₹, phased timelines, and vendor checklists.",
  keywords: [
    "Utsav",
    "Indian wedding planner",
    "event planner",
    "budget calculator",
    "mehendi",
    "haldi",
    "sangeet",
    "celebration assistant",
  ],
};

export const viewport: Viewport = {
  themeColor: "#2B0A3D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} dark`} suppressHydrationWarning>
      <body className="font-sans antialiased selection:bg-saffron-500 selection:text-plum-950">
        <SkipLink />
        <UtsavProvider>
          <AuroraBackground />
          {children}
          <ToastContainer />
        </UtsavProvider>
      </body>
    </html>
  );
}

