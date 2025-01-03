export const bondingCurveABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "name",
        type: "string",
        internalType: "string",
      },
      {
        name: "symbol",
        type: "string",
        internalType: "string",
      },
      {
        name: "description",
        type: "string",
        internalType: "string",
      },
      {
        name: "fundingRaised",
        type: "uint96",
        internalType: "uint96",
      },
      {
        name: "tokenAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "creatorAddress",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "BONDINGCURVE_TOTAL_SUPPLY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "LP_SUPPLY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "activeSupply",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addressToTokenMapping",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "name",
        type: "string",
        internalType: "string",
      },
      {
        name: "symbol",
        type: "string",
        internalType: "string",
      },
      {
        name: "isGraduated",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "description",
        type: "string",
        internalType: "string",
      },
      {
        name: "tokenAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "creatorAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "fundingRaised",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "buyToken",
    inputs: [
      {
        name: "tokenAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenQty",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "calculateCoinAmountOnUSDAmt",
    inputs: [
      {
        name: "purchaseAmountInUsd",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateCost",
    inputs: [
      {
        name: "_activeSupply",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokensToBuy",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "calculateTokensForEth",
    inputs: [
      {
        name: "_activeSupply",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "ethAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tokenQuantity",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "configurePool",
    inputs: [
      {
        name: "fee",
        type: "uint24",
        internalType: "uint24",
      },
      {
        name: "tick",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "newToken",
        type: "address",
        internalType: "address",
      },
      {
        name: "wethAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "tickSpacing",
        type: "int24",
        internalType: "int24",
      },
      {
        name: "_positionManager",
        type: "address",
        internalType: "address",
      },
      {
        name: "poolfactory",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "positionId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getCurrentPrice",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "v3Interface",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract AggregatorV3Interface",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "PoolConfigured",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "weth",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "positionId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokensPurchased",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "cost",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "CBP__BondingCurveAlreadyGraduated",
    inputs: [],
  },
  {
    type: "error",
    name: "CBP__IncorrectCostValue",
    inputs: [],
  },
  {
    type: "error",
    name: "CBP__InsufficientAvailableSupply",
    inputs: [],
  },
  {
    type: "error",
    name: "CBP__InvalidLogAmount",
    inputs: [],
  },
  {
    type: "error",
    name: "CBP__InvalidPoolConfiguration",
    inputs: [],
  },
  {
    type: "error",
    name: "CBP__InvalidTokenAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "CBP__SupplyCapExceededAlready",
    inputs: [],
  },
  {
    type: "error",
    name: "PRBMath_MulDiv18_Overflow",
    inputs: [
      {
        name: "x",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "y",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "PRBMath_MulDiv_Overflow",
    inputs: [
      {
        name: "x",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "y",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "denominator",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "PRBMath_UD60x18_Exp2_InputTooBig",
    inputs: [
      {
        name: "x",
        type: "uint256",
        internalType: "UD60x18",
      },
    ],
  },
  {
    type: "error",
    name: "PRBMath_UD60x18_Exp_InputTooBig",
    inputs: [
      {
        name: "x",
        type: "uint256",
        internalType: "UD60x18",
      },
    ],
  },
  {
    type: "error",
    name: "PRBMath_UD60x18_Log_InputTooSmall",
    inputs: [
      {
        name: "x",
        type: "uint256",
        internalType: "UD60x18",
      },
    ],
  },
];

const bondingCurveAddress = ""
