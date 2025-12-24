"use client";

import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useWalletClient } from "wagmi";
import { encryptAnswers, userDecrypt } from "@/lib/fhe";
import { CONTRACT_ADDRESS, CONTRACT_ABI, BLOCK_EXPLORER_URL } from "@/lib/contract";
import { Loader2, Lock, Send, Unlock, CheckCircle, ExternalLink } from "lucide-react";

type ProcessingPhase = "encrypting" | "submitting" | "waiting" | "decrypting" | "complete";

export function Processing() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { answers, setStep, setScores, txHash, setTxHash } = useStore();

  const [phase, setPhase] = useState<ProcessingPhase>("encrypting");
  const [error, setError] = useState<string | null>(null);
  const [encryptedData, setEncryptedData] = useState<{
    packedHandle: `0x${string}`;
    inputProof: `0x${string}`;
  } | null>(null);

  // Prevent duplicate submissions
  const hasSubmittedRef = useRef(false);
  const hasDecryptedRef = useRef(false);

  const { writeContract, data: hash, error: writeError } = useWriteContract();

  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: hash,
  });

  // Read score handles after tx success
  const { data: scoreHandles, refetch: refetchScores } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getScoreHandles",
    account: address,
  });

  // Step 1: Encrypt answers
  useEffect(() => {
    if (phase !== "encrypting" || !address || encryptedData) return;

    const doEncrypt = async () => {
      try {
        const result = await encryptAnswers(CONTRACT_ADDRESS, address, answers);
        setEncryptedData(result);
        setPhase("submitting");
      } catch (e: any) {
        setError(e.message || "Encryption failed");
      }
    };

    doEncrypt();
  }, [phase, address, answers, encryptedData]);

  // Step 2: Submit to contract (with ref guard to prevent duplicates)
  useEffect(() => {
    if (phase !== "submitting" || !encryptedData || hash || hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "submitAnswers",
      args: [
        encryptedData.packedHandle,
        encryptedData.inputProof,
      ],
      gas: 1500000n, // Reduced gas for simpler computation
    });
  }, [phase, encryptedData, hash]);

  // Track tx hash
  useEffect(() => {
    if (hash && !txHash) {
      setTxHash(hash);
      setPhase("waiting");
    }
  }, [hash, txHash, setTxHash]);

  // Step 3: Wait for tx and then decrypt
  useEffect(() => {
    if (!isTxSuccess || phase === "decrypting" || phase === "complete") return;

    setPhase("decrypting");
    refetchScores();
  }, [isTxSuccess, phase, refetchScores]);

  // Step 4: Decrypt results (with ref guard to prevent duplicates)
  useEffect(() => {
    if (phase !== "decrypting" || !scoreHandles || !walletClient || hasDecryptedRef.current) return;

    hasDecryptedRef.current = true;

    const doDecrypt = async () => {
      try {
        const [mHandle, eHandle, nHandle] = scoreHandles as [string, string, string];
        const handles = [mHandle, eHandle, nHandle];

        const decrypted = await userDecrypt(handles, CONTRACT_ADDRESS, walletClient);

        const scores = {
          m: Number(decrypted[0]),
          e: Number(decrypted[1]),
          n: Number(decrypted[2]),
        };

        setScores(scores);
        setPhase("complete");

        setTimeout(() => {
          setStep("result");
        }, 1000);
      } catch (e: any) {
        hasDecryptedRef.current = false; // Allow retry on error
        setError(e.message || "Decryption failed");
      }
    };

    doDecrypt();
  }, [phase, scoreHandles, walletClient, setScores, setStep]);

  // Handle write error
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || "Transaction failed");
    }
  }, [writeError]);

  const phases = [
    { key: "encrypting", label: "Encrypting", icon: Lock, color: "bg-accent" },
    { key: "submitting", label: "Submitting", icon: Send, color: "bg-secondary" },
    { key: "waiting", label: "Computing", icon: Loader2, color: "bg-tertiary" },
    { key: "decrypting", label: "Decrypting", icon: Unlock, color: "bg-quaternary" },
    { key: "complete", label: "Complete", icon: CheckCircle, color: "bg-quaternary" },
  ];

  const currentPhaseIndex = phases.findIndex((p) => p.key === phase);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 dot-pattern opacity-20" />

      {/* Main content */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-card border-2 border-foreground rounded-3xl shadow-pop-violet p-8 text-center">
          {/* Animated icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-accent rounded-full border-2 border-foreground shadow-pop flex items-center justify-center">
            {phase !== "complete" ? (
              <div className="loader" />
            ) : (
              <CheckCircle className="w-12 h-12 text-white" />
            )}
          </div>

          {/* Phase title */}
          <h2 className="font-heading font-bold text-2xl mb-2">
            {phase === "encrypting" && "Encrypting Answers"}
            {phase === "submitting" && "Submitting Transaction"}
            {phase === "waiting" && "On-Chain FHE Computing"}
            {phase === "decrypting" && "Decrypting Results"}
            {phase === "complete" && "Complete!"}
          </h2>

          <p className="text-muted-foreground mb-8">
            {phase === "encrypting" && "Securing your answers..."}
            {phase === "submitting" && "Please confirm in your wallet..."}
            {phase === "waiting" && "FHE magic happening on-chain..."}
            {phase === "decrypting" && "Sign to reveal your results..."}
            {phase === "complete" && "Your personality profile is ready!"}
          </p>

          {/* Progress steps */}
          <div className="flex justify-center gap-2 mb-6">
            {phases.slice(0, 4).map((p, i) => (
              <div
                key={p.key}
                className={`w-8 h-8 rounded-full border-2 border-foreground flex items-center justify-center transition-all ${
                  i < currentPhaseIndex
                    ? "bg-quaternary"
                    : i === currentPhaseIndex
                    ? `${p.color} animate-pulse`
                    : "bg-muted"
                }`}
              >
                {i < currentPhaseIndex ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <p.icon className={`w-4 h-4 ${i === currentPhaseIndex ? "text-white" : "text-muted-foreground"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Transaction link */}
          {txHash && (
            <a
              href={`${BLOCK_EXPLORER_URL}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted border-2 border-foreground rounded-full text-sm font-medium hover:bg-tertiary transition-colors"
            >
              View Transaction
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Error display */}
          {error && (
            <div className="mt-6 p-4 bg-secondary/10 border-2 border-secondary rounded-2xl">
              <p className="text-secondary font-medium text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
