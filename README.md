# Mini Personality

Take a personality test where your answers stay secret — even from the blockchain. Encrypted in your browser, computed on-chain with FHE, decrypted only by you.

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 14, Tailwind, RainbowKit |
| FHE | @zama-fhe/relayer-sdk, @fhevm/solidity v0.9+ |
| Chain | Sepolia Testnet |

## Quick Start

```bash
# Install & run frontend
cd frontend && npm install && npm run dev

# Run contract tests
cd contracts && npm install && npm test
```

Open http://localhost:3000

## Tests

```bash
cd contracts && npm test
```

```
✅ 12 passing
  - Contract deployment
  - Initial state verification  
  - Access control (hasResult, getScoreHandles)
  - Interface validation
  - Event definitions
```

## Deployed Contract

| Item | Value |
|------|-------|
| Network | Sepolia |
| Address | `0xafc2D64A30e53e7839Dbd56105ccD8eDF8Eaa682` |
| Etherscan | [Verified ✓](https://sepolia.etherscan.io/address/0xafc2D64A30e53e7839Dbd56105ccD8eDF8Eaa682#code) |

## How It Works

1. Connect wallet → 2. Answer 9 questions → 3. Encrypt & submit → 4. Sign to decrypt results

All computation happens on-chain using `FHE.and()`, `FHE.select()`, `FHE.add()` — your answers remain encrypted throughout.

## License

MIT
