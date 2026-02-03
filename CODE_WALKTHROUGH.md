# Complete Contract Code Walkthrough

## File: contracts/Token.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// This is a basic ERC20 token implementation
// ERC20 is the standard for fungible tokens on Ethereum
contract Token {
    
    // ============ State Variables ============
    
    string public name = "Demo Token";
    string public symbol = "DMT";
    uint8 public decimals = 18;  // 18 decimals = 1 token = 10^18 units
    uint256 public totalSupply;  // Total tokens ever created

    // Track balances: address => how many tokens they have
    mapping(address => uint256) public balanceOf;
    
    // Track approvals: owner => spender => how many tokens spender can use
    // This is the two-level approval system that enables DEXes to work
    mapping(address => mapping(address => uint256)) public allowance;

    // ============ Events ============
    // Events are logs that external systems can listen to
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ============ Constructor ============
    // Runs once when contract deploys
    constructor(uint256 _supply) {
        // Create all tokens at once
        // _supply is in plain numbers, we multiply by 1e18 for decimals
        // If _supply = 1,000,000:
        //   totalSupply = 1,000,000 * 10^18 = 1 quintillion units
        totalSupply = _supply * 1e18;
        
        // Give all tokens to the deployer (msg.sender)
        balanceOf[msg.sender] = totalSupply;
    }

    // ============ Functions ============

    /**
     * @dev Transfer tokens from caller to another address
     * @param to Recipient address
     * @param amount How many tokens to send
     * @return bool Success indicator (for ERC20 compliance)
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        // Revert if sender doesn't have enough tokens
        require(balanceOf[msg.sender] >= amount, "Insufficient");
        
        // Update balances
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        
        // Emit event (logs for off-chain listening)
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev Approve a spender to use your tokens
     * This is how you allow contracts (like AMM) to move your tokens
     * 
     * Workflow:
     *   1. User approves: token.approve(amm, 500)
     *   2. AMM can now call: token.transferFrom(user, amm, 500)
     * 
     * @param spender Who is allowed to spend (usually a contract)
     * @param amount How many tokens they can spend
     * @return bool Success indicator
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        // Update the approval amount
        allowance[msg.sender][spender] = amount;
        
        // Emit event so wallets/UIs know
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Transfer on behalf of someone (using their approval)
     * Only works if: from approved to msg.sender for at least amount
     * This is the critical function that enables DEX functionality
     * 
     * Called by: AMM contract on behalf of user
     * Executes: User → AMM (tokens flow to contract)
     * 
     * @param from Token owner
     * @param to Recipient
     * @param amount How many tokens to transfer
     * @return bool Success indicator
     */
    function transferFrom(address from, address to, uint256 amount) 
        external 
        returns (bool) 
    {
        // Check 1: Does 'from' have enough tokens?
        require(balanceOf[from] >= amount, "Low balance");
        
        // Check 2: Has 'from' approved msg.sender (caller) to spend this much?
        // msg.sender is usually the AMM contract
        require(allowance[from][msg.sender] >= amount, "Not approved");
        
        // Update allowance (prevents spending same tokens twice)
        allowance[from][msg.sender] -= amount;
        
        // Update balances
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        
        // Emit event
        emit Transfer(from, to, amount);
        return true;
    }
}
```

### Token.sol Key Interview Points

**Q: Why approval system?**
A: Security. Without it, contracts would need private keys. With approval, users explicitly grant permission and can revoke it.

**Q: What if approval is set to 0?**
A: Spender can't transfer anything. User can change approval anytime.

**Q: What prevents double-spending?**
A: `allowance[from][msg.sender] -= amount` reduces remaining allowance. Each unit can only be used once.

---

## File: contracts/AMM.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Minimal token interface (only functions we need)
interface IERC20 {
    function transferFrom(address, address, uint256) external returns (bool);
    function transfer(address, uint256) external returns (bool);
}

/**
 * Automated Market Maker (AMM)
 * 
 * Core concept: User provides liquidity, AMM uses it to price trades
 * 
 * Formula: x * y = k (constant product)
 *   x = ETH reserves
 *   y = Token reserves
 *   k = invariant (stays constant)
 * 
 * Pricing example:
 *   Pool: 1 ETH : 500 tokens (ratio 1:500)
 *   User swaps: 0.1 ETH for ? tokens
 *   
 *   New x = 1 + 0.1 = 1.1
 *   k = 1 * 500 = 500 (unchanged)
 *   New y = k / x = 500 / 1.1 = 454.5 tokens
 *   User receives: 500 - 454.5 = 45.5 tokens
 *   (0.3% fee reduces this slightly)
 */
contract AMM {
    
    // ============ State Variables ============
    
    IERC20 public token;  // Reference to token contract
    
    // Reserves track how much of each asset is in the pool
    uint256 public tokenReserve;  // How many tokens the pool holds
    uint256 public ethReserve;    // How much ETH the pool holds
    
    // Track liquidity provider shares
    // When user adds 1 ETH of liquidity, we record 1 ETH in their name
    // This proves they own part of the pool
    mapping(address => uint256) public liquidity;
    
    uint256 public totalLiquidity;  // Sum of all LP shares
    
    // ============ Custom Errors (Gas Efficient) ============
    // Using custom errors instead of require() with strings saves ~200 gas
    error ZeroAmount();
    error InsufficientLiquidity();
    
    // ============ Constructor ============
    constructor(address _token) {
        token = IERC20(_token);
    }
    
    // ============ Core Functions ============

    /**
     * @dev Add liquidity to the pool
     * Liquidity providers deposit equal value of both assets
     * They receive LP tokens (stored as 'liquidity' balance)
     * They earn fees proportional to their share
     * 
     * Process:
     *   1. User has tokens + ETH
     *   2. User approves contract: token.approve(amm, amount)
     *   3. User calls: amm.addLiquidity{value: ethAmount}(tokenAmount)
     *   4. Contract receives tokens and ETH
     *   5. User's LP balance = ethAmount (their ownership stake)
     * 
     * Assumption: ETH:Token ratio should match market rate
     * (Otherwise arbitrageurs will immediately profit)
     * 
     * @param tokenAmount How many tokens to deposit
     */
    function addLiquidity(uint256 tokenAmount) external payable {
        // Validate inputs
        if (tokenAmount == 0 || msg.value == 0) revert ZeroAmount();
        
        // Pull tokens from user to contract
        // This only works if user has called approve() first
        token.transferFrom(msg.sender, address(this), tokenAmount);
        
        // Record user's ownership stake
        // User deposits 1 ETH → gets 1 unit of LP tokens
        // This means: if pool has 3 ETH total, user owns 1/3
        liquidity[msg.sender] += msg.value;
        totalLiquidity += msg.value;
        
        // Update pool reserves
        tokenReserve += tokenAmount;
        ethReserve += msg.value;
        
        // Note: No event emitted here (add for production)
        // Good practice: emit LiquidityAdded(msg.sender, tokenAmount, msg.value)
    }

    /**
     * @dev Swap ETH for tokens
     * User sends ETH, contract calculates how many tokens to send back
     * Price determined by constant product formula with 0.3% fee
     * 
     * Steps:
     *   1. Calculate token output using getAmountOut()
     *   2. Check we have enough tokens to send
     *   3. Update reserves
     *   4. Transfer tokens to user
     * 
     * Result:
     *   - ETH reserve increases
     *   - Token reserve decreases
     *   - Token price per ETH goes down (tokens cheaper now)
     *   - Liquidity providers earn 0.3% fee implicitly
     */
    function swapEthForToken() external payable {
        // Validate input
        if (msg.value == 0) revert ZeroAmount();
        
        // How many tokens does user get for their ETH?
        // Uses constant product: (x + input) * (y - output) = x * y
        uint256 tokenOut = getAmountOut(msg.value, ethReserve, tokenReserve);
        
        // Do we have enough tokens in reserve?
        if (tokenOut == 0) revert InsufficientLiquidity();
        
        // Update reserves
        // ETH comes from msg.value automatically (payable function)
        ethReserve += msg.value;
        tokenReserve -= tokenOut;
        
        // Transfer tokens to user
        token.transfer(msg.sender, tokenOut);
        
        // Implicit fee benefit:
        // The 0.3% fee (input * 997 instead of input * 1000) stays in the pool
        // This increases reserves, benefiting all LPs proportionally
    }

    /**
     * @dev Calculate output amount for a given input
     * This is the constant product formula with 0.3% fee
     * 
     * Formula:
     *   inputWithFee = input * 997  (deducts 0.3% fee)
     *   numerator = inputWithFee * outputReserve
     *   denominator = (inputReserve * 1000) + inputWithFee
     *   output = numerator / denominator
     * 
     * Why 997/1000?
     *   - 0.3% fee = 0.003 = 3/1000
     *   - Input with fee deducted = input * (1 - 0.003) = input * 997/1000
     * 
     * Example:
     *   input = 0.1 ETH
     *   inputReserve = 1 ETH
     *   outputReserve = 500 tokens
     *   
     *   inputWithFee = 0.1 * 997 = 99.7
     *   numerator = 99.7 * 500 = 49,850
     *   denominator = (1 * 1000) + 99.7 = 1,099.7
     *   output = 49,850 / 1,099.7 = 45.3 tokens
     * 
     * @param input Amount being swapped in
     * @param inputReserve Current reserve of input asset
     * @param outputReserve Current reserve of output asset
     * @return amount Amount of output asset to receive
     */
    function getAmountOut(
        uint256 input,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        // Step 1: Apply 0.3% fee
        // If input is 100, we keep 99.7 for the calculation
        uint256 inputWithFee = input * 997;
        
        // Step 2: Constant product formula
        // (x + inputWithFee) * (y - output) = x * y
        // Solve for output: output = y - (x * y) / (x + inputWithFee)
        // Simplified: output = (inputWithFee * y) / (x + inputWithFee)
        uint256 numerator = inputWithFee * outputReserve;
        uint256 denominator = (inputReserve * 1000) + inputWithFee;
        
        // Step 3: Integer division
        // Solidity rounds down (important for security)
        return numerator / denominator;
    }

    // ============ Receive ETH ============
    
    /**
     * @dev Allow contract to receive ETH without data
     * Needed for swaps to work with payable functions
     */
    receive() external payable {}
}
```

### AMM.sol Key Interview Points

**Q: What is 'payable'?**
A: Function can receive ETH. msg.value contains the ETH amount sent.

**Q: Why 997 instead of 1000?**
A: Deducts 0.3% fee. (1 - 0.003) = 0.997 = 997/1000

**Q: How does constant product protect the pool?**
A: Ensures product x*y stays ~constant. Can't drain pool, price rises with demand, arbitrage keeps price fair.

**Q: What if someone calls getAmountOut with huge input?**
A: Returns very small amount (price impact). Incentivizes smaller swaps and liquidity provision.

**Q: Why not use require for errors?**
A: Custom errors use 4 bytes, save ~200 gas per revert vs require with string.

---

## File: test/AMM.t.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";  // Foundry testing framework
import "../contracts/Token.sol";
import "../contracts/AMM.sol";

/**
 * Test Suite for AMM Contract
 * 
 * Foundry runs tests in this order:
 * 1. setUp() - run before each test
 * 2. testAddLiquidity() - test LP provision
 * 3. testSwap() - test token swaps
 * 
 * Each test is isolated with fresh contracts
 */
contract AMMTest is Test {
    
    // ============ State ============
    Token token;
    AMM amm;
    address user = address(1);  // Fake user address for testing
    
    // ============ Setup ============
    
    /**
     * @dev Runs before each test function
     * Sets up fresh contracts and test user with balances
     */
    function setUp() public {
        // Deploy fresh Token contract
        // Constructor parameter: 1 million tokens total supply
        token = new Token(1_000_000);
        
        // Deploy fresh AMM contract
        // Points to our deployed Token
        amm = new AMM(address(token));
        
        // Give test user tokens
        // Initially all tokens are owned by deployer (us)
        // We transfer 1000 tokens (1000 * 10^18 units) to user
        token.transfer(user, 1000 ether);
        
        // Give test user ETH for testing
        // vm.deal is Foundry magic - sets balance without a transaction
        vm.deal(user, 10 ether);
    }
    
    // ============ Tests ============

    /**
     * Test: User can add liquidity to the pool
     * 
     * Scenario:
     *   User has 1000 tokens and 10 ETH
     *   User wants to provide 500 tokens + 1 ETH as liquidity
     *   
     * Expected result:
     *   - Contract receives 500 tokens and 1 ETH
     *   - ethReserve increases to 1 ETH
     *   - User's liquidity balance = 1 ETH (ownership stake)
     */
    function testAddLiquidity() public {
        // Start simulating as 'user' (msg.sender = user)
        vm.startPrank(user);
        
        // Step 1: User approves AMM to spend 500 tokens
        // This gives AMM permission to call transferFrom
        token.approve(address(amm), 500 ether);
        
        // Step 2: User adds liquidity
        // {value: 1 ether} means send 1 ETH with the transaction
        // 500 ether = 500 * 10^18 tokens
        amm.addLiquidity{value: 1 ether}(500 ether);
        
        // Stop simulating as user
        vm.stopPrank();
        
        // Step 3: Verify the pool received ETH
        assertEq(amm.ethReserve(), 1 ether);
        // Could also check:
        // assertEq(amm.tokenReserve(), 500 ether);
        // assertEq(amm.liquidity(user), 1 ether);
    }

    /**
     * Test: User can swap ETH for tokens
     * 
     * Scenario:
     *   1. First, setup liquidity (500 tokens : 1 ETH)
     *   2. User swaps 0.1 ETH for tokens
     *   3. Should get ~45.3 tokens (with 0.3% fee considered)
     * 
     * This test just checks it doesn't revert
     * (Could add assertions for exact amounts)
     */
    function testSwap() public {
        // Simulate as user
        vm.startPrank(user);
        
        // First: Add liquidity to have something to swap against
        token.approve(address(amm), 500 ether);
        amm.addLiquidity{value: 1 ether}(500 ether);
        
        // Second: Perform a swap
        // User sends 0.1 ETH, expects to receive tokens
        amm.swapEthForToken{value: 0.1 ether}();
        
        // Test passes if no revert occurs
        // In production, you'd assert on output amount:
        // uint256 userTokens = token.balanceOf(user);
        // assertGt(userTokens, 40 ether);  // At least 40 tokens
        
        vm.stopPrank();
    }
    
    // Note: Could add more tests:
    // - testSwapMultipleTimes() - sequential swaps
    // - testSwapWithNoLiquidity() - edge case
    // - testPriceChange() - verify price rises with demand
    // - testLPFeeAccrual() - verify LPs earn fees
}
```

### Test.sol Key Interview Points

**Q: What is vm.startPrank?**
A: Sets msg.sender for all following calls. Makes testing user interactions easy.

**Q: Why setUp() runs before each test?**
A: Isolation. Each test gets fresh contracts, avoiding state pollution.

**Q: Why test both success and failure?**
A: Shows you understand requirements and edge cases (not just happy path).

**Q: What could testSwap check?**
A: Could assert user received approximately correct tokens, pool reserves updated, etc.

---

## File: test/SecurityTests.t.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/AMM.sol";

/**
 * Security Test Suite
 * 
 * Tests edge cases and failure scenarios
 * Shows you think about attacks and error handling
 */
contract SecurityTest is Test {
    
    AMM amm;
    
    function setUp() public {
        // Create AMM (with dummy token address, won't be used in these tests)
        amm = new AMM(address(0x123));
    }
    
    /**
     * Test: Swap with zero amount fails
     * 
     * Test function prefix "testFail" means:
     *   ✓ Test passes if function reverts (throws error)
     *   ✗ Test fails if function doesn't revert
     * 
     * This tests that AMM properly rejects zero-value swaps
     * Prevents: accidental empty transactions, spamming
     */
    function testFailZeroSwap() public {
        // Try to swap with 0 ETH
        amm.swapEthForToken{value: 0}();
        
        // Expected: revert ZeroAmount()
        // If this doesn't revert, test fails
    }
    
    // Could add more security tests:
    // testFailReentrancy() - guard against reentrancy attacks
    // testFailOverflow() - check large number handling  
    // testFailInsufficientLiquidity() - test with empty pool
    // testFailBadApproval() - test without proper approval
}
```

---

## File: scripts/Deploy.s.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/Token.sol";
import "../contracts/AMM.sol";

/**
 * Deployment Script
 * 
 * Foundry script that deploys contracts to a network
 * 
 * Usage:
 *   forge script scripts/Deploy.s.sol \
 *     --rpc-url SEPOLIA_RPC_URL \
 *     --private-key PRIVATE_KEY \
 *     --broadcast
 * 
 * Output: Deployment addresses + transaction hashes
 */
contract Deploy is Script {
    
    /**
     * @dev Main deployment function
     * vm.startBroadcast() tells Foundry: "following transactions are real"
     * Without it, transactions would just simulate
     */
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();
        
        // Deploy Token contract
        // Parameter: 1 million total supply
        Token token = new Token(1_000_000);
        
        // Deploy AMM contract
        // Depends on Token address
        AMM amm = new AMM(address(token));
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // In production, would:
        // - Log addresses for reference
        // - Verify contracts on Etherscan
        // - Update frontend config
        // - Test on testnet first
    }
}
```

---

## Summary Table

| File | Lines | Purpose | Key Concepts |
|------|-------|---------|--------------|
| Token.sol | ~50 | ERC20 token | approval, transfer, allowance |
| AMM.sol | ~70 | DEX contract | constant product, liquidity, swaps |
| AMM.t.sol | ~40 | Functional tests | setUp, assertions, state verification |
| SecurityTests.t.sol | ~15 | Edge cases | testFail prefix, error handling |
| Deploy.s.sol | ~20 | Deployment script | vm.startBroadcast, contract creation |

---

This complete walkthrough should help you understand every line and explain it in interviews!
