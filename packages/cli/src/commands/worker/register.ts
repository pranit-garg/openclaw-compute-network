import { buildRegistrationFile, getAgentInfo, MONAD_TESTNET, registerAgent } from "@dispatch/erc8004";
import { loadConfig } from "../../lib/config.js";
import { header, keyValue, printCommandError } from "../../lib/display.js";
import { ERROR_MESSAGES, type WorkerRegisterOptions } from "../../types.js";

function normalizePrivateKey(value: string): `0x${string}` {
  return (value.startsWith("0x") ? value : `0x${value}`) as `0x${string}`;
}

export async function handler(opts: WorkerRegisterOptions): Promise<void> {
  try {
    const config = loadConfig();

    const privateKey = opts.privateKey ?? process.env.WORKER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error(ERROR_MESSAGES.MISSING_PRIVATE_KEY);
    }

    const viemAccountsModule = "viem/accounts";
    const { privateKeyToAccount } = (await import(viemAccountsModule)) as {
      privateKeyToAccount: (key: `0x${string}`) => { address: `0x${string}` };
    };
    const account = privateKeyToAccount(normalizePrivateKey(privateKey));

    const name = opts.name ?? "Dispatch Worker";
    const endpoint = opts.endpoint ?? config.coordinator.monad;
    const skills = (opts.skills ?? "LLM_INFER,TASK")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const registrationFile = buildRegistrationFile({
      name,
      description: `Dispatch compute worker: ${name}`,
      endpoint,
      skills,
    });

    const dataUri = `data:application/json;base64,${Buffer.from(
      JSON.stringify(registrationFile, null, 2)
    ).toString("base64")}`;

    const agentId = await registerAgent(account as Parameters<typeof registerAgent>[0], dataUri);
    const info = await getAgentInfo(agentId);

    header("Worker Register");
    keyValue("Network:", `Monad Testnet (${MONAD_TESTNET.chainId})`);
    keyValue("Owner:", account.address);
    keyValue("Agent ID:", String(info.agentId));
    keyValue(
      "Global ID:",
      `eip155:${MONAD_TESTNET.chainId}:${MONAD_TESTNET.identityRegistry}#${info.agentId}`
    );
  } catch (err) {
    printCommandError(err);
  }
}
