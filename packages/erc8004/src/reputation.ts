// ERC-8004 Reputation Registry — give feedback, read reputation summaries
// Wraps on-chain calls via viem

import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  toBytes,
  type Account,
  type PublicClient,
  type WalletClient,
  type Transport,
  type Chain,
} from "viem";
import { reputationRegistryAbi } from "./abis/reputationRegistry.js";
import { monadTestnet, getChainConfig } from "./config.js";
import type { FeedbackEntry, ReputationSummary } from "./types.js";

// ── Client singletons (lazy) ────────────────────

let _publicClient: PublicClient<Transport, Chain> | null = null;

function publicClient(): PublicClient<Transport, Chain> {
  if (!_publicClient) {
    const cfg = getChainConfig();
    _publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(cfg.rpcUrl),
    }) as PublicClient<Transport, Chain>;
  }
  return _publicClient;
}

function walletClient(account: Account): WalletClient {
  const cfg = getChainConfig();
  return createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(cfg.rpcUrl),
  });
}

// ── Public API ──────────────────────────────────

/**
 * Post feedback for an agent on the Reputation Registry.
 * The caller (account) is recorded as the feedback client.
 */
export async function giveFeedback(
  entry: FeedbackEntry,
  account: Account
): Promise<`0x${string}`> {
  const cfg = getChainConfig();
  const client = walletClient(account);

  const hash = await client.writeContract({
    chain: monadTestnet,
    account,
    address: cfg.reputationRegistry,
    abi: reputationRegistryAbi,
    functionName: "giveFeedback",
    args: [
      entry.agentId,
      entry.value,
      entry.valueDecimals,
      entry.tag1,
      entry.tag2,
      entry.endpoint,
      entry.feedbackURI,
      entry.feedbackHash,
    ],
    // Monad testnet gas estimation reverts even when the tx would succeed.
    // Explicit gas limit bypasses the broken estimation (matches find-agent.ts).
    gas: 300_000n,
  });

  await publicClient().waitForTransactionReceipt({ hash, timeout: 60_000 });
  return hash;
}

/**
 * Get aggregated reputation summary for an agent.
 * Optionally filter by client addresses and tags.
 */
export async function getReputationSummary(
  agentId: bigint,
  opts?: {
    clientAddresses?: `0x${string}`[];
    tag1?: string;
    tag2?: string;
  }
): Promise<ReputationSummary> {
  const cfg = getChainConfig();
  const result = await publicClient().readContract({
    address: cfg.reputationRegistry,
    abi: reputationRegistryAbi,
    functionName: "getSummary",
    args: [
      agentId,
      opts?.clientAddresses ?? [],
      opts?.tag1 ?? "",
      opts?.tag2 ?? "",
    ],
  });

  const [count, summaryValue, summaryValueDecimals] = result as [bigint, bigint, number];
  return { count, summaryValue, summaryValueDecimals };
}

/**
 * Get all clients that have given feedback for an agent.
 */
export async function getFeedbackClients(
  agentId: bigint
): Promise<`0x${string}`[]> {
  const cfg = getChainConfig();
  const result = await publicClient().readContract({
    address: cfg.reputationRegistry,
    abi: reputationRegistryAbi,
    functionName: "getClients",
    args: [agentId],
  });
  return result as `0x${string}`[];
}

/**
 * Read a single feedback entry.
 */
export async function readFeedback(
  agentId: bigint,
  clientAddress: `0x${string}`,
  feedbackIndex: bigint
): Promise<{
  value: bigint;
  valueDecimals: number;
  tag1: string;
  tag2: string;
  isRevoked: boolean;
}> {
  const cfg = getChainConfig();
  const result = await publicClient().readContract({
    address: cfg.reputationRegistry,
    abi: reputationRegistryAbi,
    functionName: "readFeedback",
    args: [agentId, clientAddress, feedbackIndex],
  });

  const [value, valueDecimals, tag1, tag2, isRevoked] = result as [
    bigint, number, string, string, boolean
  ];
  return { value, valueDecimals, tag1, tag2, isRevoked };
}

/**
 * Helper: Build a feedback hash from a JSON feedback object.
 * This keccak256's the canonical JSON string.
 */
export function buildFeedbackHash(feedbackJson: Record<string, unknown>): `0x${string}` {
  const canonical = JSON.stringify(feedbackJson);
  return keccak256(toBytes(canonical));
}

/**
 * Helper: Build a FeedbackEntry for a completed Dispatch job.
 */
export function buildJobFeedback(opts: {
  agentId: bigint;
  score: number;       // 0-100 (will be stored as int128 with 2 decimals)
  jobType: string;     // e.g. "LLM_PROMPT", "TASK", "IMAGE_GEN"
  endpoint: string;    // coordinator endpoint
  feedbackURI?: string;
}): FeedbackEntry {
  return {
    agentId: opts.agentId,
    value: BigInt(Math.round(opts.score * 100)), // 2 decimal places
    valueDecimals: 2,
    tag1: "dispatch-compute",
    tag2: opts.jobType,
    endpoint: opts.endpoint,
    feedbackURI: opts.feedbackURI ?? "",
    feedbackHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  };
}
