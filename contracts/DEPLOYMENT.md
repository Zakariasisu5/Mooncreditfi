# Smart Contract Deployment Guide for Remix IDE

## Overview
This guide will help you deploy the MoonFi smart contracts using Remix IDE.

## Contracts to Deploy
1. **CreditProfile.sol** - Manages on-chain credit scores and loan history
2. **LendingPool.sol** - Handles deposits, borrowing, and repayments

---

## Step-by-Step Deployment Instructions

### Step 1: Open Remix IDE
1. Go to https://remix.ethereum.org/
2. You'll see the Remix IDE interface

### Step 2: Create Contract Files

#### Create CreditProfile.sol
1. In the **File Explorer** (left sidebar), click on the **contracts** folder
2. Click the **Create New File** icon
3. Name it `CreditProfile.sol`
4. Copy the entire contents from `contracts/CreditProfile.sol` and paste it into Remix

#### Create LendingPool.sol
1. Create another new file named `LendingPool.sol`
2. Copy the entire contents from `contracts/LendingPool.sol` and paste it into Remix

### Step 3: Compile the Contracts

1. Click on the **Solidity Compiler** icon (left sidebar, second icon)
2. Select compiler version: **0.8.20** or higher (0.8.20+)
3. Click **Compile CreditProfile.sol**
4. You should see a green checkmark if compilation is successful
5. Click **Compile LendingPool.sol**
6. Verify both contracts compile without errors

### Step 4: Deploy CreditProfile Contract First

1. Click on the **Deploy & Run Transactions** icon (left sidebar, third icon)
2. Select **Environment**:
   - For testing: Choose **Remix VM (Shanghai)** or **Remix VM (London)**
   - For testnet: Choose **Injected Provider - MetaMask** (make sure MetaMask is connected)
   - For mainnet: ⚠️ **Be very careful!** Use **Injected Provider - MetaMask** on mainnet

3. In the **Contract** dropdown, select **CreditProfile**
4. Click **Deploy** (orange button)
5. **IMPORTANT:** Copy the deployed contract address from the **Deployed Contracts** section
   - It will look like: `0x123...abc`
   - Save this address - you'll need it for the next step!

### Step 5: Deploy LendingPool Contract

1. In the **Contract** dropdown, select **LendingPool**
2. You'll see a text field next to the **Deploy** button (for constructor parameters)
3. Paste the **CreditProfile contract address** you copied in Step 4
   - Format: `"0x123...abc"` (include the quotes)
4. Click **Deploy**
5. **IMPORTANT:** Copy the deployed **LendingPool** contract address
   - Save this address - you'll need it for frontend integration!

### Step 6: Verify Deployment

1. In the **Deployed Contracts** section, you should see both contracts listed
2. Expand **CreditProfile** contract and try calling:
   - `getScore` with your wallet address
   - Should return `500` (base credit score)
3. Expand **LendingPool** contract and try calling:
   - `getPoolStats`
   - Should return initial pool statistics

---

## Post-Deployment: Frontend Integration

After deploying, you need to update your frontend with the contract addresses.

### Update Contract Addresses

Edit `src/hooks/useContract.js` and replace the zero addresses:

```javascript
// Replace these with your deployed contract addresses
const LENDING_POOL_ADDRESS = 'YOUR_LENDING_POOL_ADDRESS_HERE';
const CREDIT_PROFILE_ADDRESS = 'YOUR_CREDIT_PROFILE_ADDRESS_HERE';
```

---

## Testing the Contracts in Remix

### Test CreditProfile

1. Call `initializeProfile` with a test address
2. Call `getScore` with the same address - should return 500
3. Call `recordLoan` with: address, amount (in wei), interest rate (500 = 5%)
4. Call `getLoanHistory` to see the recorded loan

### Test LendingPool

1. Call `deposit` with value: 1 ETH (1000000000000000000 wei)
2. Call `getLenderBalance` with your address - should show deposited amount
3. Try `borrow` with a small amount (0.1 ETH = 100000000000000000 wei)
4. Call `getBorrowerLoan` to see loan details
5. Call `repay` with the total owed amount to repay the loan

---

## Network Recommendations

### For Testing (Recommended for Initial Development)
- **Remix VM**: Free, instant, no real ETH needed
- Perfect for testing contract logic

### For Testnet Deployment
1. **Sepolia Testnet** (Recommended)
   - Get test ETH from: https://sepoliafaucet.com/
   - Network: Sepolia in MetaMask

2. **Mumbai (Polygon Testnet)**
   - Get test MATIC from: https://faucet.polygon.technology/
   - Lower gas fees

### For Mainnet (Production)
- **Ethereum Mainnet**: High gas fees, high security
- **Polygon Mainnet**: Low gas fees, good for DeFi
- **Arbitrum/Optimism**: Layer 2 solutions, lower fees

---

## Important Notes

⚠️ **Security Considerations:**
1. These contracts have NOT been audited
2. DO NOT deploy to mainnet with real funds without a professional audit
3. Test thoroughly on testnet first
4. Consider adding access control (Ownable) for production

⚠️ **Gas Optimization:**
1. Deployment will cost gas (testnet = free test ETH, mainnet = real ETH)
2. Each transaction costs gas
3. Consider batch operations for production

⚠️ **Frontend Integration:**
1. After deployment, update contract addresses in frontend
2. Make sure your frontend is connected to the same network
3. Update ABIs if you make any changes to contracts

---

## Troubleshooting

### Compilation Errors
- Make sure compiler version is 0.8.20 or higher
- Check for syntax errors
- Verify all imports are correct

### Deployment Failures
- Check you have enough ETH/MATIC for gas
- Verify constructor parameters are correct (LendingPool needs CreditProfile address)
- Make sure MetaMask is connected to correct network

### Transaction Failures
- Check you have enough balance for deposits/repayments
- Verify credit score requirements for borrowing
- Ensure loan limits are not exceeded

---

## Contract Addresses (Fill After Deployment)

```
Network: _______________

CreditProfile Address: 0x_______________________________________________

LendingPool Address: 0x_______________________________________________

Deployment Date: _______________

Deployer Address: 0x_______________________________________________
```

---

## Next Steps After Deployment

1. ✅ Save contract addresses
2. ✅ Update frontend configuration
3. ✅ Test all functions
4. ✅ Document any issues
5. ✅ Share addresses with frontend team
6. ✅ Consider getting contracts audited before mainnet

---

## Support & Resources

- Remix Documentation: https://remix-ide.readthedocs.io/
- Solidity Documentation: https://docs.soliditylang.org/
- Ethereum Gas Tracker: https://etherscan.io/gastracker
- Sepolia Faucet: https://sepoliafaucet.com/

Good luck with your deployment! 🚀
