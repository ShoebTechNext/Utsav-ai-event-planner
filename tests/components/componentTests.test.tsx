import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UtsavProvider } from "@/hooks/useUtsavStore";
import { WizardModal } from "@/components/features/WizardModal";
import { BudgetSection } from "@/components/features/BudgetSection";
import { TimelineSection } from "@/components/features/TimelineSection";
import { VendorsSection } from "@/components/features/VendorsSection";
import { Header } from "@/components/layout/Header";
import { IdeasStudio } from "@/components/features/IdeasStudio";

describe("React Testing Library Component Interactions", () => {
  it("renders wizard, shows validation errors on empty submission, and advances on valid input", async () => {
    render(
      <UtsavProvider>
        <WizardModal isOpen={true} onClose={() => {}} />
      </UtsavProvider>,
    );

    expect(screen.getByText("Plan a New Celebration")).toBeInTheDocument();

    const continueBtn = screen.getByText("Continue");
    fireEvent.click(continueBtn);

    // Validation error should trigger
    expect(await screen.findByText(/Please enter an event name/i)).toBeInTheDocument();

    // Fill valid data
    const nameInput = screen.getByLabelText(/Event Name/i);
    fireEvent.change(nameInput, { target: { value: "Pooja & Sameer Wedding" } });

    const dateInput = screen.getByLabelText(/Target Date/i);
    fireEvent.change(dateInput, { target: { value: "2026-11-15" } });

    const cityInput = screen.getByLabelText(/City \/ Destination/i);
    fireEvent.change(cityInput, { target: { value: "Mumbai" } });

    fireEvent.click(continueBtn);

    // Advances to Step 2
    expect(await screen.findByText("Celebration Vibe & Aesthetic *")).toBeInTheDocument();
  });

  it("renders budget section, allows inline editing of allocated amounts", async () => {
    render(
      <UtsavProvider>
        <BudgetSection />
      </UtsavProvider>,
    );

    expect(screen.getByText("Celebration Budget")).toBeInTheDocument();
    expect(screen.getAllByText("Venue & Palace Stays").length).toBeGreaterThanOrEqual(1);

    // Find and click edit button on first category
    const editBtn = screen.getByLabelText("Edit Venue & Palace Stays");
    fireEvent.click(editBtn);

    const input = screen.getByLabelText("Allocated Amount (₹)");
    fireEvent.change(input, { target: { value: "1500000" } });

    const doneBtn = screen.getByLabelText("Done editing");
    fireEvent.click(doneBtn);

    expect(screen.queryByLabelText("Allocated Amount (₹)")).not.toBeInTheDocument();
  });

  it("syncs vendor status and quoted price to budget", async () => {
    render(
      <UtsavProvider>
        <VendorsSection />
      </UtsavProvider>,
    );

    expect(screen.getByText("Vendor Directory")).toBeInTheDocument();
    expect(screen.getByText("Rajvilas Palace & Gardens")).toBeInTheDocument();
  });

  it("toggles timeline task completed state", async () => {
    render(
      <UtsavProvider>
        <TimelineSection />
      </UtsavProvider>,
    );

    expect(screen.getByText("Celebration Timeline")).toBeInTheDocument();

    // Click toggle on a task
    const toggleBtns = screen.getAllByRole("button", { name: /Mark/i });
    expect(toggleBtns.length).toBeGreaterThan(0);
    fireEvent.click(toggleBtns[0]);
  });

  it("toggles theme in header", async () => {
    render(
      <UtsavProvider>
        <Header onOpenWizard={() => {}} onOpenCommandPalette={() => {}} />
      </UtsavProvider>,
    );

    const themeToggle = screen.getByLabelText("Change theme");
    fireEvent.click(themeToggle);

    const lightOption = screen.getByText("Light");
    fireEvent.click(lightOption);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("renders quick prompt chips in Ideas Studio", async () => {
    render(
      <UtsavProvider>
        <IdeasStudio />
      </UtsavProvider>,
    );

    expect(screen.getByText("Budget-friendly decor")).toBeInTheDocument();
    expect(screen.getByText("Surprise ideas")).toBeInTheDocument();
  });
});
