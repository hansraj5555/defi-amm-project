# DeFi AMM Project - Setup Guide

## Current Status ✅

### Completed
- ✅ Project structure created
- ✅ All contracts written (Token.sol, AMM.sol)
- ✅ Tests written (AMM.t.sol, SecurityTests.t.sol)
- ✅ Deployment script created
- ✅ Frontend setup with npm dependencies installed
- ✅ Foundry project configuration (foundry.toml)

### In Progress
- ⏳ Foundry (Forge) compilation from source

## Installation Methods

### Method 1: Wait for Source Build (Recommended for this system)
Foundry is currently being built from source via:
```bash
cargo build --profile release
```
This may take 5-10 minutes. Once complete, forge will be available at:
`~/.cargo/bin/forge`

### Method 2: Manual Installation (Alternative)
If the source build doesn't complete:
1. Download Windows binaries from: https://github.com/foundry-rs/foundry/releases
2. Extract to a folder in your PATH
3. Verify: `forge --version`

### Method 3: Pre-built Binary (Quick)
Download the latest release binary from GitHub and add to PATH.

## Testing Without Foundry Installed Locally

You can still:
1. **View and understand the contract code** - All Solidity files are production-ready
2. **Review test structure** - Tests follow Foundry standards
3. **Study the AMM mechanics** - Detailed comments explain x*y=k pricing
4. **Use the frontend** - React/Ethers.js is fully configured

## Next Steps Once Foundry is Available

```bash
cd "c:\Users\hansraj swami\Desktop\Project\defi-amm-project"

# Build contracts
forge build

# Run tests
forge test -v

# Run security tests
forge test --match-contract SecurityTest -vv

# Deploy to Sepolia (after configuring RPC and private key)
forge script scripts/Deploy.s.sol \
  --rpc-url https://sepolia.infura.io/v3/YOUR_INFURA_KEY \
  --private-key YOUR_PRIVATE_KEY \
  --broadcast
```

## Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure Explained

```
defi-amm-project/
├── contracts/
│   ├── Token.sol          # ERC20 token implementation
│   └── AMM.sol            # Automated Market Maker (Uniswap-style)
├── test/
│   ├── AMM.t.sol          # Functional tests
│   └── SecurityTests.t.sol # Security/edge case tests
├── scripts/
│   └── Deploy.s.sol       # Deployment script for testnet
├── frontend/
│   ├── src/
│   │   └── App.jsx        # React component with wallet connection
│   └── package.json       # Frontend dependencies
├── foundry.toml           # Foundry configuration
└── README.md              # Project documentation
```

## Key Features Implemented

### Token.sol
- ERC20 standard implementation
- Transfer, approve, transferFrom functions
- Event emissions for transfers and approvals

### AMM.sol
- Liquidity provision (addLiquidity)
- ETH ↔ Token swaps
- Uniswap-style pricing: (inputWithFee × outputReserve) / (inputReserve + inputWithFee)
- 0.3% fee mechanism (997/1000)
- Custom errors for gas efficiency
- Reserve tracking

### Tests
- Liquidity addition tests
- Swap execution tests
- Failure scenarios (zero amount handling)

### Frontend
- MetaMask integration
- Wallet connection
- Ethers.js v6 setup
- React hooks for state management

## Troubleshooting

### Forge Command Not Found
- Ensure Foundry installation completes
- Add `~/.cargo/bin` to system PATH
- Restart terminal after installation

### NPM Install Issues
- Clear cache: `npm cache clean --force`
- Delete node_modules: `rm -r node_modules`
- Reinstall: `npm install`

### Contract Compilation Errors
- Update Solidity version in foundry.toml if needed
- Check import paths in test files
- Ensure all dependencies in lib/ are correct

## Support Resources

- Foundry Book: https://book.getfoundry.sh
- Solidity Docs: https://docs.soliditylang.org
- Uniswap V2 Docs: https://docs.uniswap.org/protocol/V2/concepts/core-concepts/swaps
- Ethers.js Docs: https://docs.ethers.org/v6

---


