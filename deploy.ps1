# Deploy to Sepolia Testnet - Windows PowerShell Script
# Usage: .\deploy.ps1

Write-Host ""
Write-Host "🚀 DeFi AMM - Deployment to Sepolia" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "📋 Create .env with:" -ForegroundColor Yellow
    Write-Host "   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY"
    Write-Host "   PRIVATE_KEY=0xYOUR_KEY"
    exit 1
}

# Load environment from .env
$env_vars = @{}
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*)') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $env_vars[$key] = $value
    }
}

$SEPOLIA_RPC_URL = $env_vars["SEPOLIA_RPC_URL"]
$PRIVATE_KEY = $env_vars["PRIVATE_KEY"]

if (-not $SEPOLIA_RPC_URL -or -not $PRIVATE_KEY) {
    Write-Host "❌ SEPOLIA_RPC_URL or PRIVATE_KEY not set in .env" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Environment loaded" -ForegroundColor Green
Write-Host "✓ RPC URL: $SEPOLIA_RPC_URL" -ForegroundColor Cyan
Write-Host "✓ Private Key: $($PRIVATE_KEY.Substring(0, 10))..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Deploying to Sepolia..." -ForegroundColor Yellow
Write-Host ""

# Deploy
& forge script scripts/Deploy.s.sol:Deploy `
    --rpc-url $SEPOLIA_RPC_URL `
    --private-key $PRIVATE_KEY `
    --broadcast `
    -vvv

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "📍 Check Sepolia Etherscan for your contracts" -ForegroundColor Green
    Write-Host "🔗 https://sepolia.etherscan.io" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
