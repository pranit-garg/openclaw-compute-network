// ERC-8004: Trustless Agents — Type definitions
// Spec: https://eips.ethereum.org/EIPS/eip-8004

/**
 * Agent Registration File (off-chain JSON pointed to by agentURI).
 * Schema: https://eips.ethereum.org/EIPS/eip-8004#registration-v1
 */
export interface RegistrationFile {
  type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1";
  name: string;
  description: string;
  image?: string;
  services: Array<{
    name: string;
    endpoint: string;
    version?: string;
    skills?: string[];
  }>;
  x402Support: boolean;
  active: boolean;
  registrations?: Array<{
    agentId: number;
    agentRegistry: string; // e.g. "eip155:10143:0x8004..."
  }>;
  supportedTrust?: string[];
}

/**
 * On-chain feedback entry (matches giveFeedback params).
 * Note: ERC-8004 uses int128 for value (signed) and two tag fields.
 */
export interface FeedbackEntry {
  agentId: bigint;
  value: bigint;         // int128 — signed score
  valueDecimals: number; // uint8
  tag1: string;          // primary skill/category tag
  tag2: string;          // secondary tag (e.g. job type)
  endpoint: string;      // service endpoint that was used
  feedbackURI: string;   // off-chain feedback details URL
  feedbackHash: `0x${string}`; // keccak256 of off-chain feedback JSON
}

/**
 * Reputation summary returned by getSummary.
 */
export interface ReputationSummary {
  count: bigint;
  summaryValue: bigint;   // int128 aggregate
  summaryValueDecimals: number; // uint8
}

/**
 * Agent info resolved from the Identity Registry.
 */
export interface AgentInfo {
  agentId: bigint;
  owner: `0x${string}`;
  uri: string;
}

/**
 * Monad testnet chain configuration.
 */
export interface ChainConfig {
  chainId: number;
  rpcUrl: string;
  identityRegistry: `0x${string}`;
  reputationRegistry: `0x${string}`;
}
