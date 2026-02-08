export interface CoordinatorConfig {
  port: number;
  dbPath: string;
  network: string;
  payTo: string;
  facilitatorUrl: string;
  asset?: string; // EVM USDC address (Monad), not needed for Solana
}

export function configFromEnv(overrides?: Partial<CoordinatorConfig>): CoordinatorConfig {
  return {
    port: overrides?.port ?? parseInt(process.env.PORT ?? "4010", 10),
    dbPath: overrides?.dbPath ?? process.env.DB_PATH ?? "./data/coordinator.db",
    network: overrides?.network ?? process.env.NETWORK ?? "eip155:10143",
    payTo: overrides?.payTo ?? process.env.PAY_TO ?? "",
    facilitatorUrl: overrides?.facilitatorUrl ?? process.env.FACILITATOR_URL ?? "",
    asset: overrides?.asset ?? process.env.ASSET,
  };
}
