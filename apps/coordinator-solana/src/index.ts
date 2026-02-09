import { createServer, startServer, configFromEnv, buildPaymentConfig } from "@dispatch/coordinator-core";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const config = configFromEnv({
  port: parseInt(process.env.PORT ?? "4020", 10),
  dbPath: process.env.DB_PATH ?? "./data/solana.db",
  network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
  payTo: process.env.SOLANA_PAY_TO ?? "11111111111111111111111111111111",
  facilitatorUrl: process.env.SOLANA_FACILITATOR ?? "https://www.x402.org/facilitator",
});

const testnetMode = process.env.TESTNET_MODE === "true";

let middleware: ReturnType<typeof paymentMiddleware> | undefined;

if (!testnetMode) {
  const network = config.network as `${string}:${string}`;
  const resourceServer = new x402ResourceServer(
    new HTTPFacilitatorClient({ url: config.facilitatorUrl })
  ).register(network, new ExactSvmScheme());

  middleware = paymentMiddleware(buildPaymentConfig(config), resourceServer);
}

const server = createServer(config, middleware ? { paymentMiddleware: middleware } : undefined);
startServer(config, server);

console.log(`[Solana Coordinator] x402 payment gating: ${testnetMode ? "DISABLED (testnet mode)" : "ENABLED"}`);
