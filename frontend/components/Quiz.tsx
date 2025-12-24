"use client";

import { useStore } from "@/store/useStore";
import { QUESTIONS, DIMENSIONS } from "@/lib/questions";
import { Check, X } from "lucide-react";

export function Quiz() {
  const { answers, setAnswer, setStep } = useStore();

  // Check if all 9 questions are answered (not null)
  const allAnswered = answers.every((a) => a !== null);
  const answeredCount = answers.filter((a) => a !== null).length;

  const handleSubmit = () => {
    if (!allAnswered) return;
    setStep("processing");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-20 pb-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 dot-pattern opacity-20" />

      {/* Decorative shapes */}
      <div className="absolute top-32 left-8 w-16 h-16 bg-secondary rounded-full opacity-60" />
      <div className="absolute top-64 right-12 w-12 h-12 bg-tertiary rotate-45 opacity-60" />
      <div className="absolute bottom-32 left-16 w-20 h-20 bg-accent rounded-full opacity-40" />

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2">
            Personality Quiz
          </h1>
          <p className="text-muted-foreground">
            {answeredCount}/9 answered • Your answers are encrypted
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {QUESTIONS.map((question, index) => {
            const isAgree = answers[index] === true;
            const isDisagree = answers[index] === false;

            return (
              <div
                key={question.id}
                className="bg-card border-2 border-foreground rounded-2xl shadow-pop p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Question number */}
                  <div
                    className={`w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center font-bold text-sm shrink-0
                      ${question.dimension === "M" ? "bg-accent" : ""}
                      ${question.dimension === "E" ? "bg-secondary" : ""}
                      ${question.dimension === "N" ? "bg-tertiary" : ""}
                    `}
                  >
                    {question.id}
                  </div>

                  {/* Question content */}
                  <div className="flex-1">
                    <p className="font-medium mb-3">{question.text}</p>

                    {/* Answer buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setAnswer(index, true)}
                        className={`flex-1 py-2.5 px-4 rounded-xl border-2 border-foreground font-medium transition-all flex items-center justify-center gap-2
                          ${
                            isAgree
                              ? "bg-quaternary text-white shadow-pop scale-[1.02]"
                              : "bg-muted hover:bg-quaternary/20"
                          }
                        `}
                      >
                        <Check className="w-4 h-4" />
                        Agree
                      </button>
                      <button
                        onClick={() => setAnswer(index, false)}
                        className={`flex-1 py-2.5 px-4 rounded-xl border-2 border-foreground font-medium transition-all flex items-center justify-center gap-2
                          ${
                            isDisagree
                              ? "bg-secondary text-white shadow-pop scale-[1.02]"
                              : "bg-muted hover:bg-secondary/20"
                          }
                        `}
                      >
                        <X className="w-4 h-4" />
                        Disagree
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="px-8 py-4 bg-accent text-white font-heading font-bold text-lg rounded-2xl border-2 border-foreground shadow-pop-violet hover:translate-y-[-2px] hover:shadow-pop-violet-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {allAnswered ? "Submit & Encrypt 🔐" : `Answer all questions (${answeredCount}/9)`}
          </button>
        </div>
      </div>
    </div>
  );
}
