import { createServer, startServer, configFromEnv, buildPaymentConfig } from "@openclaw/coordinator-core";

// STUB — TODO: Enable real x402 payment gating once packages are installed — See BACKLOG.md#x402-solana
// import { paymentMiddleware, x402ResourceServer } from "@x402/express";
// import { ExactSvmScheme } from "@x402/svm/exact/server";
// import { HTTPFacilitatorClient } from "@x402/core/server";

const config = configFromEnv({
  port: 4020,
  dbPath: "./data/solana.db",
  network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
  payTo: process.env.SOLANA_PAY_TO ?? "11111111111111111111111111111111",
  facilitatorUrl: process.env.SOLANA_FACILITATOR ?? "https://www.x402.org/facilitator",
});

// STUB — Uncomment when x402 packages are installed:
// const resourceServer = new x402ResourceServer(
//   new HTTPFacilitatorClient({ url: config.facilitatorUrl })
// ).register(config.network, new ExactSvmScheme());
//
// const middleware = paymentMiddleware(buildPaymentConfig(config, null), resourceServer);

const server = createServer(config);
startServer(config, server);

console.log("[Solana Coordinator] x402 payment gating: DISABLED (testnet mode)");
console.log("[Solana Coordinator] To enable: install @x402/express @x402/svm @x402/core and uncomment x402 setup");
