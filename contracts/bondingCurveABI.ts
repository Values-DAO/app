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
    name: "buyToken",
    inputs: [
      {
        name: "usdAmount",
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
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateRequiredEthForUsd",
    inputs: [
      {
        name: "usdAmount",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    outputs: [
      {
        name: "requiredEth",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "communityCoinDeets",
    inputs: [],
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
    name: "onERC721Received",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
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
      {
        name: "currentTokenPrice",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "currentTokenSupply",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "fundingRaised",
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
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
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