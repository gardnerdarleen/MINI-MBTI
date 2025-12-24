"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useStore } from "@/store/useStore";
import { initFhevm } from "@/lib/fhe";
import { Header } from "@/components/Header";
import { ConnectPrompt } from "@/components/ConnectPrompt";
import { Welcome } from "@/components/Welcome";
import { Quiz } from "@/components/Quiz";
import { Processing } from "@/components/Processing";
import { Result } from "@/components/Result";

export default function Home() {
  const { isConnected, isDisconnected } = useAccount();
  const { step, setStep, reset, setFhevmStatus, setFhevmError } = useStore();

  // Initialize FHEVM on mount
  useEffect(() => {
    const init = async () => {
      setFhevmStatus("initializing");
      try {
        await initFhevm();
        setFhevmStatus("ready");
      } catch (e: any) {
        console.error("FHEVM init failed:", e);
        setFhevmStatus("error");
        setFhevmError(e.message || "Failed to initialize FHE");
      }
    };
    init();
  }, [setFhevmStatus, setFhevmError]);

  // Reset when wallet disconnects
  useEffect(() => {
    if (isDisconnected) {
      reset();
    }
  }, [isDisconnected, reset]);

  // Set to welcome when connected
  useEffect(() => {
    if (isConnected && step === "connect") {
      setStep("welcome");
    }
  }, [isConnected, step, setStep]);

  // Show connect prompt if not connected
  if (!isConnected) {
    return <ConnectPrompt />;
  }

  return (
    <>
      <Header />
      {step === "welcome" && <Welcome />}
      {step === "quiz" && <Quiz />}
      {step === "processing" && <Processing />}
      {step === "result" && <Result />}
    </>
  );
}
