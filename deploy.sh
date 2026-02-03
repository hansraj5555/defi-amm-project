#!/bin/bash
# Deploy to Sepolia Testnet
# Usage: ./deploy.sh

set -e

echo ""
echo "🚀 DeFi AMM - Deployment to Sepolia"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📋 Create .env with:"
    echo "   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY"
    echo "   PRIVATE_KEY=0xYOUR_KEY"
    exit 1
fi

# Load environment
source .env

if [ -z "$SEPOLIA_RPC_URL" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "❌ SEPOLIA_RPC_URL or PRIVATE_KEY not set in .env"
    exit 1
fi

echo "✓ Environment loaded"
echo "✓ Deploying to Sepolia..."
echo ""

# Deploy
forge script scripts/Deploy.s.sol:Deploy \
    --rpc-url $SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    -vvv

echo ""
echo "✅ Deployment complete!"
echo "📍 Check Sepolia Etherscan for your contracts"
echo "🔗 https://sepolia.etherscan.io"
echo ""
