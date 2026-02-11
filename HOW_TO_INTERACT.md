# How to Interact with Your Smart Contracts

## Your Deployed Contracts

- **CreditProfile**: `0x32228b52A411528F521412B4cEb1F0D21e84bDed`
- **LendingPool**: `0x6AFa3a9BDc76e7e2a88104cf24420e7Bc9F07728`
- **Network**: Creditcoin Testnet (Chain ID: 102031)

---

## Method 1: Through Your Frontend (Easy - For Users)

### Step 1: Setup MetaMask
1. Add Creditcoin Testnet to MetaMask:
   ```
   Network Name: Creditcoin Testnet
   RPC URL: https://rpc.cc3-testnet.creditcoin.network
   Chain ID: 102031
   Currency Symbol: CTC
   Block Explorer: https://creditcoin-testnet.blockscout.com
   ```

### Step 2: Get Test CTC
- Visit: https://faucet.creditcoin.org
- Connect wallet and request test tokens

### Step 3: Connect to Your App
1. Go to: http://localhost:8080
2. Click "Connect Wallet"
3. Select MetaMask
4. Approve connection

### Step 4: Use the Features

#### 🏦 Deposit (Lend)
1. Navigate to `/lend` page
2. Enter amount (e.g., 1 CTC)
3. Click "Deposit"
4. Approve transaction in MetaMask
5. Wait for confirmation
6. Your balance will update

**What happens on the blockchain:**
- Calls `LendingPool.deposit()` function
- Sends CTC to the contract
- Records your deposit timestamp
- Starts earning 8.5% APY

#### 💰 Borrow
1. Navigate to `/borrow` page
2. Check your credit score (default: 500 for new users)
3. See your max borrowing limit
4. Enter borrow amount
5. Click "Borrow"
6. Approve transaction
7. CTC will be sent to your wallet

**What happens on the blockchain:**
- Checks your credit score via `CreditProfile.getScore()`
- Verifies you can borrow via `CreditProfile.getMaxBorrowLimit()`
- Calls `LendingPool.borrow(amount)`
- Records loan in `CreditProfile.recordLoan()`
- Transfers CTC to your wallet

#### 💳 Repay Loan
1. On `/borrow` page, you'll see "Active Loan" card
2. Click "Repay Loan"
3. Transaction will pay principal + interest
4. Approve in MetaMask

**What happens on the blockchain:**
- Calculates interest owed
- Calls `LendingPool.repay()`
- Records repayment in `CreditProfile.recordRepayment()`
- Updates your credit score (increases if on-time)
- Loan marked as complete

#### 📊 Check Credit Score
1. Navigate to `/credit-profile` page
2. View your credit score
3. See loan history
4. Check borrowing limits

**What happens:**
- Reads from `CreditProfile.getScore()`
- Displays `CreditProfile.getProfile()`
- Shows `CreditProfile.getLoanHistory()`

---

## Method 2: Direct Contract Interaction via Remix (Advanced - For Testing)

### Step 1: Open Remix
1. Go to https://remix.ethereum.org
2. Make sure your contracts are still there

### Step 2: Connect to Deployed Contracts

#### Connect to CreditProfile
1. In "Deploy & Run Transactions" tab
2. Select "Injected Provider - MetaMask"
3. Make sure MetaMask is on Creditcoin Testnet
4. Under "Deployed Contracts", paste address: `0x32228b52A411528F521412B4cEb1F0D21e84bDed`
5. Click "At Address"
6. Contract will appear in deployed contracts list

#### Connect to LendingPool
1. Same steps as above
2. Paste address: `0x6AFa3a9BDc76e7e2a88104cf24420e7Bc9F07728`
3. Click "At Address"

### Step 3: Call Functions Directly

#### Read Functions (Free - No Gas)

**CreditProfile:**
```solidity
// Get your credit score
getScore(YOUR_WALLET_ADDRESS)
// Returns: 500 (for new users)

// Get your full profile
getProfile(YOUR_WALLET_ADDRESS)
// Returns: creditScore, totalLoans, repaidLoans, latePayments, totalBorrowed, totalRepaid

// Get loan history
getLoanHistory(YOUR_WALLET_ADDRESS)
// Returns: Array of all your loans

// Get max you can borrow
getMaxBorrowLimit(YOUR_WALLET_ADDRESS)
// Returns: Amount in Wei (e.g., 500000000000000000 = 0.5 CTC)

// Get loan count
getLoanCount(YOUR_WALLET_ADDRESS)
// Returns: Number of loans you've taken
```

**LendingPool:**
```solidity
// Get pool statistics
getPoolStats()
// Returns: totalDeposited, totalBorrowed, availableLiquidity, utilizationRate, currentAPY

// Get your lender balance
getLenderBalance(YOUR_WALLET_ADDRESS)
// Returns: Your deposited amount + yield earned

// Get your active loan
getBorrowerLoan(YOUR_WALLET_ADDRESS)
// Returns: amount, interestRate, isActive, totalOwed

// Get yield earned
getYieldEarned(YOUR_WALLET_ADDRESS)
// Returns: Yield you've earned

// Get available liquidity
getAvailableLiquidity()
// Returns: How much CTC is available to borrow

// Get utilization rate
getUtilizationRate()
// Returns: Percentage of pool being used
```

#### Write Functions (Requires Gas)

**Deposit CTC:**
1. Expand LendingPool contract
2. Find `deposit` function
3. Enter VALUE: amount in Wei (e.g., 1000000000000000000 = 1 CTC)
4. Click "transact"
5. Approve in MetaMask

**Borrow CTC:**
1. Find `borrow` function
2. Enter amount in Wei (e.g., 100000000000000000 = 0.1 CTC)
3. Click "transact"
4. Approve in MetaMask

**Repay Loan:**
1. First, call `getBorrowerLoan` to see how much you owe
2. Find `repay` function
3. Enter VALUE: totalOwed amount (in Wei)
4. Click "transact"
5. Approve in MetaMask

**Withdraw:**
1. Find `withdraw` function
2. Enter amount in Wei to withdraw
3. Click "transact"
4. Approve in MetaMask

---

## Method 3: Using Ethers.js in Browser Console (Advanced)

### Step 1: Open Browser Console
1. Go to your app: http://localhost:8080
2. Press F12 or Right-click → Inspect
3. Go to "Console" tab

### Step 2: Connect to Contracts

```javascript
// Get ethers from window (wagmi provides this)
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Contract addresses
const CREDIT_PROFILE_ADDRESS = '0x32228b52A411528F521412B4cEb1F0D21e84bDed';
const LENDING_POOL_ADDRESS = '0x6AFa3a9BDc76e7e2a88104cf24420e7Bc9F07728';

// ABIs (simplified)
const creditProfileABI = [
  'function getScore(address user) external view returns (uint256)',
  'function getProfile(address user) external view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
  'function getLoanHistory(address user) external view returns (tuple(uint256 amount, uint256 timestamp, uint256 interestRate, bool repaid, bool onTime)[])'
];

const lendingPoolABI = [
  'function deposit() external payable',
  'function withdraw(uint256 amount) external',
  'function borrow(uint256 amount) external',
  'function repay() external payable',
  'function getLenderBalance(address lender) external view returns (uint256)',
  'function getBorrowerLoan(address borrower) external view returns (uint256, uint256, bool, uint256)',
  'function getPoolStats() external view returns (uint256, uint256, uint256, uint256, uint256)'
];

// Create contract instances
const creditProfile = new ethers.Contract(CREDIT_PROFILE_ADDRESS, creditProfileABI, signer);
const lendingPool = new ethers.Contract(LENDING_POOL_ADDRESS, lendingPoolABI, signer);
```

### Step 3: Call Functions

```javascript
// Get your wallet address
const address = await signer.getAddress();

// Get credit score
const score = await creditProfile.getScore(address);
console.log('Credit Score:', score.toString());

// Get pool stats
const stats = await lendingPool.getPoolStats();
console.log('Pool Stats:', {
  totalDeposited: ethers.utils.formatEther(stats[0]),
  totalBorrowed: ethers.utils.formatEther(stats[1]),
  availableLiquidity: ethers.utils.formatEther(stats[2]),
  utilizationRate: stats[3].toString() + '%',
  currentAPY: (stats[4].toNumber() / 100) + '%'
});

// Deposit 1 CTC
const depositTx = await lendingPool.deposit({
  value: ethers.utils.parseEther('1.0')
});
await depositTx.wait();
console.log('Deposited 1 CTC');

// Borrow 0.5 CTC
const borrowTx = await lendingPool.borrow(
  ethers.utils.parseEther('0.5')
);
await borrowTx.wait();
console.log('Borrowed 0.5 CTC');

// Get loan details
const loan = await lendingPool.getBorrowerLoan(address);
console.log('Your Loan:', {
  amount: ethers.utils.formatEther(loan[0]),
  interestRate: (loan[1].toNumber() / 100) + '%',
  isActive: loan[2],
  totalOwed: ethers.utils.formatEther(loan[3])
});

// Repay loan
const repayTx = await lendingPool.repay({
  value: loan[3] // Pay total owed
});
await repayTx.wait();
console.log('Loan repaid');

// Check new credit score
const newScore = await creditProfile.getScore(address);
console.log('New Credit Score:', newScore.toString());
```

---

## Method 4: View on Block Explorer

### Check Contract State
1. Go to: https://creditcoin-testnet.blockscout.com
2. Search for your contract addresses:
   - CreditProfile: `0x32228b52A411528F521412B4cEb1F0D21e84bDed`
   - LendingPool: `0x6AFa3a9BDc76e7e2a88104cf24420e7Bc9F07728`

### View Transactions
- See all deposits, borrows, repayments
- Check transaction status
- View gas fees
- See contract events

---

## Testing Flow (Complete Example)

### 1. First Time User Journey

```
Step 1: Get test CTC from faucet
Step 2: Connect wallet to app
Step 3: Check credit score → Should be 500 (base score)
Step 4: Go to Lend page → Deposit 2 CTC
Step 5: Go to Borrow page → Borrow 0.5 CTC (max for score 500)
Step 6: Wait a few minutes (simulate time)
Step 7: Repay loan (0.5 CTC + interest)
Step 8: Check credit score → Should increase to ~640-680
Step 9: Now you can borrow up to 1 CTC (higher limit)
Step 10: Borrow again with better interest rate
```

### 2. Lender Journey

```
Step 1: Deposit 5 CTC into lending pool
Step 2: Wait (yield accumulates at 8.5% APY)
Step 3: Check "Yield Earned" on dashboard
Step 4: Withdraw funds + yield anytime
```

### 3. Credit Building Journey

```
Loan 1 (on-time repayment) → Score increases to ~640
Loan 2 (on-time repayment) → Score increases to ~700
Loan 3 (on-time repayment) → Score increases to ~750+
Higher score = Lower interest rates + Higher borrowing limits
```

---

## Common Issues & Solutions

### Transaction Fails
- **Issue**: "Insufficient funds"
- **Solution**: Get more test CTC from faucet

### Can't Borrow
- **Issue**: "Credit score too low"
- **Solution**: Score must be at least 500

### Exceeds Limit
- **Issue**: "Exceeds borrowing limit"
- **Solution**: Check max limit with `getMaxBorrowLimit()`, borrow less

### Pool Utilization
- **Issue**: "Pool utilization too high"
- **Solution**: Wait for others to repay, or deposit more as lender

---

## Smart Contract Addresses (Save These!)

```
Network: Creditcoin Testnet
Chain ID: 102031
RPC: https://rpc.cc3-testnet.creditcoin.network

CreditProfile: 0x32228b52A411528F521412B4cEb1F0D21e84bDed
LendingPool: 0x6AFa3a9BDc76e7e2a88104cf24420e7Bc9F07728

Block Explorer:
https://creditcoin-testnet.blockscout.com/address/0x32228b52A411528F521412B4cEb1F0D21e84bDed
https://creditcoin-testnet.blockscout.com/address/0x6AFa3a9BDc76e7e2a88104cf24420e7Bc9F07728
```

---

## Quick Reference: Wei Conversion

```
0.01 CTC = 10000000000000000 Wei
0.1 CTC  = 100000000000000000 Wei
0.5 CTC  = 500000000000000000 Wei
1 CTC    = 1000000000000000000 Wei
10 CTC   = 10000000000000000000 Wei
```

Use online converter: https://eth-converter.com/

---

Happy testing! 🚀
