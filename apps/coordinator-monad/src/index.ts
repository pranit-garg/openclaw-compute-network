import { createServer, startServer, configFromEnv, buildPaymentConfig } from "@dispatch/coordinator-core";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const config = configFromEnv({
  port: parseInt(process.env.PORT ?? "4010", 10),
  dbPath: process.env.DB_PATH ?? "./data/monad.db",
  network: "eip155:10143",
  payTo: process.env.MONAD_PAY_TO ?? "0x0000000000000000000000000000000000000000",
  facilitatorUrl: process.env.MONAD_FACILITATOR ?? "https://x402-facilitator.molandak.org",
  asset: process.env.MONAD_USDC ?? "0x534b2f3A21130d7a60830c2Df862319e593943A3",
});

const testnetMode = process.env.TESTNET_MODE === "true";

let middleware: ReturnType<typeof paymentMiddleware> | undefined;

if (!testnetMode) {
  const network = config.network as `${string}:${string}`;
  const resourceServer = new x402ResourceServer(
    new HTTPFacilitatorClient({ url: config.facilitatorUrl })
  ).register(network, new ExactEvmScheme());

  middleware = paymentMiddleware(buildPaymentConfig(config), resourceServer);
}

const server = createServer(config, middleware ? { paymentMiddleware: middleware } : undefined);
startServer(config, server);

console.log(`[Monad Coordinator] x402 payment gating: ${testnetMode ? "DISABLED (testnet mode)" : "ENABLED"}`);
