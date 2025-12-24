import { create } from "zustand";

type Step = "connect" | "welcome" | "quiz" | "processing" | "result";
type FhevmStatus = "idle" | "initializing" | "ready" | "error";

interface Scores {
  m: number; // Mind: 0-3
  e: number; // Energy: 0-3
  n: number; // Nature: 0-3
}

interface Store {
  // App state
  step: Step;
  setStep: (step: Step) => void;

  // FHEVM status
  fhevmStatus: FhevmStatus;
  fhevmError: string | null;
  setFhevmStatus: (status: FhevmStatus) => void;
  setFhevmError: (error: string | null) => void;

  // Quiz answers (9 values: null = unanswered, true = agree, false = disagree)
  answers: (boolean | null)[];
  setAnswer: (index: number, value: boolean) => void;
  resetAnswers: () => void;

  // Result scores
  scores: Scores | null;
  setScores: (scores: Scores) => void;

  // Transaction
  txHash: string | null;
  setTxHash: (hash: string) => void;

  // Reset all
  reset: () => void;
}

// null means unanswered
const initialAnswers: (boolean | null)[] = new Array(9).fill(null);

export const useStore = create<Store>((set) => ({
  step: "connect",
  setStep: (step) => set({ step }),

  fhevmStatus: "idle",
  fhevmError: null,
  setFhevmStatus: (fhevmStatus) => set({ fhevmStatus }),
  setFhevmError: (fhevmError) => set({ fhevmError }),

  answers: [...initialAnswers],
  setAnswer: (index, value) =>
    set((state) => {
      const newAnswers = [...state.answers];
      newAnswers[index] = value;
      return { answers: newAnswers };
    }),
  resetAnswers: () => set({ answers: [...initialAnswers] }),

  scores: null,
  setScores: (scores) => set({ scores }),

  txHash: null,
  setTxHash: (hash) => set({ txHash: hash }),

  reset: () =>
    set({
      step: "connect",
      answers: [...initialAnswers],
      scores: null,
      txHash: null,
    }),
}));
