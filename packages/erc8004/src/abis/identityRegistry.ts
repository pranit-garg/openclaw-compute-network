// ERC-8004 Identity Registry ABI (ERC-721 based)
// Source: https://github.com/erc-8004/erc-8004-contracts

export const identityRegistryAbi = [
  // ── Registration ──────────────────────────────
  {
    type: "function",
    name: "register",
    inputs: [
      { name: "agentURI", type: "string", internalType: "string" },
      {
        name: "metadata",
        type: "tuple[]",
        internalType: "struct MetadataEntry[]",
        components: [
          { name: "metadataKey", type: "string", internalType: "string" },
          { name: "metadataValue", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    outputs: [{ name: "agentId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "register",
    inputs: [{ name: "agentURI", type: "string", internalType: "string" }],
    outputs: [{ name: "agentId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "register",
    inputs: [],
    outputs: [{ name: "agentId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },

  // ── Agent URI ─────────────────────────────────
  {
    type: "function",
    name: "setAgentURI",
    inputs: [
      { name: "agentId", type: "uint256", internalType: "uint256" },
      { name: "newURI", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "agentURI",
    inputs: [{ name: "agentId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },

  // ── Metadata ──────────────────────────────────
  {
    type: "function",
    name: "getMetadata",
    inputs: [
      { name: "agentId", type: "uint256", internalType: "uint256" },
      { name: "metadataKey", type: "string", internalType: "string" },
    ],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setMetadata",
    inputs: [
      { name: "agentId", type: "uint256", internalType: "uint256" },
      { name: "metadataKey", type: "string", internalType: "string" },
      { name: "metadataValue", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  // ── Agent Wallet ──────────────────────────────
  {
    type: "function",
    name: "setAgentWallet",
    inputs: [
      { name: "agentId", type: "uint256", internalType: "uint256" },
      { name: "newWallet", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
      { name: "signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAgentWallet",
    inputs: [{ name: "agentId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "unsetAgentWallet",
    inputs: [{ name: "agentId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  // ── ERC-721 standard ──────────────────────────
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },

  // ── Events ────────────────────────────────────
  {
    type: "event",
    name: "Registered",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "agentURI", type: "string", indexed: false, internalType: "string" },
      { name: "owner", type: "address", indexed: true, internalType: "address" },
    ],
  },
  {
    type: "event",
    name: "URIUpdated",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "newURI", type: "string", indexed: false, internalType: "string" },
      { name: "updatedBy", type: "address", indexed: true, internalType: "address" },
    ],
  },
  {
    type: "event",
    name: "MetadataSet",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "indexedMetadataKey", type: "string", indexed: true, internalType: "string" },
      { name: "metadataKey", type: "string", indexed: false, internalType: "string" },
      { name: "metadataValue", type: "bytes", indexed: false, internalType: "bytes" },
    ],
  },
] as const;
