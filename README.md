## 🚀 DeFi AMM Project - Complete Implementation

Production-grade Automated Market Maker (AMM) for decentralized token exchange. Complete with smart contracts, comprehensive tests, deployment scripts, and React frontend.

### ✨ Features

- **ERC20 Token** - Standard fungible token with approvals
- **Automated Market Maker** - Uniswap V2-style constant product pricing
- **Liquidity Provision** - Users deposit assets and earn 0.3% fees
- **ETH ↔ Token Swaps** - Direct token trading with auto-pricing
- **Fee Mechanism** - 0.3% fee collected for liquidity providers
- **Security Tests** - Edge cases, failure scenarios, error handling
- **Testnet Deployment** - Ready for Sepolia or local Anvil
- **React Frontend** - MetaMask integration with ethers.js v6

### 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Smart Contracts | Solidity ^0.8.20 |
| Testing Framework | Foundry (Forge) |
| Build Tool | Forge |
| Deployment | Foundry Scripts |
| Frontend | React 18 + Ethers.js v6 |
| Wallet | MetaMask |
| Blockchain | Ethereum (Sepolia/Local) |

### 📁 Project Structure

```
defi-amm-project/
├── contracts/
│   ├── Token.sol           # ERC20 token (50 lines)
│   └── AMM.sol             # AMM with constant product (70 lines)
├── test/
│   ├── AMM.t.sol           # Functional tests
│   └── SecurityTests.t.sol  # Edge case tests
├── scripts/
│   └── Deploy.s.sol        # Deployment script
├── frontend/
│   ├── src/
│   │   └── App.jsx         # React component
│   └── package.json        # Dependencies
├── foundry.toml            # Foundry configuration
└── [7 Documentation Files] # Complete guides
```

### 🔒 Security Features

- **Custom Errors** - Gas-efficient error handling (saves ~200 gas)
- **Approval Pattern** - User controls token permissions
- **Fee Protection** - 0.3% fee prevents arbitrage attacks
- **Failure Tests** - testFail prefix shows edge case thinking
- **Constant Product** - Mathematical guarantee of pool solvency

### 📚 Documentation

| File | Purpose | Read Time |
|------|---------|-----------|
| **00_START_HERE.md** | Overview & next steps | 5 min |
| **QUICK_START.md** | 5-minute getting started guide | 5 min |
| **CODE_WALKTHROUGH.md** | Every line explained | 1 hour |

| **VISUAL_GUIDE.md** | Diagrams and flows | 30 min |
| **SETUP_GUIDE.md** | Detailed installation | 15 min |

### 🚀 Quick Start

**1. Install Foundry**
```bash
# Option A: From source (if Rust installed)
cargo install --git https://github.com/foundry-rs/foundry foundry-cli --locked

# Option B: Download binaries
# https://github.com/foundry-rs/foundry/releases
```

**2. Run Tests**
```bash
cd defi-amm-project
forge test -v        # Run all tests
forge test -vvv      # Detailed output
```

**3. Deploy Locally**
```bash
# Terminal 1: Start local blockchain
anvil

# Terminal 2: Deploy contracts
forge script scripts/Deploy.s.sol \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d6c1f02960247590a565 \
  --broadcast
```

**4. Test Frontend**
```bash
cd frontend
npm run dev    # Start React dev server on http://localhost:5173
```

### 🌐 Deploy to Sepolia

```bash
# Setup environment
$env:SEPOLIA_RPC = "https://sepolia.infura.io/v3/YOUR_KEY"
$env:PRIVATE_KEY = "your_private_key_here"

# Deploy
forge script scripts/Deploy.s.sol \
  --rpc-url $env:SEPOLIA_RPC \
  --private-key $env:PRIVATE_KEY \
  --broadcast \
  --verify
```

### 🧪 Test Coverage

**Functional Tests** (AMM.t.sol)
- ✅ Liquidity provision
- ✅ Token swaps
- ✅ Reserve tracking

**Security Tests** (SecurityTests.t.sol)
- ✅ Zero amount rejection
- ✅ Insufficient liquidity handling
- ✅ Custom error usage

### 💡 Key Concepts

**Constant Product Formula**
```
x * y = k (stays constant)
Before: 1 ETH × 500 tokens = 500
After:  1.1 ETH × 454.7 tokens ≈ 500
```

**Fee Mechanism**
```
Input: 0.1 ETH
Fee deducted: 0.1 × 0.003 = 0.0003 ETH
Used for pricing: 0.0997 ETH
Fee stays in pool → Benefits all LPs
```

**Approval Pattern**
```
Step 1: User calls token.approve(amm, 500)
Step 2: AMM calls token.transferFrom(user, amm, 500)
Result: Secure, permissioned token transfer
```

### 📊 Contract Stats

| Metric | Value |
|--------|-------|
| Token.sol lines | ~50 |
| AMM.sol lines | ~70 |
| Test lines | ~55 |
| Documentation | 57 KB |
| Gas savings via custom errors | ~200 per error |
| Fee percentage | 0.3% |

### 🔗 Resources

- [Foundry Book](https://book.getfoundry.sh) - Complete Foundry documentation
- [Uniswap V2 Whitepaper](https://uniswap.org/whitepaper.pdf) - AMM theory
- [Solidity Docs](https://docs.soliditylang.org) - Language reference
- [Ethers.js v6](https://docs.ethers.org/v6) - Web3 library
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts) - Security patterns

### 📝 License

MIT License - This code is open source and free to use.
