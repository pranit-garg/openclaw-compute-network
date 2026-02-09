#!/usr/bin/env node
// scripts/register-worker.ts
// CLI to register a Dispatch worker as an ERC-8004 agent on Monad Testnet.
//
// Usage:
//   npx tsx scripts/register-worker.ts [--name "My Worker"] [--endpoint "https://..."]
//
// Env vars:
//   WORKER_PRIVATE_KEY  — hex-encoded private key (required)
//   ERC8004_RPC_URL     — override RPC (default: Monad Testnet)

import { privateKeyToAccount } from "viem/accounts";
import {
  registerAgent,
  setAgentURI,
  buildRegistrationFile,
  getAgentInfo,
  MONAD_TESTNET,
} from "@dispatch/erc8004";

// ── Parse args ──────────────────────────────────

function arg(flag: string, fallback: string): string {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1]!;
  return fallback;
}

const name = arg("--name", "Dispatch Worker");
const endpoint = arg("--endpoint", "https://localhost:4010");
const skills = arg("--skills", "LLM_PROMPT,TASK,IMAGE_GEN").split(",");

// ── Main ────────────────────────────────────────

async function main() {
  const pk = process.env.WORKER_PRIVATE_KEY;
  if (!pk) {
    console.error("Error: WORKER_PRIVATE_KEY env var is required (hex, no 0x prefix ok)");
    process.exit(1);
  }

  const privateKey = pk.startsWith("0x") ? pk as `0x${string}` : `0x${pk}` as `0x${string}`;
  const account = privateKeyToAccount(privateKey);

  console.log(`[register-worker] Registering agent on Monad Testnet (chain ${MONAD_TESTNET.chainId})`);
  console.log(`  Owner: ${account.address}`);
  console.log(`  Name:  ${name}`);

  // Step 1: Build registration file JSON
  const regFile = buildRegistrationFile({
    name,
    description: `Dispatch compute worker: ${name}`,
    endpoint,
    skills,
  });

  // For hackathon: store registration file as a data URI
  // In production: upload to IPFS/Arweave and use that URL
  const regFileJson = JSON.stringify(regFile, null, 2);
  const regFileDataUri = `data:application/json;base64,${Buffer.from(regFileJson).toString("base64")}`;

  console.log("\n  Registration file:");
  console.log(`  ${JSON.stringify(regFile, null, 2).split("\n").join("\n  ")}`);

  // Step 2: Register on-chain with URI
  console.log("\n[register-worker] Sending register() transaction...");
  const agentId = await registerAgent(account, regFileDataUri);
  console.log(`  Agent ID: ${agentId}`);

  // Step 3: Verify
  const info = await getAgentInfo(agentId);
  console.log("\n[register-worker] Registered successfully!");
  console.log(`  Agent ID: ${info.agentId}`);
  console.log(`  Owner:    ${info.owner}`);
  console.log(`  URI:      ${info.uri.slice(0, 80)}...`);
  console.log(`\n  Global Agent ID: eip155:${MONAD_TESTNET.chainId}:${MONAD_TESTNET.identityRegistry}#${agentId}`);
}

main().catch((err) => {
  console.error("[register-worker] Failed:", err);
  process.exit(1);
});
