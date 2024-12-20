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
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "string", name: "description", type: "string" },
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

export const factoryContractAddress = "0x5F695228a952348a090bFe9FfC3080a52EC3a761";
