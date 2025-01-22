export const factoryABI = [
  { inputs: [], name: "CBF__EmptyName", type: "error" },
  { inputs: [], name: "CBF__EmptySymbol", type: "error" },
  { inputs: [], name: "CBF__InvalidAllocationLength", type: "error" },
  { inputs: [], name: "CBF__ZeroAddress", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "deployer", type: "address" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "string", name: "symbol", type: "string" },
      { indexed: true, internalType: "address", name: "tokenAddress", type: "address" },
      { indexed: true, internalType: "address", name: "bondingCurveAddress", type: "address" },
    ],
    name: "TokenCreated",
    type: "event",
  },
  {
    inputs: [],
    name: "DECIMALS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_SUPPLY",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "address", name: "adminAddress", type: "address" },
      { internalType: "address[]", name: "allocationAddys", type: "address[]" },
      { internalType: "uint256[]", name: "allocationAmount", type: "uint256[]" },
    ],
    name: "initialiseToken",
    outputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
      { internalType: "address", name: "bondingCurveAddress", type: "address" },
    ],
    stateMutability: "payable",
    type: "function",
  },
];

export const factoryContractAddress = "0xDfc278D125CD27f275198EDb073e290bDEBD29b0";
