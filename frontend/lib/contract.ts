// Contract configuration - will be updated after deployment
export const CONTRACT_ADDRESS = "0xafc2D64A30e53e7839Dbd56105ccD8eDF8Eaa682" as `0x${string}`;

export const CONTRACT_ABI = [
  {
    inputs: [
      { name: "packedAnswers", type: "bytes32" },
      { name: "inputProof", type: "bytes" },
    ],
    name: "submitAnswers",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "hasResult",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getScoreHandles",
    outputs: [
      { name: "mScore", type: "bytes32" },
      { name: "eScore", type: "bytes32" },
      { name: "nScore", type: "bytes32" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Sepolia chain config
export const SEPOLIA_CHAIN_ID = 11155111;
export const BLOCK_EXPLORER_URL = "https://sepolia.etherscan.io";

// Helper functions
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getExplorerLink(address: string): string {
  return `${BLOCK_EXPLORER_URL}/address/${address}`;
}
