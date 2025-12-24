"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useStore } from "@/store/useStore";
import { CONTRACT_ADDRESS, shortenAddress, getExplorerLink } from "@/lib/contract";
import { Copy, ExternalLink, CheckCircle } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { reset } = useStore();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    reset();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b-2 border-foreground">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent rounded-full border-2 border-foreground shadow-pop flex items-center justify-center">
            <span className="text-xl">🧠</span>
          </div>
          <span className="font-heading font-bold text-xl">MiniPersonality</span>
        </div>

        {/* Status Bar */}
        {isConnected && (
          <div className="flex items-center gap-3">
            {/* FHEVM Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card border-2 border-foreground rounded-full shadow-pop text-sm">
              <CheckCircle className="w-4 h-4 text-quaternary" />
              <span className="font-medium">FHE Ready</span>
            </div>

            {/* Contract Address */}
            {CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && (
              <a
                href={getExplorerLink(CONTRACT_ADDRESS)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-card border-2 border-foreground rounded-full shadow-pop text-sm hover:bg-tertiary transition-colors"
              >
                <span className="font-mono">{shortenAddress(CONTRACT_ADDRESS)}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Wallet Address */}
            <button
              onClick={copyAddress}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-card border-2 border-foreground rounded-full shadow-pop text-sm hover:bg-quaternary transition-colors"
            >
              <span className="font-mono">{shortenAddress(address || "")}</span>
              {copied ? (
                <CheckCircle className="w-3.5 h-3.5 text-quaternary" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Disconnect Button */}
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 bg-secondary text-white border-2 border-foreground rounded-full shadow-pop text-sm font-medium btn-candy"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

