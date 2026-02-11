import { Policy } from "@dispatch/protocol";
import { loadConfig } from "../../lib/config.js";
import { getQuote } from "../../lib/coordinator-client.js";
import { printCommandError } from "../../lib/display.js";
import {
  mapChain,
  mapJobType,
  mapPolicy,
  type AgentQuoteOptions,
} from "../../types.js";

export async function handler(opts: AgentQuoteOptions): Promise<void> {
  try {
    const config = loadConfig();
    const chain = mapChain(opts.chain ?? config.agent.defaultChain);
    const policy = mapPolicy(opts.policy ?? String(config.agent.defaultPolicy));
    const jobType = mapJobType(opts.type);

    const coordinator = config.coordinator[chain];
    const quote = await getQuote(coordinator, {
      jobType,
      policy: policy ?? Policy.AUTO,
    });

    if (opts.json) {
      process.stdout.write(`${JSON.stringify(quote, null, 2)}\n`);
      return;
    }

    process.stdout.write(`Price: ${quote.price}\n`);
    process.stdout.write(`Endpoint: ${quote.endpoint}\n`);
    process.stdout.write(`Policy: ${quote.policy_resolved}\n`);
    process.stdout.write(`Network: ${quote.network}\n`);
  } catch (err) {
    printCommandError(err);
  }
}
