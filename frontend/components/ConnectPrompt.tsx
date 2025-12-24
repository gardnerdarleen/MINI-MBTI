"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useStore } from "@/store/useStore";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function ConnectPrompt() {
  const { fhevmStatus, fhevmError } = useStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 dot-pattern opacity-50" />

      {/* Floating shapes */}
      <div className="absolute top-20 left-20 w-24 h-24 bg-tertiary rounded-full border-2 border-foreground float-shape opacity-80" />
      <div className="absolute top-40 right-32 w-16 h-16 bg-secondary rounded-lg border-2 border-foreground float-shape opacity-80 rotate-12" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-32 left-40 w-20 h-20 bg-quaternary rounded-full border-2 border-foreground float-shape opacity-80" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-20 right-20 w-12 h-12 bg-accent rounded-lg border-2 border-foreground float-shape opacity-80 -rotate-12" style={{ animationDelay: "0.5s" }} />

      {/* Main content */}
      <div className="relative z-10 text-center max-w-lg">
        {/* Logo */}
        <div className="w-32 h-32 mx-auto mb-8 bg-accent rounded-full border-4 border-foreground shadow-pop-violet flex items-center justify-center animate-bounce-in">
          <span className="text-6xl">🧠</span>
        </div>

        {/* Title */}
        <h1 className="font-heading font-extrabold text-5xl mb-4">
          <span className="text-accent">Big</span>{" "}
          <span className="text-secondary">Five</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground mb-8">
          Private BFI-10 Personality Test
        </p>

        {/* FHE Status indicator */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border-2 border-foreground rounded-full shadow-pop">
            {fhevmStatus === "ready" && (
              <>
                <CheckCircle className="w-5 h-5 text-quaternary" />
                <span className="font-medium">FHE Encryption Ready</span>
              </>
            )}
            {fhevmStatus === "initializing" && (
              <>
                <Loader2 className="w-5 h-5 text-tertiary animate-spin" />
                <span className="font-medium">Initializing FHE...</span>
              </>
            )}
            {fhevmStatus === "error" && (
              <>
                <AlertCircle className="w-5 h-5 text-secondary" />
                <span className="font-medium text-secondary">{fhevmError || "FHE Error"}</span>
              </>
            )}
            {fhevmStatus === "idle" && (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                <span className="font-medium text-muted-foreground">Loading...</span>
              </>
            )}
          </div>
        </div>

        {/* Connect Button */}
        <div className="flex justify-center">
          <ConnectButton.Custom>
            {({ openConnectModal, mounted }) => {
              const ready = mounted;
              if (!ready) return null;

              return (
                <button
                  onClick={openConnectModal}
                  disabled={fhevmStatus !== "ready"}
                  className="px-8 py-4 bg-accent text-white font-heading font-bold text-xl border-2 border-foreground rounded-full shadow-pop btn-candy disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-pop"
                >
                  Connect Wallet
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* Info tags */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <span className="px-4 py-2 bg-tertiary border-2 border-foreground rounded-full text-sm font-medium shadow-pop">
            🔒 Encrypted Answers
          </span>
          <span className="px-4 py-2 bg-quaternary border-2 border-foreground rounded-full text-sm font-medium shadow-pop">
            ⛓️ On-Chain Computation
          </span>
          <span className="px-4 py-2 bg-secondary text-white border-2 border-foreground rounded-full text-sm font-medium shadow-pop">
            👤 Only You See Results
          </span>
        </div>
      </div>

      {/* Squiggle decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-6 squiggle" />
    </div>
  );
}

