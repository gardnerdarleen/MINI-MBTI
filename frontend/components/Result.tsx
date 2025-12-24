"use client";

import { useStore } from "@/store/useStore";
import { DIMENSIONS } from "@/lib/questions";
import { BLOCK_EXPLORER_URL } from "@/lib/contract";
import { ExternalLink, RotateCcw } from "lucide-react";

export function Result() {
  const { scores, txHash, reset } = useStore();

  if (!scores) return null;

  const dimensions = [
    { key: "m" as const, ...DIMENSIONS.M, score: scores.m },
    { key: "e" as const, ...DIMENSIONS.E, score: scores.e },
    { key: "n" as const, ...DIMENSIONS.N, score: scores.n },
  ];

  const getPersonalityLabel = (dim: typeof dimensions[0]) => {
    const percentage = (dim.score / dim.max) * 100;
    if (percentage >= 66) return dim.high;
    if (percentage <= 33) return dim.low;
    return "Balanced";
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 dot-pattern opacity-20" />

      {/* Decorative shapes */}
      <div className="absolute top-24 left-12 w-20 h-20 bg-accent rounded-full opacity-50 animate-float" />
      <div className="absolute top-48 right-16 w-16 h-16 bg-secondary rotate-45 opacity-50" />
      <div className="absolute bottom-32 left-20 w-14 h-14 bg-tertiary rounded-full opacity-50" />
      <div className="absolute bottom-48 right-24 w-12 h-12 bg-quaternary rotate-12 opacity-50" />

      {/* Main content */}
      <div className="relative z-10 max-w-lg w-full">
        <div className="bg-card border-2 border-foreground rounded-3xl shadow-pop-violet p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading font-bold text-3xl mb-2">
              Your Personality Profile
            </h1>
            <p className="text-muted-foreground">
              Computed on-chain with FHE privacy
            </p>
          </div>

          {/* Dimension scores */}
          <div className="space-y-6 mb-8">
            {dimensions.map((dim) => {
              const percentage = (dim.score / dim.max) * 100;
              const label = getPersonalityLabel(dim);

              return (
                <div key={dim.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{dim.emoji}</span>
                      <span className="font-bold">{dim.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {dim.score}/{dim.max}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold border-2 border-foreground
                          ${dim.key === "m" ? "bg-accent text-white" : ""}
                          ${dim.key === "e" ? "bg-secondary text-white" : ""}
                          ${dim.key === "n" ? "bg-tertiary" : ""}
                        `}
                      >
                        {label}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-4 bg-muted rounded-full border-2 border-foreground overflow-hidden">
                    <div className="absolute inset-y-0 left-0 flex items-center justify-between w-full px-2 text-[10px] font-medium text-muted-foreground">
                      <span>{dim.low}</span>
                      <span>{dim.high}</span>
                    </div>
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-full
                        ${dim.key === "m" ? "bg-accent" : ""}
                        ${dim.key === "e" ? "bg-secondary" : ""}
                        ${dim.key === "n" ? "bg-tertiary" : ""}
                      `}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-muted border-2 border-foreground rounded-2xl p-4 mb-6">
            <p className="text-center font-medium">
              You are{" "}
              <span className="text-accent">{getPersonalityLabel(dimensions[0])}</span>
              {" • "}
              <span className="text-secondary">{getPersonalityLabel(dimensions[1])}</span>
              {" • "}
              <span className="text-tertiary">{getPersonalityLabel(dimensions[2])}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {txHash && (
              <a
                href={`${BLOCK_EXPLORER_URL}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted border-2 border-foreground rounded-xl font-medium hover:bg-tertiary/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Tx
              </a>
            )}
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-white border-2 border-foreground rounded-xl font-bold shadow-pop hover:translate-y-[-2px] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          🔐 Your answers were encrypted and computed privately on-chain
        </p>
      </div>
    </div>
  );
}
