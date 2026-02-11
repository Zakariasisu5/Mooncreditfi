import { useWriteContract, usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import { useMemo } from 'react';

// Deployed on Creditcoin Testnet
export const LENDING_POOL_ADDRESS = '0x6AFa3a9BDc76e7e2a88104cf24420e7Bc9F07728';
export const CREDIT_PROFILE_ADDRESS = '0x32228b52A411528F521412B4cEb1F0D21e84bDed';
export const DEPIN_FINANCE_ADDRESS = '0x406100C8BF3886DBcDE94c642d4a8530042A44C9';

// LendingPool ABI - matches LendingPool_V2.sol
export const LENDING_POOL_ABI = [
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "lender", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Deposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "lender", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "yield", "type": "uint256" }
    ],
    "name": "Withdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "borrower", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "interestRate", "type": "uint256" }
    ],
    "name": "Borrowed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "borrower", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "principal", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "interest", "type": "uint256" }
    ],
    "name": "Repaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "lender", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "YieldClaimed",
    "type": "event"
  },
  // Write functions
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "borrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "repay",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimYield",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Read functions
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "lenders",
    "outputs": [
      { "internalType": "uint256", "name": "depositedAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "depositTimestamp", "type": "uint256" },
      { "internalType": "uint256", "name": "lastYieldClaim", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "borrowers",
    "outputs": [
      { "internalType": "uint256", "name": "borrowedAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "borrowTimestamp", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
      { "internalType": "uint256", "name": "creditProfileLoanIndex", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }],
    "name": "getLenderBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "borrower", "type": "address" }],
    "name": "getBorrowerLoan",
    "outputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "uint256", "name": "totalOwed", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }],
    "name": "getYieldEarned",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }],
    "name": "calculateYieldEarned",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPoolStats",
    "outputs": [
      { "internalType": "uint256", "name": "_totalDeposited", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalBorrowed", "type": "uint256" },
      { "internalType": "uint256", "name": "_availableLiquidity", "type": "uint256" },
      { "internalType": "uint256", "name": "_utilizationRate", "type": "uint256" },
      { "internalType": "uint256", "name": "_currentAPY", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAvailableLiquidity",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getUtilizationRate",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDeposited",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBorrowed",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalYieldPaid",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "creditScore", "type": "uint256" },
      { "internalType": "uint256", "name": "utilization", "type": "uint256" }
    ],
    "name": "calculateInterestRate",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "principal", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
      { "internalType": "uint256", "name": "duration", "type": "uint256" }
    ],
    "name": "calculateInterest",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "BASE_LENDING_APY",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_BORROW_RATE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_BORROW_RATE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "creditProfile",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Receive function
  { "stateMutability": "payable", "type": "receive" }
];

// CreditProfile ABI - matches CreditProfile.sol
export const CREDIT_PROFILE_ABI = [
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "newScore", "type": "uint256" }
    ],
    "name": "CreditScoreUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "interestRate", "type": "uint256" }
    ],
    "name": "LoanRecorded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "loanIndex", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "onTime", "type": "bool" }
    ],
    "name": "RepaymentRecorded",
    "type": "event"
  },
  // Read functions
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getScore",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getProfile",
    "outputs": [
      { "internalType": "uint256", "name": "creditScore", "type": "uint256" },
      { "internalType": "uint256", "name": "totalLoans", "type": "uint256" },
      { "internalType": "uint256", "name": "repaidLoans", "type": "uint256" },
      { "internalType": "uint256", "name": "latePayments", "type": "uint256" },
      { "internalType": "uint256", "name": "totalBorrowed", "type": "uint256" },
      { "internalType": "uint256", "name": "totalRepaid", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getLoanHistory",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
          { "internalType": "bool", "name": "repaid", "type": "bool" },
          { "internalType": "bool", "name": "onTime", "type": "bool" }
        ],
        "internalType": "struct CreditProfile.Loan[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "loanIndex", "type": "uint256" }
    ],
    "name": "getLoan",
    "outputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
      { "internalType": "bool", "name": "repaid", "type": "bool" },
      { "internalType": "bool", "name": "onTime", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getLoanCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getMaxBorrowLimit",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "calculateCreditScore",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "profiles",
    "outputs": [
      { "internalType": "uint256", "name": "creditScore", "type": "uint256" },
      { "internalType": "uint256", "name": "totalLoans", "type": "uint256" },
      { "internalType": "uint256", "name": "repaidLoans", "type": "uint256" },
      { "internalType": "uint256", "name": "latePayments", "type": "uint256" },
      { "internalType": "uint256", "name": "totalBorrowed", "type": "uint256" },
      { "internalType": "uint256", "name": "totalRepaid", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "loanHistory",
    "outputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRate", "type": "uint256" },
      { "internalType": "bool", "name": "repaid", "type": "bool" },
      { "internalType": "bool", "name": "onTime", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Write functions
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "initializeProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRate", "type": "uint256" }
    ],
    "name": "recordLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "loanIndex", "type": "uint256" },
      { "internalType": "bool", "name": "onTime", "type": "bool" }
    ],
    "name": "recordRepayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// DePIN Finance ABI
export const DEPIN_FINANCE_ABI = [
  {
    "inputs": [],
    "name": "claimYield",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "distributeYield",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "address payable", "name": "recipient", "type": "address" }
    ],
    "name": "fundInfrastructure",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "contributor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Contributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "InfrastructureFunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "NFTMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "contributor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "YieldClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "YieldDistributed",
    "type": "event"
  },
  { "stateMutability": "payable", "type": "receive" },
  {
    "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "contributors",
    "outputs": [
      { "internalType": "uint256", "name": "shares", "type": "uint256" },
      { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cumulativeYieldPerShare",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getContributor",
    "outputs": [
      { "internalType": "uint256", "name": "shares", "type": "uint256" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "pendingYieldAmount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPoolStats",
    "outputs": [
      { "internalType": "uint256", "name": "_totalShares", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalContributions", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalYieldsDistributed", "type": "uint256" },
      { "internalType": "uint256", "name": "_availableBalance", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_contributor", "type": "address" }],
    "name": "pendingYield",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalContributions",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalShares",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalYieldsDistributed",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

/**
 * Hook to interact with deployed contracts
 * Provides both read and write capabilities
 */
export const useContract = () => {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Create contract instances for reading
  const lendingPool = useMemo(() => {
    if (!publicClient) return null;
    return getContract({
      address: LENDING_POOL_ADDRESS,
      abi: LENDING_POOL_ABI,
      client: { public: publicClient, wallet: walletClient },
    });
  }, [publicClient, walletClient]);

  const creditProfile = useMemo(() => {
    if (!publicClient) return null;
    return getContract({
      address: CREDIT_PROFILE_ADDRESS,
      abi: CREDIT_PROFILE_ABI,
      client: { public: publicClient, wallet: walletClient },
    });
  }, [publicClient, walletClient]);

  const depinFinance = useMemo(() => {
    if (!publicClient) return null;
    return getContract({
      address: DEPIN_FINANCE_ADDRESS,
      abi: DEPIN_FINANCE_ABI,
      client: { public: publicClient, wallet: walletClient },
    });
  }, [publicClient, walletClient]);

  return {
    // Write contract function
    writeContractAsync,
    
    // Contract instances with read/write
    lendingPool,
    creditProfile,
    depinFinance,
    
    // Addresses
    LENDING_POOL_ADDRESS,
    CREDIT_PROFILE_ADDRESS,
    DEPIN_FINANCE_ADDRESS,
    
    // ABIs
    LENDING_POOL_ABI,
    CREDIT_PROFILE_ABI,
    DEPIN_FINANCE_ABI,
  };
};
