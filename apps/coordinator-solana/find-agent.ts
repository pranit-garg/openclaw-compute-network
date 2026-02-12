/**
 * Find the agentId owned by the coordinator and test if feedback works.
 */
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet, getChainConfig, identityRegistryAbi, reputationRegistryAbi } from "@dispatch/erc8004";

async function main() {
  const cfg = getChainConfig();
  const coordKey = process.env.ERC8004_PRIVATE_KEY!;
  const coordAccount = privateKeyToAccount(coordKey as `0x${string}`);

  const client = createPublicClient({
    chain: monadTestnet,
    transport: http(cfg.rpcUrl),
  });

  console.log(`Coordinator: ${coordAccount.address}`);

  // Check how many agents the coordinator owns
  const balance = await client.readContract({
    address: cfg.identityRegistry,
    abi: identityRegistryAbi,
    functionName: "balanceOf",
    args: [coordAccount.address],
  });
  console.log(`Coordinator owns ${balance} agent(s)`);

  // Check agents 0..30 to find coordinator's
  console.log("\nScanning agents 0-30...");
  let coordAgentId: bigint | null = null;
  let otherAgentId: bigint | null = null;

  for (let i = 0; i <= 30; i++) {
    try {
      const owner = await client.readContract({
        address: cfg.identityRegistry,
        abi: identityRegistryAbi,
        functionName: "ownerOf",
        args: [BigInt(i)],
      });
      const isCoord = (owner as string).toLowerCase() === coordAccount.address.toLowerCase();
      console.log(`  Agent ${i}: owner ${(owner as string).slice(0, 10)}... ${isCoord ? "<<< COORDINATOR" : ""}`);
      if (isCoord) coordAgentId = BigInt(i);
      else otherAgentId = BigInt(i);
    } catch {
      console.log(`  Agent ${i}: not minted`);
      break; // Sequential IDs, so first gap means we're done
    }
  }

  if (coordAgentId !== null) {
    console.log(`\nCoordinator owns agentId ${coordAgentId}`);
    console.log("Cannot give self-feedback. Need to transfer or use a different agent.");
  }

  // Try giving feedback to a non-coordinator-owned agent
  if (otherAgentId !== null) {
    console.log(`\nTesting feedback to agentId ${otherAgentId} (owned by someone else)...`);

    const walletClient = createWalletClient({
      account: coordAccount,
      chain: monadTestnet,
      transport: http(cfg.rpcUrl),
    });

    try {
      const hash = await walletClient.writeContract({
        chain: monadTestnet,
        account: coordAccount,
        address: cfg.reputationRegistry,
        abi: reputationRegistryAbi,
        functionName: "giveFeedback",
        args: [
          otherAgentId,
          8000n,        // score: 80.00
          2,            // decimals
          "dispatch-compute",
          "COMPUTE",
          "https://dispatch.computer",
          "",
          "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        ],
        gas: 300000n,
      });
      console.log(`Feedback TX: ${hash}`);
      const receipt = await client.waitForTransactionReceipt({ hash, timeout: 60_000 });
      console.log(`Status: ${receipt.status}`);
      if (receipt.status === "success") {
        console.log(`\nFeedback WORKS! Use agentId ${otherAgentId}`);
        console.log(`\n=== SET ON RAILWAY ===`);
        console.log(`ERC8004_AGENT_ID=${otherAgentId}`);
        console.log(`======================`);
      }
    } catch (e: any) {
      console.log(`Feedback failed: ${e.shortMessage ?? e.message}`);
    }
  }
}

main().catch(console.error);
