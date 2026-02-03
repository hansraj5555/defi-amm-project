// Frontend configuration: replace addresses with your deployed ones
export const AMM_ADDRESS = process.env.VITE_AMM_ADDRESS || "0x0000000000000000000000000000000000000000";
export const TOKEN_ADDRESS = process.env.VITE_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";

// Minimal AMM ABI used by frontend (views and swap/add functions)
export const AMM_ABI = [
  // getReserves()
  {
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      { "internalType": "uint256", "name": "reserveA", "type": "uint256" },
      { "internalType": "uint256", "name": "reserveB", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // swapExactTokensForTokens(uint256 amountIn, uint256 minAmountOut)
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "uint256", "name": "minAmountOut", "type": "uint256" }
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // addLiquidity(uint256 amountA, uint256 amountB)
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountA", "type": "uint256" },
      { "internalType": "uint256", "name": "amountB", "type": "uint256" }
    ],
    "name": "addLiquidity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Minimal ERC20 ABI (approve + balanceOf)
export const ERC20_ABI = [
  { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }
];
