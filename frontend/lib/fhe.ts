"use client";

// Global FHE instance state
let fhevmInstance: any = null;
let isInitialized = false;
let isInitializing = false;
let initError: string | null = null;

// Dynamic import to avoid SSR issues
let initSDK: any;
let createInstance: any;
let SepoliaConfig: any;

// Convert Uint8Array to hex string with 0x prefix
export function toHex(arr: Uint8Array): `0x${string}` {
  return `0x${Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

// Initialize FHEVM SDK
export async function initFhevm(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("FHEVM can only be initialized in browser");
  }

  if (fhevmInstance && isInitialized) return fhevmInstance;
  if (initError) throw new Error(initError);

  // Prevent concurrent initialization
  if (isInitializing) {
    return new Promise((resolve, reject) => {
      const check = setInterval(() => {
        if (isInitialized && fhevmInstance) {
          clearInterval(check);
          resolve(fhevmInstance);
        }
        if (initError) {
          clearInterval(check);
          reject(new Error(initError));
        }
      }, 100);
    });
  }

  isInitializing = true;

  try {
    // Dynamic import to avoid SSR issues
    const sdk = await import("@zama-fhe/relayer-sdk/web");
    initSDK = sdk.initSDK;
    createInstance = sdk.createInstance;
    SepoliaConfig = sdk.SepoliaConfig;

    // thread: 0 disables multi-threading to avoid COOP/COEP header issues
    await initSDK({ thread: 0 });
    fhevmInstance = await createInstance(SepoliaConfig);
    isInitialized = true;
    return fhevmInstance;
  } catch (error: any) {
    initError = error.message || "Failed to initialize FHEVM";
    throw error;
  } finally {
    isInitializing = false;
  }
}

// Get FHEVM status
export function getFhevmStatus(): {
  isReady: boolean;
  isInitializing: boolean;
  error: string | null;
} {
  return {
    isReady: isInitialized && fhevmInstance !== null,
    isInitializing,
    error: initError,
  };
}

/**
 * Encrypt 9 boolean answers into single euint16
 * Bits 0-2: Mind (M)
 * Bits 3-5: Energy (E)
 * Bits 6-8: Nature (N)
 */
export async function encryptAnswers(
  contractAddress: string,
  userAddress: string,
  answers: (boolean | null)[] // 9 answers (true = agree, false = disagree, null = unanswered)
): Promise<{
  packedHandle: `0x${string}`;
  inputProof: `0x${string}`;
}> {
  // Validate all answers are provided
  if (answers.some((a) => a === null)) {
    throw new Error("All questions must be answered before encrypting");
  }

  const fhevm = await initFhevm();
  const input = fhevm.createEncryptedInput(contractAddress, userAddress);

  // Pack 9 answers into bitmask
  let packed = 0;
  for (let i = 0; i < 9 && i < answers.length; i++) {
    if (answers[i] === true) {
      packed |= (1 << i);
    }
  }

  // Add as uint16
  input.add16(BigInt(packed));

  const encrypted = await input.encrypt();

  return {
    packedHandle: toHex(encrypted.handles[0]),
    inputProof: toHex(encrypted.inputProof),
  };
}

// User private decryption using SDK's built-in userDecrypt
export async function userDecrypt(
  handles: string[],
  contractAddress: string,
  signer: any // viem WalletClient
): Promise<bigint[]> {
  const fhevm = await initFhevm();

  // Get user address from viem WalletClient
  const userAddress = signer.account?.address;
  if (!userAddress) {
    throw new Error("Cannot get user address from signer");
  }

  // 1. Generate reencryption keypair
  const { publicKey, privateKey } = fhevm.generateKeypair();

  // 2. Create EIP-712 signature request
  const eip712 = fhevm.createEIP712(publicKey, [contractAddress]);

  // 3. Get startTimestamp and durationDays from EIP712 message
  const startTimestamp = eip712.message.startTimestamp ?? Math.floor(Date.now() / 1000);
  const durationDays = eip712.message.durationDays ?? 1;

  // Prepare message with BigInt values (required by EIP-712)
  const message = {
    ...eip712.message,
    startTimestamp: BigInt(startTimestamp),
    durationDays: BigInt(durationDays),
  };

  // 4. User signs the reencryption request
  const signature = await signer.signTypedData({
    domain: eip712.domain,
    types: eip712.types,
    primaryType: eip712.primaryType,
    message: message,
  });

  // 5. Convert keys to hex format
  const publicKeyStr = publicKey instanceof Uint8Array ? toHex(publicKey) : publicKey;
  const privateKeyStr = privateKey instanceof Uint8Array ? toHex(privateKey) : privateKey;

  // 6. Build handle-contract pairs
  const handleContractPairs = handles.map((handle) => ({
    handle,
    contractAddress,
  }));

  // 7. Use SDK's built-in userDecrypt
  const results = await fhevm.userDecrypt(
    handleContractPairs,
    privateKeyStr,
    publicKeyStr,
    signature,
    [contractAddress],
    userAddress,
    String(startTimestamp),
    String(durationDays)
  );

  // 8. Extract decrypted values
  const values: bigint[] = [];
  for (const handle of handles) {
    const value = results[handle];
    if (value !== undefined) {
      values.push(BigInt(value));
    }
  }

  return values;
}
