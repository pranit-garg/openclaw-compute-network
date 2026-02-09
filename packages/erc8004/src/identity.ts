// ERC-8004 Identity Registry — register agents, read/set URIs
// Wraps on-chain calls via viem

import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
  type PublicClient,
  type WalletClient,
  type Transport,
  type Chain,
} from "viem";
import { identityRegistryAbi } from "./abis/identityRegistry.js";
import { monadTestnet, getChainConfig } from "./config.js";
import type { AgentInfo, RegistrationFile } from "./types.js";

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
 * Register a new agent on the Identity Registry.
 * Mints an ERC-721 token and returns the new agentId.
 */
export async function registerAgent(
  account: Account,
  agentURI?: string
): Promise<bigint> {
  const cfg = getChainConfig();
  const client = walletClient(account);

  let hash: `0x${string}`;

  if (agentURI) {
    hash = await client.writeContract({
      chain: monadTestnet,
      account,
      address: cfg.identityRegistry,
      abi: identityRegistryAbi,
      functionName: "register",
      args: [agentURI],
    });
  } else {
    hash = await client.writeContract({
      chain: monadTestnet,
      account,
      address: cfg.identityRegistry,
      abi: identityRegistryAbi,
      functionName: "register",
      args: [],
    });
  }

  // Wait for receipt and extract agentId from Registered event
  const receipt = await publicClient().waitForTransactionReceipt({ hash });

  // The Registered event is the first log; agentId is topic[1]
  for (const log of receipt.logs) {
    if (log.topics[0] && log.topics[1]) {
      // topics[1] is the indexed agentId
      return BigInt(log.topics[1]);
    }
  }

  throw new Error(`registerAgent: no Registered event found in tx ${hash}`);
}

/**
 * Read the agentURI (registration file URL) for a given agentId.
 */
export async function getAgentURI(agentId: bigint): Promise<string> {
  const cfg = getChainConfig();
  const result = await publicClient().readContract({
    address: cfg.identityRegistry,
    abi: identityRegistryAbi,
    functionName: "agentURI",
    args: [agentId],
  });
  return result as string;
}

/**
 * Update the agentURI for a registered agent. Caller must be the owner.
 */
export async function setAgentURI(
  agentId: bigint,
  uri: string,
  account: Account
): Promise<`0x${string}`> {
  const cfg = getChainConfig();
  const client = walletClient(account);
  const hash = await client.writeContract({
    chain: monadTestnet,
    account,
    address: cfg.identityRegistry,
    abi: identityRegistryAbi,
    functionName: "setAgentURI",
    args: [agentId, uri],
  });
  await publicClient().waitForTransactionReceipt({ hash });
  return hash;
}

/**
 * Get the owner address of an agent NFT.
 */
export async function getAgentOwner(agentId: bigint): Promise<`0x${string}`> {
  const cfg = getChainConfig();
  const result = await publicClient().readContract({
    address: cfg.identityRegistry,
    abi: identityRegistryAbi,
    functionName: "ownerOf",
    args: [agentId],
  });
  return result as `0x${string}`;
}

/**
 * Resolve full agent info: id, owner, URI.
 */
export async function getAgentInfo(agentId: bigint): Promise<AgentInfo> {
  const [owner, uri] = await Promise.all([
    getAgentOwner(agentId),
    getAgentURI(agentId),
  ]);
  return { agentId, owner, uri };
}

/**
 * Fetch and parse the off-chain registration file from the agentURI.
 */
export async function fetchRegistrationFile(
  agentId: bigint
): Promise<RegistrationFile> {
  const uri = await getAgentURI(agentId);
  if (!uri) throw new Error(`Agent ${agentId} has no URI set`);

  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to fetch registration file at ${uri}: ${response.status}`);
  }
  return (await response.json()) as RegistrationFile;
}

/**
 * Build a Dispatch worker registration file.
 */
export function buildRegistrationFile(opts: {
  name: string;
  description: string;
  endpoint: string;
  skills: string[];
  agentId?: number;
}): RegistrationFile {
  const cfg = getChainConfig();
  const file: RegistrationFile = {
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: opts.name,
    description: opts.description,
    services: [
      {
        name: "dispatch-compute",
        endpoint: opts.endpoint,
        version: "0.1.0",
        skills: opts.skills,
      },
    ],
    x402Support: true,
    active: true,
  };

  if (opts.agentId !== undefined) {
    file.registrations = [
      {
        agentId: opts.agentId,
        agentRegistry: `eip155:${cfg.chainId}:${cfg.identityRegistry}`,
      },
    ];
  }

  return file;
}
