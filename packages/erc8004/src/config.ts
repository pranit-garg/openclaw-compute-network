// ERC-8004 contract addresses and chain config
// Source: https://github.com/erc-8004/erc-8004-contracts

import { defineChain } from "viem";
import type { ChainConfig } from "./types.js";

// ── Monad Testnet chain definition for viem ─────
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://testnet.monadexplorer.com" },
  },
  testnet: true,
});

// ── Deployed contract addresses ─────────────────

/** Monad Testnet (chain 10143) — confirmed deployed */
export const MONAD_TESTNET: ChainConfig = {
  chainId: 10143,
  rpcUrl: "https://testnet-rpc.monad.xyz",
  identityRegistry: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
  reputationRegistry: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
};

/** Base Sepolia (chain 84532) — for testing */
export const BASE_SEPOLIA: ChainConfig = {
  chainId: 84532,
  rpcUrl: "https://sepolia.base.org",
  identityRegistry: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
  reputationRegistry: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
};

/** Monad Mainnet — same CREATE2 addresses */
export const MONAD_MAINNET: ChainConfig = {
  chainId: 10143, // TODO: Update when Monad mainnet launches with a different chain ID
  rpcUrl: "https://rpc.monad.xyz",
  identityRegistry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
  reputationRegistry: "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63",
};

/**
 * Resolve chain config from environment or default to Monad Testnet.
 */
export function getChainConfig(): ChainConfig {
  const id = process.env.ERC8004_IDENTITY_REGISTRY;
  const rep = process.env.ERC8004_REPUTATION_REGISTRY;
  const rpc = process.env.ERC8004_RPC_URL;
  const chainId = process.env.ERC8004_CHAIN_ID;

  if (id && rep && rpc && chainId) {
    return {
      chainId: parseInt(chainId, 10),
      rpcUrl: rpc,
      identityRegistry: id as `0x${string}`,
      reputationRegistry: rep as `0x${string}`,
    };
  }

  return MONAD_TESTNET;
}
