# Frontend Integration Guide

After deploying your smart contracts on Remix, follow these steps to integrate them with your frontend.

## Step 1: Update Contract Addresses

Edit `src/hooks/useContract.js` and replace the contract addresses:

```javascript
// Line 7-8 in useContract.js
const LENDING_POOL_ADDRESS = 'YOUR_DEPLOYED_LENDING_POOL_ADDRESS';
const CREDIT_PROFILE_ADDRESS = 'YOUR_DEPLOYED_CREDIT_PROFILE_ADDRESS';
```

**Example:**
```javascript
const LENDING_POOL_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CREDIT_PROFILE_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
```

## Step 2: Verify Network Configuration

Make sure your wallet (MetaMask) and frontend are connected to the same network where you deployed the contracts.

Edit `src/config/wagmi.js` to ensure the correct chains are configured.

## Step 3: Test Contract Integration

### Test Lend Page Functions

1. Navigate to `/lend` page
2. Connect your wallet
3. Try depositing ETH
4. Check your balance updates
5. Try withdrawing

### Test Borrow Page Functions

1. Navigate to `/borrow` page
2. Try borrowing (will check credit score)
3. Repay the loan
4. Check credit score updates

### Test Credit Profile Page

1. Navigate to `/credit-profile` page
2. View your credit score
3. Check loan history

## Step 4: Update Frontend Code to Use Real Contracts

Currently, the frontend pages use mock data. You'll need to update them to use real contract calls.

### Update Lend.jsx

Replace mock transaction code in `src/pages/Lend.jsx`:

**Current (lines 49-54):**
```javascript
// Mock transaction - replace with actual contract call
await new Promise(resolve => setTimeout(resolve, 2000));

toast.success(`Successfully deposited ${depositAmount} ETH`);
```

**Updated:**
```javascript
// Real contract call
const tx = await lendingPool.deposit({
  value: parseEther(depositAmount)
});
await tx.wait();

toast.success(`Successfully deposited ${depositAmount} ETH`);
```

### Update Borrow.jsx

Replace mock transaction code in `src/pages/Borrow.jsx`:

**For borrowing (lines 62-67):**
```javascript
// Real contract call
const amountInWei = parseEther(borrowAmount);
const tx = await lendingPool.borrow(amountInWei);
await tx.wait();

toast.success(`Successfully borrowed ${borrowAmount} ETH`);
```

**For repaying (lines 88-92):**
```javascript
// Get total owed first
const [, , , totalOwed] = await lendingPool.getBorrowerLoan(account);

// Repay with the owed amount
const tx = await lendingPool.repay({ value: totalOwed });
await tx.wait();

toast.success('Successfully repaid loan');
```

### Update CreditProfile.jsx

Replace mock data loading in `src/pages/CreditProfile.jsx`:

```javascript
import { useEffect, useState } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';

const CreditProfile = () => {
  const { account } = useWalletContext();
  const { creditProfile } = useContract();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (account && creditProfile) {
      loadProfileData();
    }
  }, [account, creditProfile]);

  const loadProfileData = async () => {
    try {
      // Get profile data from contract
      const [creditScore, totalLoans, repaidLoans, latePayments, totalBorrowed, totalRepaid] =
        await creditProfile.getProfile(account);

      // Get loan history
      const loans = await creditProfile.getLoanHistory(account);

      setProfileData({
        creditScore: Number(creditScore),
        totalLoans: Number(totalLoans),
        repaidLoans: Number(repaidLoans),
        latePayments: Number(latePayments),
        totalBorrowed: formatEther(totalBorrowed),
        totalRepaid: formatEther(totalRepaid),
        loans: loans.map(loan => ({
          amount: formatEther(loan.amount),
          timestamp: new Date(Number(loan.timestamp) * 1000),
          interestRate: Number(loan.interestRate) / 100,
          repaid: loan.repaid,
          onTime: loan.onTime
        }))
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Use profileData in your component...
};
```

## Step 5: Add Helper Functions

Add these helper functions to work with Wei/Ether conversions:

```javascript
import { parseEther, formatEther } from 'viem';

// Convert ETH to Wei
const amountInWei = parseEther('1.5'); // '1500000000000000000'

// Convert Wei to ETH
const amountInEth = formatEther('1500000000000000000'); // '1.5'
```

## Step 6: Handle Transaction Errors

Add proper error handling:

```javascript
try {
  const tx = await lendingPool.deposit({ value: parseEther(depositAmount) });
  await tx.wait();
  toast.success('Deposit successful!');
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    toast.error('Transaction rejected by user');
  } else if (error.message.includes('insufficient funds')) {
    toast.error('Insufficient funds for transaction');
  } else {
    toast.error('Transaction failed: ' + error.message);
  }
}
```

## Step 7: Listen to Contract Events

Add event listeners for real-time updates:

```javascript
useEffect(() => {
  if (lendingPool && account) {
    // Listen for deposit events
    lendingPool.on('Deposited', (lender, amount) => {
      if (lender.toLowerCase() === account.toLowerCase()) {
        toast.success(`Deposited ${formatEther(amount)} ETH`);
        loadLenderData(); // Refresh data
      }
    });

    // Listen for borrow events
    lendingPool.on('Borrowed', (borrower, amount, interestRate) => {
      if (borrower.toLowerCase() === account.toLowerCase()) {
        toast.success(`Borrowed ${formatEther(amount)} ETH`);
        loadBorrowerData(); // Refresh data
      }
    });

    // Cleanup
    return () => {
      lendingPool.removeAllListeners();
    };
  }
}, [lendingPool, account]);
```

## Step 8: Test Everything

1. ✅ Deploy contracts on Remix
2. ✅ Update contract addresses in frontend
3. ✅ Replace mock data with real contract calls
4. ✅ Test deposit function
5. ✅ Test withdraw function
6. ✅ Test borrow function
7. ✅ Test repay function
8. ✅ Test credit score updates
9. ✅ Verify loan history displays correctly
10. ✅ Check event listeners work

## Common Issues & Solutions

### Issue: "Contract not deployed to network"
**Solution:** Make sure your MetaMask is connected to the same network where you deployed the contracts.

### Issue: "User rejected transaction"
**Solution:** This is normal - user cancelled in MetaMask. Handle gracefully with error message.

### Issue: "Insufficient funds"
**Solution:** Make sure you have enough ETH for the transaction + gas fees.

### Issue: "Execution reverted"
**Solution:** Check contract requirements (e.g., credit score too low, borrowing limit exceeded).

### Issue: Contract address shows as 0x000...
**Solution:** Update the addresses in `src/hooks/useContract.js` with your deployed addresses.

## Additional Resources

- [Viem Documentation](https://viem.sh/) - For contract interactions
- [Wagmi Documentation](https://wagmi.sh/) - For wallet connections
- [Ethers.js Documentation](https://docs.ethers.org/) - Alternative library
- [Remix Documentation](https://remix-ide.readthedocs.io/) - For contract deployment

## Need Help?

If you encounter issues:
1. Check browser console for error messages
2. Verify contract addresses are correct
3. Ensure wallet is connected to correct network
4. Check transaction on block explorer (Etherscan, etc.)
5. Verify contract has enough liquidity for operations
