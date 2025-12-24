"use client";

import { useStore } from "@/store/useStore";
import { ArrowRight, Brain, Lock, Sparkles } from "lucide-react";

export function Welcome() {
  const { setStep } = useStore();

  const features = [
    { icon: Brain, text: "9 Questions", color: "bg-accent" },
    { icon: Lock, text: "Encrypted", color: "bg-secondary" },
    { icon: Sparkles, text: "3 Dimensions", color: "bg-tertiary" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 dot-pattern opacity-30" />

      {/* Floating decorations */}
      <div className="absolute top-32 left-16 w-20 h-20 bg-tertiary rounded-full border-2 border-foreground float-shape opacity-70" />
      <div className="absolute top-48 right-24 w-14 h-14 bg-quaternary rounded-lg border-2 border-foreground float-shape opacity-70 rotate-45" style={{ animationDelay: "1.5s" }} />
      <div className="absolute bottom-40 left-32 w-16 h-16 bg-secondary rounded-full border-2 border-foreground float-shape opacity-70" style={{ animationDelay: "0.8s" }} />

      {/* Main content card */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-card border-2 border-foreground rounded-3xl shadow-pop-violet p-8 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-accent rounded-full border-2 border-foreground shadow-pop flex items-center justify-center">
            <span className="text-5xl">🧠</span>
          </div>

          {/* Title */}
          <h2 className="font-heading font-bold text-3xl mb-2">
            Mini Personality Test
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-6">
            Discover your personality across 3 dimensions — privately encrypted on-chain with FHE.
          </p>

          {/* Features */}
          <div className="flex justify-center gap-3 mb-8">
            {features.map((f, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-3 py-1.5 ${f.color} ${f.color === "bg-secondary" ? "text-white" : ""} border-2 border-foreground rounded-full text-sm font-medium`}
              >
                <f.icon className="w-4 h-4" />
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Dimensions preview */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-accent text-white rounded-full border-2 border-foreground flex items-center justify-center text-xl mb-1">🧠</div>
              <span className="text-sm font-medium">Mind</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-secondary text-white rounded-full border-2 border-foreground flex items-center justify-center text-xl mb-1">⚡</div>
              <span className="text-sm font-medium">Energy</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-tertiary rounded-full border-2 border-foreground flex items-center justify-center text-xl mb-1">🎯</div>
              <span className="text-sm font-medium">Nature</span>
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={() => setStep("quiz")}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-accent text-white font-heading font-bold text-lg border-2 border-foreground rounded-full shadow-pop btn-candy"
          >
            Start Test
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-3 h-3 bg-accent rounded-full border border-foreground" />
          <div className="w-3 h-3 bg-secondary rounded-full border border-foreground" />
          <div className="w-3 h-3 bg-tertiary rounded-full border border-foreground" />
        </div>
      </div>
    </div>
  );
}
