"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Sidebar, NavTab } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { HomeOverview } from "@/components/features/HomeOverview";
import { BudgetSection } from "@/components/features/BudgetSection";
import { TimelineSection } from "@/components/features/TimelineSection";
import { VendorsSection } from "@/components/features/VendorsSection";
import { IdeasStudio } from "@/components/features/IdeasStudio";
import { GuestsSection } from "@/components/features/GuestsSection";
import { ExportSection } from "@/components/features/ExportSection";
import { SettingsSection } from "@/components/features/SettingsSection";
import { LandingHero } from "@/components/features/LandingHero";
import { WizardModal } from "@/components/features/WizardModal";
import { CommandPalette } from "@/components/features/CommandPalette";
import { useUtsav } from "@/hooks/useUtsavStore";
import { pageTransitionVariants } from "@/lib/motion/config";

export default function AppHomePage() {
  const { settings } = useUtsav();
  const [currentTab, setCurrentTab] = useState<NavTab | "landing">("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const isReduced = settings.reduceMotion;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Top Header */}
      <Header
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
        {/* Collapsible Sidebar (Desktop) */}
        {currentTab !== "landing" && (
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        )}

        {/* Main Content Area */}
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 min-w-0 focus:outline-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              variants={isReduced ? undefined : pageTransitionVariants}
              initial={isReduced ? false : "initial"}
              animate={isReduced ? undefined : "animate"}
              exit={isReduced ? undefined : "exit"}
              className="w-full"
            >
              {currentTab === "landing" && (
                <LandingHero
                  onStartPlanning={() => setIsWizardOpen(true)}
                  onExploreDashboard={() => setCurrentTab("overview")}
                />
              )}

              {currentTab === "overview" && (
                <HomeOverview
                  onSelectTab={(tab) => setCurrentTab(tab)}
                  onOpenWizard={() => setIsWizardOpen(true)}
                />
              )}

              {currentTab === "budget" && <BudgetSection />}

              {currentTab === "timeline" && <TimelineSection />}

              {currentTab === "vendors" && <VendorsSection />}

              {currentTab === "ideas" && <IdeasStudio />}

              {currentTab === "guests" && <GuestsSection />}

              {currentTab === "export" && <ExportSection />}

              {currentTab === "settings" && (
                <SettingsSection onOpenWizard={() => setIsWizardOpen(true)} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {currentTab !== "landing" && (
        <MobileNav currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />
      )}

      {/* Wizard Modal */}
      <WizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenWizard={() => setIsWizardOpen(true)}
      />
    </div>
  );
}

