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

// Get browser origin for relayer proxy URL
function getRelayerProxyUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/api/relayer`;
}

// Initialize FHEVM SDK with custom relayerUrl pointing to our proxy
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

    // Override relayerUrl to use our proxy (bypasses CORS)
    const customConfig = {
      ...SepoliaConfig,
      relayerUrl: getRelayerProxyUrl(),
    };

    fhevmInstance = await createInstance(customConfig);
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
  answers: (boolean | null)[]
): Promise<{
  packedHandle: `0x${string}`;
  inputProof: `0x${string}`;
}> {
  if (answers.some((a) => a === null)) {
    throw new Error("All questions must be answered before encrypting");
  }

  const fhevm = await initFhevm();
  const input = fhevm.createEncryptedInput(contractAddress, userAddress);

  let packed = 0;
  for (let i = 0; i < 9 && i < answers.length; i++) {
    if (answers[i] === true) {
      packed |= 1 << i;
    }
  }

  input.add16(BigInt(packed));
  const encrypted = await input.encrypt();

  return {
    packedHandle: toHex(encrypted.handles[0]),
    inputProof: toHex(encrypted.inputProof),
  };
}

/**
 * User private decryption using SDK's built-in userDecrypt method
 * SDK handles all relayer API details (format, retry, error codes)
 */
export async function userDecrypt(
  handles: string[],
  contractAddress: string,
  signer: any
): Promise<bigint[]> {
  const fhevm = await initFhevm();

  const userAddress = signer.account?.address;
  if (!userAddress) {
    throw new Error("Cannot get user address from signer");
  }

  // 1. Generate reencryption keypair
  const { publicKey, privateKey } = fhevm.generateKeypair();

  // 2. Build handle-contract pairs
  const handleContractPairs = handles.map((handle) => ({
    handle,
    contractAddress,
  }));

  // 3. Create EIP-712 signature request
  const startTimestamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = "1";

  const eip712 = fhevm.createEIP712(
    publicKey,
    [contractAddress],
    startTimestamp,
    durationDays
  );

  // 4. User signs the reencryption request
  // Get primaryType from SDK or use default
  const primaryType = eip712.primaryType || "UserDecryptRequestVerification";
  
  // Build types object for viem
  const types: Record<string, any> = {};
  if (eip712.types) {
    // Copy all types except EIP712Domain (viem adds it automatically)
    for (const [key, value] of Object.entries(eip712.types)) {
      if (key !== "EIP712Domain") {
        types[key] = value;
      }
    }
  }

  const signature = await signer.signTypedData({
    domain: eip712.domain,
    types: types,
    primaryType: primaryType,
    message: eip712.message,
  });

  // 5. Remove 0x prefix from signature (SDK requirement)
  const signatureWithoutPrefix = signature.replace("0x", "");

  // 6. Use SDK's built-in userDecrypt - handles all relayer details
  const result = await fhevm.userDecrypt(
    handleContractPairs,
    privateKey,
    publicKey,
    signatureWithoutPrefix,
    [contractAddress],
    userAddress,
    startTimestamp,
    durationDays
  );

  // 7. Extract decrypted values
  const values: bigint[] = [];
  for (const handle of handles) {
    const value = result[handle];
    if (value !== undefined) {
      values.push(BigInt(value));
    }
  }

  return values;
}
