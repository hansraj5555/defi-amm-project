#!/bin/bash

# DeFi AMM Project - Quick Testing Script
# Run this after Foundry is installed

echo "🔍 Checking Foundry installation..."
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry not found in PATH"
    echo "Please install Foundry first:"
    echo "  curl -L https://foundry.paradigm.xyz | bash"
    echo "  foundryup"
    exit 1
fi

echo "✅ Foundry found: $(forge --version)"
echo ""

# Navigate to project
cd "defi-amm-project"

# Run tests
echo "🧪 Running tests..."
forge test -vvv

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ALL TESTS PASSED!"
    echo ""
    echo "📊 Next steps:"
    echo "  1. Review test output above"
    echo "  2. Check contracts code: contracts/*.sol"
    echo "  3. Deploy locally: anvil (in another terminal)"
    echo "  4. Then: forge script scripts/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast"
else
    echo ""
    echo "❌ Some tests failed. Review output above."
fi
