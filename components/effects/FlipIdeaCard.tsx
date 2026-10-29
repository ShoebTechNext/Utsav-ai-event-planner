"use client";

import React, { useState } from "react";
import { Bookmark, Sparkles, RotateCw, Check } from "lucide-react";
import { IdeaItem } from "@/types";
import { useUtsav } from "@/hooks/useUtsavStore";

interface FlipIdeaCardProps {
  idea: IdeaItem;
}

export function FlipIdeaCard({ idea }: FlipIdeaCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { toggleSaveIdea, settings } = useUtsav();

  const isReduced = settings.reduceMotion;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "theme":
        return "bg-plum-500/20 text-plum-300 border-plum-500/30";
      case "decor":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "menu":
        return "bg-saffron-500/20 text-saffron-300 border-saffron-500/30";
      case "entertainment":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "return_gifts":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-white/10 text-ivory-200 border-white/20";
    }
  };

  return (
    <div className="relative h-64 w-full [perspective:1000px]">
      <div
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transformStyle: "preserve-3d",
          transition: isReduced ? "none" : "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
        }}
        className="relative w-full h-full rounded-2xl shadow-glass border border-plum-700/50 bg-plum-900/50 backdrop-blur-md"
      >
        {/* FRONT FACE */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 p-5 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-plum-950/90 to-plum-900/80"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getCategoryColor(
                  idea.category,
                )}`}
              >
                {idea.category.replace("_", " ")}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveIdea(idea.id);
                }}
                className={`p-1.5 rounded-lg border transition-colors ${
                  idea.saved
                    ? "bg-saffron-500 text-plum-950 border-saffron-400"
                    : "bg-plum-900/60 text-ivory-400 hover:text-ivory-100 border-plum-700/40"
                }`}
                aria-label={idea.saved ? "Remove from saved ideas" : "Save this idea"}
              >
                <Bookmark className={`w-4 h-4 ${idea.saved ? "fill-plum-950" : ""}`} />
              </button>
            </div>

            <h3 className="font-display text-lg font-bold text-ivory-100 leading-snug line-clamp-2">
              {idea.title}
            </h3>

            <p className="text-xs text-ivory-300/85 mt-2 line-clamp-3 leading-relaxed">
              {idea.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-plum-800/60">
            <span className="text-[11px] text-saffron-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Cultural Touch
            </span>
            <button
              type="button"
              onClick={() => setIsFlipped(true)}
              className="flex items-center gap-1.5 text-xs text-ivory-300 hover:text-saffron-300 font-medium px-2.5 py-1 rounded-md hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-saffron-400"
            >
              <span>View details</span>
              <RotateCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
          className="absolute inset-0 p-5 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-plum-900 via-plum-950 to-rose-950/80 border border-saffron-500/20"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-saffron-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Heritage Detail
              </span>
              <span className="text-[11px] text-ivory-400">Card Detail</span>
            </div>

            <p className="text-xs text-ivory-100 font-medium leading-relaxed bg-saffron-500/10 p-2.5 rounded-lg border border-saffron-500/20 mt-1">
              {idea.culturalTouch || "Infused with authentic Indian celebration warmth and traditional craftsmanship."}
            </p>

            <p className="text-xs text-ivory-300/80 mt-2.5">
              Tip: Discuss this concept with your decorator or caterer early to incorporate local artisan materials.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-plum-800/60">
            <button
              type="button"
              onClick={() => toggleSaveIdea(idea.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                idea.saved
                  ? "bg-saffron-500 text-plum-950"
                  : "bg-plum-800 text-ivory-100 hover:bg-plum-700"
              }`}
            >
              {idea.saved ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" /> Save Idea
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="flex items-center gap-1 text-xs text-ivory-400 hover:text-ivory-100 px-2 py-1"
            >
              <RotateCw className="w-3 h-3" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

