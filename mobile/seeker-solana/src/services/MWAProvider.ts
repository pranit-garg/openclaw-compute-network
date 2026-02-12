/**
 * MWAProvider — SigningProvider using Mobile Wallet Adapter (MWA).
 *
 * Connects to any Solana wallet app (Phantom, Solflare, etc.) via the MWA protocol.
 * The wallet's ed25519 public key becomes the worker's identity, and
 * receipt signing happens via the wallet's signMessages() API.
 *
 * Key insight: Solana wallets ARE ed25519. The coordinator's
 * nacl.sign.detached.verify() works with MWA signatures out of the box.
 *
 * Android-only — MWA is not supported on iOS.
 */
import { Platform } from "react-native";
import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";
import {
  transact,
  type Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SigningProvider } from "./SigningProvider";

const AUTH_TOKEN_KEY = "dispatch_mwa_auth_token";
const WALLET_ADDRESS_KEY = "dispatch_mwa_wallet_address";

const APP_IDENTITY = {
  name: "Dispatch",
  uri: "https://dispatch.computer",
  icon: "favicon.ico",
};

export class MWAProvider implements SigningProvider {
  readonly name = "wallet";
  private authToken: string | null = null;
  private walletAddress: string | null = null; // base58
  private publicKeyBytes: Uint8Array | null = null;

  async getPublicKeyHex(): Promise<string> {
    if (!this.publicKeyBytes) {
      throw new Error("Wallet not connected. Call connect() first.");
    }
    return Buffer.from(this.publicKeyBytes).toString("hex");
  }

  /**
   * Get the wallet address in base58 (for display in the UI).
   */
  getWalletAddress(): string | null {
    return this.walletAddress;
  }

  async signMessage(message: Uint8Array): Promise<string> {
    if (!this.walletAddress) {
      throw new Error("Wallet not connected. Call connect() first.");
    }

    const address = this.walletAddress;
    const authToken = this.authToken;

    const signedMessages = await transact(async (wallet: Web3MobileWallet) => {
      // Reauthorize if we have a cached auth token
      if (authToken) {
        try {
          await wallet.authorize({
            chain: "solana:devnet",
            identity: APP_IDENTITY,
            auth_token: authToken,
          });
        } catch {
          // Auth token expired — re-authorize fresh
          const result = await wallet.authorize({
            chain: "solana:devnet",
            identity: APP_IDENTITY,
          });
          this.authToken = result.auth_token;
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.auth_token);
        }
      } else {
        const result = await wallet.authorize({
          chain: "solana:devnet",
          identity: APP_IDENTITY,
        });
        this.authToken = result.auth_token;
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.auth_token);
      }

      return wallet.signMessages({
        addresses: [address],
        payloads: [message],
      });
    });

    // signMessages returns Uint8Array[] — one per input message
    return Buffer.from(signedMessages[0]).toString("base64");
  }

  async connect(): Promise<void> {
    // Try to restore cached auth token
    const [cachedToken, cachedAddress] = await Promise.all([
      AsyncStorage.getItem(AUTH_TOKEN_KEY),
      AsyncStorage.getItem(WALLET_ADDRESS_KEY),
    ]);

    this.authToken = cachedToken;

    // Always re-authorize to get fresh accounts (wallet may have changed)
    const result = await transact(async (wallet: Web3MobileWallet) => {
      return wallet.authorize({
        chain: "solana:devnet",
        identity: APP_IDENTITY,
        ...(cachedToken ? { auth_token: cachedToken } : {}),
      });
    });

    this.authToken = result.auth_token;
    this.walletAddress = result.accounts[0].address;

    // Convert base58 address to raw bytes for hex conversion
    const pubkey = new PublicKey(this.walletAddress);
    this.publicKeyBytes = pubkey.toBytes();

    // Cache for next session
    await Promise.all([
      AsyncStorage.setItem(AUTH_TOKEN_KEY, this.authToken),
      AsyncStorage.setItem(WALLET_ADDRESS_KEY, this.walletAddress),
    ]);
  }

  async disconnect(): Promise<void> {
    this.authToken = null;
    this.walletAddress = null;
    this.publicKeyBytes = null;

    await Promise.all([
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
      AsyncStorage.removeItem(WALLET_ADDRESS_KEY),
    ]);
  }

  async isAvailable(): Promise<boolean> {
    // MWA is Android-only
    return Platform.OS === "android";
  }
}
