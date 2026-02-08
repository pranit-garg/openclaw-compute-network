import { createServer, startServer, configFromEnv, buildPaymentConfig } from "@openclaw/coordinator-core";

// STUB — TODO: Enable real x402 payment gating once packages are installed — See BACKLOG.md#x402-monad
// import { paymentMiddleware, x402ResourceServer } from "@x402/express";
// import { ExactEvmScheme } from "@x402/evm/exact/server";
// import { HTTPFacilitatorClient } from "@x402/core/server";

const config = configFromEnv({
  port: 4010,
  dbPath: "./data/monad.db",
  network: "eip155:10143",
  payTo: process.env.MONAD_PAY_TO ?? "0x0000000000000000000000000000000000000000",
  facilitatorUrl: process.env.MONAD_FACILITATOR ?? "https://x402-facilitator.molandak.org",
  asset: process.env.MONAD_USDC ?? "0x534b2f3A21130d7a60830c2Df862319e593943A3",
});

// STUB — Uncomment when x402 packages are installed:
// const resourceServer = new x402ResourceServer(
//   new HTTPFacilitatorClient({ url: config.facilitatorUrl })
// ).register(config.network, new ExactEvmScheme());
//
// const middleware = paymentMiddleware(buildPaymentConfig(config, null), resourceServer);

const server = createServer(config);
// To enable x402: createServer(config, { paymentMiddleware: middleware });

startServer(config, server);

console.log("[Monad Coordinator] x402 payment gating: DISABLED (testnet mode)");
console.log("[Monad Coordinator] To enable: install @x402/express @x402/evm @x402/core and uncomment x402 setup");
