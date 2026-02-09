/**
 * KeyManager — Ed25519 keypair management for the mobile worker.
 *
 * Uses tweetnacl for key generation/signing.
 * Private key stored in expo-secure-store (encrypted, hardware-backed on device).
 * Public key (worker ID) stored in AsyncStorage for quick access.
 *
 * Think of it like a wallet: the private key signs receipts to prove
 * this device did the work, and the public key is the worker's identity.
 */
import nacl from "tweetnacl";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";

const SECURE_KEY = "dispatch_secret_key";
const STORAGE_PUBKEY = "dispatch_worker_id";

export interface MobileKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
  pubkeyHex: string;
}

/**
 * Load existing keypair from secure storage, or generate a new one.
 * The secret key lives in expo-secure-store (encrypted on-device).
 * The public key hex (worker ID) lives in AsyncStorage for fast reads.
 */
export async function getOrCreateKeypair(): Promise<MobileKeyPair> {
  // Try to load existing key
  const existingSecret = await SecureStore.getItemAsync(SECURE_KEY);

  if (existingSecret) {
    const secretKey = new Uint8Array(JSON.parse(existingSecret) as number[]);
    // Derive public key from secret key (tweetnacl stores both in secretKey)
    const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey);
    const pubkeyHex = Buffer.from(keyPair.publicKey).toString("hex");

    return {
      publicKey: keyPair.publicKey,
      secretKey: keyPair.secretKey,
      pubkeyHex,
    };
  }

  // Generate new keypair
  const keyPair = nacl.sign.keyPair();
  const pubkeyHex = Buffer.from(keyPair.publicKey).toString("hex");

  // Store secret key in secure storage
  await SecureStore.setItemAsync(
    SECURE_KEY,
    JSON.stringify(Array.from(keyPair.secretKey))
  );

  // Store public key hex in AsyncStorage for quick access
  await AsyncStorage.setItem(STORAGE_PUBKEY, pubkeyHex);

  return {
    publicKey: keyPair.publicKey,
    secretKey: keyPair.secretKey,
    pubkeyHex,
  };
}

/**
 * Get the worker ID (public key hex) without loading the full keypair.
 * Returns null if no keypair exists yet.
 */
export async function getWorkerId(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_PUBKEY);
}

/**
 * Sign arbitrary data with the worker's ed25519 key.
 * Returns a detached signature as Uint8Array.
 */
export function signData(
  data: Uint8Array,
  secretKey: Uint8Array
): Uint8Array {
  return nacl.sign.detached(data, secretKey);
}

/**
 * Delete the keypair from storage (used in settings "reset" flow).
 * This is irreversible — the worker gets a new identity.
 */
export async function resetKeypair(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_KEY);
  await AsyncStorage.removeItem(STORAGE_PUBKEY);
}
