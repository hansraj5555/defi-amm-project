# DeFi AMM Project

## Overview

Production-grade **Automated Market Maker (AMM)** implementation with complete smart contracts, comprehensive tests, and frontend integration.

---

## Project Contents

### Smart Contracts
- **Token.sol** - ERC20 token implementation
- **AMM.sol** - Uniswap V2-style automated market maker

### Tests
- **AMM.t.sol** - Comprehensive functional tests
- **SecurityTests.t.sol** - Edge case and security scenario testing

### Deployment
- **Deploy.s.sol** - Foundry deployment script

### Frontend
- **App.jsx** - React component with MetaMask wallet integration
- **package.json** - Dependencies and project configuration

### Documentation
- **README.md** - Project overview
- **QUICK_START.md** - Quick setup guide
- **CODE_WALKTHROUGH.md** - Code explanation


## Getting Started

### Prerequisites
- Node.js and npm installed
- Foundry installed (for testing and deployment)
- MetaMask or compatible Ethereum wallet

### Installation

```bash
# Install dependencies
npm install
npm install --prefix frontend

# Run smart contract tests
forge test -v

# Deploy to testnet
forge script scripts/Deploy.s.sol --rpc-url <TESTNET_RPC> --private-key <PRIVATE_KEY> --broadcast
```

---

## Architecture

### Constant Product Formula (x*y=k)
The AMM maintains constant product invariant:
```
Before: 1 ETH × 500 tokens = 500
After swap: 1.1 ETH × 454.7 tokens ≈ 500
```

### Fee Mechanism
- 0.3% fee on every swap
- Fees remain in pool
- Benefits all liquidity providers proportionally

### Liquidity Provider Model
Users can:
- Provide liquidity: Deposit equal values of both tokens
- Earn fees: Receive portion of swap fees
- Manage risk: Subject to impermanent loss

---

## Project Statistics

- **Solidity Code**: ~250 lines
- **Tests**: ~55 lines  
- **Documentation**: Comprehensive guides
- **React Frontend**: Web3 integration
- **Code Complexity**: Production-ready

---

## Key Features

✓ Full-featured AMM with liquidity pool management
✓ Comprehensive test suite covering edge cases
✓ Gas-optimized smart contracts
✓ MetaMask wallet integration
✓ Testnet deployment ready
✓ Complete documentation

---

## Testing

Run the full test suite:

```bash
forge test -v      # Run all tests
forge test -vv     # Verbose output with call traces
```

## Deployment

### Testnet Deployment (Sepolia)

1. Create `.env` file:
```bash
SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key_here
```

2. Deploy contracts:
```bash
forge script scripts/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast
```

3. Verify on Etherscan:
```bash
forge verify-contract CONTRACT_ADDRESS Token \
  --chain sepolia
```

---

## Smart Contract Details

### Token.sol
- Standard ERC20 implementation
- Minting and burning functions
- Used as liquidity pair asset

### AMM.sol
- Core AMM logic with constant product formula
- Functions: `addLiquidity`, `removeLiquidity`, `swapTokensForTokens`
- Fee collection and distribution to liquidity providers
- Custom errors for gas optimization

---

## Frontend

React application with Ethers.js integration:
- MetaMask wallet connection
- Real-time balance display
- Swap interface
- Liquidity management UI

---

## License

This project is open source and available for educational and commercial use.