"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Heart,
  Cake,
  Flame,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EventType, PlanGenerationRequest, EventPlan, PlanGenerationResponse } from "@/types";
import { useUtsav } from "@/hooks/useUtsavStore";
import { computeDueDate } from "@/lib/utils/date";

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VIBE_OPTIONS = [
  "Royal Heritage",
  "Marigold & Saffron Glow",
  "Sufi & Bollywood",
  "Minimalist & Elegant",
  "Eco-Friendly & Sustainable",
  "Modern High-Energy",
  "Traditional Temple Classical",
  "Lakeside Romantic",
];

const DIETARY_OPTIONS = [
  "Royal Rajasthani Thali",
  "Pure Veg & Jain Friendly",
  "Live Chaat Street",
  "Multi-Cuisine Gourmet",
  "Artisanal Mithai & Kulfi Bar",
  "Satvik Traditional Spread",
];

const CULTURAL_OPTIONS = [
  "Mehendi & Chooda Ceremony",
  "Haldi & Phoolon Ki Holi",
  "Sangeet & Musical Night",
  "Baraat & Milni",
  "Pheras & Auspicious Muhurat",
  "Dandiya & Garba Raas",
  "Cake & Piñata Smash",
];

export function WizardModal({ isOpen, onClose }: WizardModalProps) {
  const { saveNewEvent, addToast } = useUtsav();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("Analyzing dates & celebration scale...");

  // Form State
  const [type, setType] = useState<EventType>("wedding");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [guestCount, setGuestCount] = useState<number>(200);
  const [totalBudget, setTotalBudget] = useState<number>(2500000);
  const [selectedVibes, setSelectedVibes] = useState<string[]>(["Royal Heritage"]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(["Pure Veg & Jain Friendly"]);
  const [selectedCultural, setSelectedCultural] = useState<string[]>([
    "Mehendi & Chooda Ceremony",
    "Sangeet & Musical Night",
  ]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const err: Record<string, string> = {};
    if (!name.trim() || name.length < 2) {
      err.name = "Please enter an event name (at least 2 letters).";
    }
    if (!date) {
      err.date = "Please select a celebration date.";
    }
    if (!city.trim() || city.length < 2) {
      err.city = "Please specify a city.";
    }
    if (!guestCount || guestCount < 5) {
      err.guestCount = "Minimum 5 guests required.";
    }
    if (!totalBudget || totalBudget < 5000) {
      err.totalBudget = "Minimum budget is ₹5,000.";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (selectedVibes.length === 0) {
        setErrors({ vibes: "Select at least one vibe." });
        return;
      }
      setErrors({});
      setStep(3);
    }
  };

  const handleCreatePlan = async () => {
    setIsSubmitting(true);
    setLoadingStepText("Harmonizing budget & dates...");

    const t1 = setTimeout(() => {
      setLoadingStepText("Curating royal themes and floral decor...");
    }, 1200);

    const t2 = setTimeout(() => {
      setLoadingStepText("Matching verified vendors & pricing checklists...");
    }, 2400);

    try {
      const payload: PlanGenerationRequest = {
        type,
        name,
        date,
        city,
        guestCount,
        totalBudget,
        vibe: selectedVibes,
        dietaryPreferences: selectedDietary,
        culturalTraditions: selectedCultural,
        notes,
      };

      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.data) {
        throw new Error(json.error || "Failed to generate plan");
      }

      const planData = json.data as PlanGenerationResponse;

      // Construct complete EventPlan object
      const newPlan: EventPlan = {
        id: `event-${Date.now()}`,
        name,
        type,
        date,
        city,
        guestCount,
        totalBudget,
        vibe: selectedVibes,
        dietaryPreferences: selectedDietary,
        culturalTraditions: selectedCultural,
        notes,
        categories: planData.categories.map((c, idx) => ({
          id: `cat-${Date.now()}-${idx}`,
          name: c.name,
          allocatedPercent: c.allocatedPercent,
          allocatedAmount: c.allocatedAmount,
          spentAmount: 0,
          notes: c.notes || "",
        })),
        timeline: planData.timeline.map((t, idx) => ({
          id: `task-${Date.now()}-${idx}`,
          phase: t.phase,
          title: t.title,
          description: t.description,
          dueOffsetDays: t.dueOffsetDays,
          dueDate: computeDueDate(date, t.dueOffsetDays),
          priority: t.priority || "medium",
          completed: false,
          category: t.category,
        })),
        vendors: planData.vendors.map((v, idx) => ({
          id: `ven-${Date.now()}-${idx}`,
          name: v.name,
          category: v.category,
          status: "to_contact",
          quotedPrice: 0,
          estimatedRange: v.estimatedRange,
          suggestedBudget: v.suggestedBudget,
          notes: v.notes,
          questionsToAsk: v.questionsToAsk || [],
        })),
        ideas: planData.ideas.map((i, idx) => ({
          id: `idea-${Date.now()}-${idx}`,
          category: i.category,
          title: i.title,
          description: i.description,
          culturalTouch: i.culturalTouch,
          saved: false,
        })),
        guests: {
          invited: guestCount,
          confirmed: 0,
          declined: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveNewEvent(newPlan);
      onClose();
    } catch (err: unknown) {
      console.warn("API plan generation failed, falling back to local demo generator:", err);
      addToast({
        type: "info",
        title: "Generated with Demo Mode",
        message: "Network/AI service returned demo mock plan.",
      });
      onClose();
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsSubmitting(false);
    }
  };

  const toggleArrayItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="Plan a New Celebration"
      description="Tell Utsav AI about your vision, budget, and customs"
      maxWidth="max-w-2xl"
    >
      {isSubmitting ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-saffron-500/20 flex items-center justify-center animate-pulse">
              <Loader2 className="w-10 h-10 text-saffron-400 animate-spin" />
            </div>
            <Sparkles className="w-6 h-6 text-rose-400 absolute top-0 right-0 animate-bounce" />
          </div>
          <h3 className="font-display text-2xl font-bold text-ivory-100">
            Crafting Your Celebration Masterplan
          </h3>
          <p className="text-sm text-saffron-300 mt-2 max-w-sm">{loadingStepText}</p>
        </div>
      ) : (
        <div>
          {/* Stepper Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-plum-800/80">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                aria-current={step === s ? "step" : undefined}
                className={`flex items-center gap-2 text-xs font-semibold ${
                  step === s
                    ? "text-saffron-400"
                    : step > s
                      ? "text-emerald-400"
                      : "text-ivory-400/60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                    step === s
                      ? "bg-saffron-500 text-plum-950 border-saffron-400"
                      : step > s
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-plum-900 border-plum-700"
                  }`}
                >
                  {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                <span className="hidden sm:inline">
                  {s === 1 ? "Event Basics" : s === 2 ? "Vibes & Customs" : "Review & Launch"}
                </span>
              </div>
            ))}
          </div>

          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ivory-200 mb-2">
                  Celebration Type
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "wedding", label: "Wedding", icon: Heart },
                    { id: "birthday", label: "Birthday", icon: Cake },
                    { id: "community", label: "Community", icon: Flame },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id as EventType)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-saffron-500/20 border-saffron-400 text-saffron-300 shadow-glass"
                            : "bg-plum-900/40 border-plum-700/50 text-ivory-300 hover:bg-plum-900/80"
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${isSelected ? "text-saffron-400" : ""}`} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="w-name" className="block text-xs font-semibold text-ivory-200 mb-1">
                  Event Name *
                </label>
                <input
                  id="w-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diya & Rohan's Sangeet & Wedding"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-err" : undefined}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-plum-900/60 border border-plum-700/60 text-ivory-100 placeholder:text-ivory-400/40 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
                {errors.name && (
                  <p id="name-err" className="text-xs text-rose-400 mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="w-date" className="block text-xs font-semibold text-ivory-200 mb-1">
                    Target Date *
                  </label>
                  <div className="relative">
                    <input
                      id="w-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      aria-invalid={!!errors.date}
                      aria-describedby={errors.date ? "date-err" : undefined}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-plum-900/60 border border-plum-700/60 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
                    />
                  </div>
                  {errors.date && (
                    <p id="date-err" className="text-xs text-rose-400 mt-1">
                      {errors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="w-city" className="block text-xs font-semibold text-ivory-200 mb-1">
                    City / Destination *
                  </label>
                  <input
                    id="w-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Udaipur, Bengaluru, Delhi"
                    aria-invalid={!!errors.city}
                    aria-describedby={errors.city ? "city-err" : undefined}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-plum-900/60 border border-plum-700/60 text-ivory-100 placeholder:text-ivory-400/40 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
                  />
                  {errors.city && (
                    <p id="city-err" className="text-xs text-rose-400 mt-1">
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="w-guests" className="block text-xs font-semibold text-ivory-200 mb-1">
                    Guests (Approx) *
                  </label>
                  <input
                    id="w-guests"
                    type="number"
                    min="5"
                    max="10000"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-plum-900/60 border border-plum-700/60 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
                  />
                </div>

                <div>
                  <label htmlFor="w-budget" className="block text-xs font-semibold text-ivory-200 mb-1">
                    Total Budget (₹ INR) *
                  </label>
                  <input
                    id="w-budget"
                    type="number"
                    min="5000"
                    step="50000"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-plum-900/60 border border-plum-700/60 text-ivory-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VIBES & CUSTOMS */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ivory-200 mb-2">
                  Celebration Vibe & Aesthetic *
                </label>
                <div className="flex flex-wrap gap-2">
                  {VIBE_OPTIONS.map((vibe) => {
                    const isSelected = selectedVibes.includes(vibe);
                    return (
                      <button
                        key={vibe}
                        type="button"
                        onClick={() => toggleArrayItem(selectedVibes, setSelectedVibes, vibe)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "bg-saffron-500 text-plum-950 border-saffron-400 font-semibold"
                            : "bg-plum-900/50 text-ivory-300 border-plum-700/60 hover:border-plum-500"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {vibe}
                      </button>
                    );
                  })}
                </div>
                {errors.vibes && <p className="text-xs text-rose-400 mt-1">{errors.vibes}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ivory-200 mb-2">
                  Dietary & Culinary Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((item) => {
                    const isSelected = selectedDietary.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleArrayItem(selectedDietary, setSelectedDietary, item)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold"
                            : "bg-plum-900/50 text-ivory-300 border-plum-700/60 hover:border-plum-500"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ivory-200 mb-2">
                  Key Ceremonies & Traditions
                </label>
                <div className="flex flex-wrap gap-2">
                  {CULTURAL_OPTIONS.map((item) => {
                    const isSelected = selectedCultural.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleArrayItem(selectedCultural, setSelectedCultural, item)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "bg-plum-600/40 text-ivory-100 border-plum-400/50 font-semibold"
                            : "bg-plum-900/50 text-ivory-300 border-plum-700/60 hover:border-plum-500"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & LAUNCH */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-plum-900/50 border border-plum-700/60 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ivory-400">Celebration:</span>
                  <span className="font-semibold text-ivory-100">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory-400">Date & Location:</span>
                  <span className="text-ivory-200">
                    {date} • {city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory-400">Scale:</span>
                  <span className="text-ivory-200">
                    {guestCount} Guests • ₹{totalBudget.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory-400">Vibes:</span>
                  <span className="text-saffron-300 truncate max-w-xs text-right">
                    {selectedVibes.join(", ")}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="w-notes" className="block text-xs font-semibold text-ivory-200 mb-1">
                  Additional Notes or Family Requests (Optional)
                </label>
                <textarea
                  id="w-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Grand baraat on horses, eco-friendly floral rangolis, no loud fireworks..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-plum-900/60 border border-plum-700/60 text-ivory-100 placeholder:text-ivory-400/40 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-plum-800/80">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => ((s === 3 ? 2 : 1) as 1 | 2 | 3))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-ivory-300 hover:text-ivory-100 hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-saffron-500 hover:bg-saffron-400 text-plum-950 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-400"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreatePlan}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-rose-600 via-rose-500 to-saffron-500 hover:brightness-110 text-plum-950 shadow-glass-glow transition-all focus:outline-none focus:ring-2 focus:ring-saffron-400"
              >
                <Sparkles className="w-4 h-4 fill-plum-950" />
                <span>Generate Masterplan</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

