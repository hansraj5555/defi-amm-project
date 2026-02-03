# DeFi AMM Project - Quick Testing Script for Windows
# Run this after Foundry is installed

Write-Host "🔍 Checking Foundry installation..." -ForegroundColor Yellow

# Check if forge is available
if (-not (Get-Command forge -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Foundry not found in PATH" -ForegroundColor Red
    Write-Host "Please install Foundry first:" -ForegroundColor Yellow
    Write-Host "  1. From source: cargo install --git https://github.com/foundry-rs/foundry foundry-cli --locked"
    Write-Host "  2. Or download binaries: https://github.com/foundry-rs/foundry/releases"
    exit 1
}

Write-Host "✅ Foundry found!" -ForegroundColor Green
forge --version
Write-Host ""

# Navigate to project
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

# Run tests
Write-Host "🧪 Running tests with detailed output..." -ForegroundColor Cyan
forge test -vvv

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Review test output above"
    Write-Host "  2. Check contracts: contracts/Token.sol, contracts/AMM.sol"
    Write-Host "  3. Deploy locally:"
    Write-Host "     - Open new terminal"
    Write-Host "     - Run: anvil"
    Write-Host "     - In first terminal, run deploy script"
    Write-Host ""
    Write-Host "📚 Read documentation:" -ForegroundColor Yellow
    Write-Host "  - 00_START_HERE.md (start here!)"
    Write-Host "  - QUICK_START.md (5-minute overview)"
    Write-Host "  - CODE_WALKTHROUGH.md (detailed explanations)"
}
else {
    Write-Host ""
    Write-Host "❌ Some tests failed. Review output above." -ForegroundColor Red
}
