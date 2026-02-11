# MoonFi Testing Guide - Creditcoin Testnet

## ✅ Deployment Complete!

Your smart contracts are deployed on Creditcoin Testnet:

- **CreditProfile**: `0x32228b52A411528F521412B4cEb1F0D21e84bDed`
- **LendingPool**: `0x6AFa3a9BDc76e7e2a88104cf24420e7Bc9F07728`
- **Network**: Creditcoin Testnet (Chain ID: 102031)
- **RPC URL**: https://rpc.cc3-testnet.creditcoin.network

---

## 🚀 How to Test Your DApp

### Step 1: Add Creditcoin Testnet to MetaMask

1. Open MetaMask
2. Click on the network dropdown (top)
3. Click "Add Network" → "Add a network manually"
4. Enter these details:

```
Network Name: Creditcoin Testnet
RPC URL: https://rpc.cc3-testnet.creditcoin.network
Chain ID: 102031
Currency Symbol: CTC
Block Explorer: https://creditcoin-testnet.blockscout.com
```

5. Click "Save"

### Step 2: Get Test CTC Tokens

You need test CTC tokens to interact with the contracts. Get them from the Creditcoin faucet:

🔗 **Creditcoin Faucet**: https://faucet.creditcoin.org/

1. Connect your wallet
2. Request test CTC tokens
3. Wait for confirmation

### Step 3: Start Your Frontend

```bash
npm run dev
```

### Step 4: Connect Your Wallet

1. Open your app in browser (usually http://localhost:5173)
2. Click "Connect Wallet"
3. Select MetaMask
4. **Make sure you're on Creditcoin Testnet** in MetaMask
5. Approve the connection

---

## 🧪 Test Scenarios

### Test 1: Check Credit Score

1. Navigate to `/credit-profile` page
2. You should see base credit score: **500**
3. No loan history yet

### Test 2: Lend (Deposit)

1. Navigate to `/lend` page
2. Enter amount: `0.1` CTC
3. Click "Deposit"
4. Approve transaction in MetaMask
5. Wait for confirmation
6. Your balance should update
7. Yield should start accumulating

### Test 3: Borrow

1. Navigate to `/borrow` page
2. Your credit score should show: **500**
3. Max borrowing limit should be: **0.5 CTC** (for score 500)
4. Try borrowing: `0.1` CTC
5. Click "Borrow"
6. Approve transaction
7. Check your wallet - you should receive the borrowed CTC
8. Active loan should appear

### Test 4: Repay Loan

1. Still on `/borrow` page
2. View your active loan details
3. Click "Repay Loan"
4. Approve transaction (will repay principal + interest)
5. Loan should be marked as repaid
6. Credit score should **increase** (on-time repayment)
7. Check `/credit-profile` - loan history updated

### Test 5: Credit Score Improvement

After repaying your first loan:
1. Check new credit score (should be higher than 500)
2. Max borrowing limit should increase
3. Interest rate should decrease (better credit = lower rate)
4. Borrow again with better terms!

---

## 📊 Expected Behavior

### Credit Scores:
- **New user**: 500 (base score)
- **After 1 on-time repayment**: ~640-680
- **After 3 on-time repayments**: ~700-750
- **After 5+ on-time repayments**: ~750-850

### Interest Rates (APR):
- **Credit Score 750+**: 5%
- **Credit Score 700-749**: 6%
- **Credit Score 650-699**: 7.5%
- **Credit Score 600-649**: 9%
- **Credit Score 550-599**: 10.5%
- **Credit Score <550**: 12%

### Lending APY:
- **Fixed**: 8.5% for all lenders

### Borrowing Limits:
- **Score 750+**: 10 CTC
- **Score 700-749**: 5 CTC
- **Score 650-699**: 3 CTC
- **Score 600-649**: 2 CTC
- **Score 550-599**: 1 CTC
- **Score <550**: 0.5 CTC

---

## 🐛 Troubleshooting

### "Transaction Failed"
- Check you have enough CTC for gas fees
- Make sure you're on Creditcoin Testnet
- Try increasing gas limit in MetaMask

### "Insufficient pool liquidity"
- Pool needs lenders first
- Try depositing before borrowing

### "Credit score too low"
- Minimum score required: 500
- Build credit by repaying loans on time

### "Exceeds borrowing limit"
- Check your credit score
- Max borrow based on score
- Try borrowing a smaller amount

### Contract not found
- Verify you're on Creditcoin Testnet (Chain ID: 102031)
- Check contract addresses in browser console
- Refresh the page

### Wallet won't connect
- Make sure MetaMask is installed
- Add Creditcoin Testnet to MetaMask first
- Try refreshing the page

---

## 📝 Smart Contract Functions You Can Test

### In Remix (Direct Contract Calls):

#### CreditProfile Contract
```solidity
// View your score
getScore(YOUR_ADDRESS)

// View your profile
getProfile(YOUR_ADDRESS)

// View loan history
getLoanHistory(YOUR_ADDRESS)

// Check max borrow limit
getMaxBorrowLimit(YOUR_ADDRESS)
```

#### LendingPool Contract
```solidity
// View pool stats
getPoolStats()

// View your lender balance
getLenderBalance(YOUR_ADDRESS)

// View your active loan
getBorrowerLoan(YOUR_ADDRESS)

// Check available liquidity
getAvailableLiquidity()

// Check pool utilization
getUtilizationRate()
```

---

## 🎯 Success Criteria

Your integration is working if:

✅ Wallet connects to Creditcoin Testnet
✅ Can deposit CTC into lending pool
✅ Balance updates after deposit
✅ Can borrow based on credit score
✅ Active loan shows correct details
✅ Can repay loan with interest
✅ Credit score increases after repayment
✅ Loan history displays correctly
✅ Yield accumulates for lenders
✅ Can withdraw deposited funds

---

## 🔗 Useful Links

- **Block Explorer**: https://creditcoin-testnet.blockscout.com
- **Your CreditProfile**: https://creditcoin-testnet.blockscout.com/address/0x32228b52A411528F521412B4cEb1F0D21e84bDed
- **Your LendingPool**: https://creditcoin-testnet.blockscout.com/address/0x6AFa3a9BDc76e7e2a88104cf24420e7Bc9F07728
- **Creditcoin Faucet**: https://faucet.creditcoin.org
- **Creditcoin Docs**: https://docs.creditcoin.org

---

## 🎉 Next Steps

1. Test all functionality
2. Fix any UI bugs you find
3. Add loading states
4. Improve error messages
5. Add transaction history
6. Deploy frontend to production
7. Get contracts audited before mainnet
8. Add more features (liquidations, etc.)

Good luck! 🚀
