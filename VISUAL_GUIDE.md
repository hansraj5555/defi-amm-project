# DeFi AMM - Visual Diagrams & Flow Charts

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  - MetaMask Wallet Connection                              │
│  - Transaction UI                                           │
│  - Ethers.js Integration                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ Web3 Calls
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Blockchain (Sepolia/Local)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Token Contract                                       │   │
│  │  - balanceOf: track token holdings                   │   │
│  │  - approve: allow AMM to spend                       │   │
│  │  - transfer/transferFrom: move tokens                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ AMM Contract                                         │   │
│  │  - ethReserve, tokenReserve (liquidity pools)        │   │
│  │  - addLiquidity: deposit capital                     │   │
│  │  - swapEthForToken: trade with constant product      │   │
│  │  - getAmountOut: calculate swap price                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 2. Liquidity Provision Flow

```
User Wants to Provide Liquidity
           │
           ▼
┌─────────────────────────────────────┐
│ Hold both ETH and Tokens            │
│ (e.g., 1 ETH + 500 tokens)          │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Approve AMM contract to spend tokens│
│ (via Token.approve())               │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Call AMM.addLiquidity{value: 1 ETH} │
│ (500 tokens)                        │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Smart Contract Actions:             │
│ 1. transferFrom(user, amm, tokens)  │
│ 2. Record LP share (1 ETH worth)    │
│ 3. Update reserves                  │
│    ethReserve += 1 ETH              │
│    tokenReserve += 500 tokens       │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ User receives liquidity tokens      │
│ (proof of LP share)                 │
│ Can later redeem for pro-rata share │
└─────────────────────────────────────┘
```

## 3. Swap Flow (ETH → Token)

```
User sends 0.1 ETH to swap for tokens
           │
           ▼
┌─────────────────────────────────────┐
│ swapEthForToken called              │
│ {value: 0.1 ETH}                    │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│ Calculate output amount                                 │
│ Current state: 1 ETH reserve, 500 tokens                │
│                                                         │
│ getAmountOut(0.1, 1, 500):                              │
│  inputWithFee = 0.1 * 997 = 99.7                        │
│  numerator = 99.7 * 500 = 49,850                        │
│  denominator = (1 * 1000) + 99.7 = 1,099.7              │
│  tokenOut = 49,850 / 1,099.7 ≈ 45.3 tokens             │
└─────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Verify sufficient liquidity         │
│ Check: tokenOut > 0                 │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│ Update state:                                           │
│  ethReserve = 1 + 0.1 = 1.1 ETH                        │
│  tokenReserve = 500 - 45.3 = 454.7 tokens              │
│  New rate: 1 ETH = 413 tokens (more expensive!)         │
└─────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Transfer 45.3 tokens to user        │
│ Transfer fee (0.3%) to LPs          │
│ (kept in pool as reserve)           │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ ✅ Swap Complete                    │
│ User received 45.3 tokens           │
│ LPs earned 0.3 ETH fees             │
└─────────────────────────────────────┘
```

## 4. Price Impact Visualization

```
Starting State: 1 ETH = 500 tokens

Swap Size vs. Price Received:
┌──────────────┬──────────────┬──────────────┐
│ ETH Swapped  │ Tokens Out   │ Rate         │
├──────────────┼──────────────┼──────────────┤
│ 0.01 ETH     │ 4.99 tokens  │ 499 tokens   │
│ 0.05 ETH     │ 24.38 tokens │ 487.6 tokens │ ← Price impact
│ 0.1 ETH      │ 45.3 tokens  │ 453 tokens   │ ← More impact
│ 0.2 ETH      │ 80.4 tokens  │ 402 tokens   │ ← Significant
│ 0.5 ETH      │ 166.4 tokens │ 332.8 tokens │ ← Very bad
└──────────────┴──────────────┴──────────────┘

Larger swaps = worse rates
This encourages:
  ✓ Multiple smaller transactions
  ✓ Liquidity provision (deeper pools = less slippage)
```

## 5. Fee Mechanics

```
0.3% Fee Collection Model
═════════════════════════

User swaps 0.1 ETH (1 ETH worth of reserves per side)

Fee Calculation:
  Raw input = 0.1 ETH
  Fee amount = 0.1 * 0.003 = 0.0003 ETH
  Fee retained = 0.1 - 0.0003 = 0.0997 ETH (used for swap calc)
  
  Where does 0.0003 ETH go?
  → Stays in ethReserve (proportionally benefits all LPs)
  
After 1000 swaps of 0.1 ETH:
  Total fees = 0.3 ETH
  LPs share this proportionally to their liquidity share
  
  If you provided 50% of liquidity:
    → You get 0.15 ETH in fees
    → Annually this is 0.15 ETH × 52 weeks = 7.8 ETH fees
    
This is the incentive for liquidity provision!
```

## 6. Data Structures

```
Token Contract State:
┌────────────────────────────────────────┐
│ balanceOf: address → uint256            │
│  ├─ alice: 500 tokens                  │
│  ├─ bob: 250 tokens                    │
│  └─ amm_contract: 500 tokens (reserves)│
│                                        │
│ allowance: address → address → uint256  │
│  └─ alice → amm: 500 tokens (approved) │
└────────────────────────────────────────┘

AMM Contract State:
┌────────────────────────────────────────┐
│ ethReserve: 1 ETH                      │
│ tokenReserve: 500 tokens               │
│                                        │
│ liquidity: address → uint256            │
│  ├─ alice: 1 ETH (LP share)            │
│  └─ bob: 2 ETH (LP share)              │
│                                        │
│ totalLiquidity: 3 ETH (total shares)   │
└────────────────────────────────────────┘
```

## 7. Constant Product Formula Visualization

```
For any token pair where x = ETH, y = tokens:

          x * y = K (constant)

Before swap:    1 ETH × 500 tokens = 500 (K)
After 0.1 ETH input:
                (1.1 ETH) × (454.7 tokens) ≈ 500 (K)
                
The product stays ~constant, ensuring:
  ✓ Liquidity always available
  ✓ Pool can't be completely drained
  ✓ Price rises with demand (prevents arbitrage)

Visual:
      Tokens
         ▲
         │     
      500│      ╱────────────
         │     ╱            
      400│    ╱              ← User swaps 0.1 ETH
         │   ╱                 gets ~46 tokens
      300│  ╱
         │ ╱
      200├─────────────────────► ETH
        0  1          1.1
        
      Hyperbola shape = constant product
      Steeper on right = higher prices for more input
```

## 8. State Changes on Swap

```
Before Swap
═══════════
ETH Reserve:   1.0
Token Reserve: 500.0
K (product):   500.0
User Balance:  0.1 ETH, 0 tokens


User Action
═══════════
Swap: 0.1 ETH → ? tokens


Fee Applied
═══════════
Input fee = 0.1 × 0.003 = 0.0003
Usable amount = 0.0997


Price Calculation
═════════════════
tokenOut = (0.0997 × 500) / (1 + 0.0997)
         = 49.85 / 1.0997
         ≈ 45.3 tokens


After Swap
══════════
ETH Reserve:   1.1 (increased)
Token Reserve: 454.7 (decreased)
K (product):   ~500 (maintained!)
User Balance:  0 ETH, 45.3 tokens ✓
LP Balance:    +0.0003 ETH in fees ✓
```

## 9. Failure Scenarios

```
Scenario 1: Zero Amount Swap
────────────────────────────
swapEthForToken{value: 0}()
              │
              ▼
        if (msg.value == 0)
              │
              ▼
        revert ZeroAmount()  ✓ Caught!


Scenario 2: Insufficient Liquidity
───────────────────────────────────
tokenReserve = 0 (empty pool)
swapEthForToken{value: 0.1}()
              │
              ▼
        tokenOut = getAmountOut(0.1, 1, 0)
        tokenOut = 0
              │
              ▼
        if (tokenOut == 0)
              │
              ▼
        revert InsufficientLiquidity()  ✓ Caught!


Scenario 3: Slippage (Not prevented here)
──────────────────────────────────────────
Current price: 1 ETH = 500 tokens
User expects: 500 tokens for 0.1 ETH
Actual: 45.3 tokens (due to 0.1 out of 1 = 10% swap)

✗ Would cause loss to user
✓ Fix: Add minOutput parameter
```

---

This visual guide helps explain the AMM mechanics and flow with diagrams.
