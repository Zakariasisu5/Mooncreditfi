// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICreditProfile {
    function getScore(address user) external view returns (uint256);
    function recordLoan(address user, uint256 amount, uint256 interestRate) external;
    function recordRepayment(address user, uint256 loanIndex, bool onTime) external;
    function getLoanCount(address user) external view returns (uint256);
    function getMaxBorrowLimit(address user) external view returns (uint256);
}

/**
 * @title LendingPool V2
 * @dev Decentralized lending pool with credit-score-based borrowing
 * @dev This version allows setting CreditProfile after deployment
 */
contract LendingPool {

    ICreditProfile public creditProfile;
    address public owner;

    struct LenderInfo {
        uint256 depositedAmount;
        uint256 depositTimestamp;
        uint256 lastYieldClaim;
    }

    struct BorrowerInfo {
        uint256 borrowedAmount;
        uint256 borrowTimestamp;
        uint256 interestRate;
        uint256 creditProfileLoanIndex;
        bool isActive;
    }

    // Lender information
    mapping(address => LenderInfo) public lenders;

    // Borrower information
    mapping(address => BorrowerInfo) public borrowers;

    // Pool statistics
    uint256 public totalDeposited;
    uint256 public totalBorrowed;
    uint256 public totalYieldPaid;

    // Interest rate parameters (in basis points, 1% = 100)
    uint256 public constant BASE_LENDING_APY = 850; // 8.5%
    uint256 public constant MIN_BORROW_RATE = 500; // 5%
    uint256 public constant MAX_BORROW_RATE = 1200; // 12%

    // Pool parameters
    uint256 public constant MIN_DEPOSIT = 0.01 ether;
    uint256 public constant UTILIZATION_CAP = 80; // 80% max utilization
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    // Events
    event Deposited(address indexed lender, uint256 amount);
    event Withdrawn(address indexed lender, uint256 amount, uint256 yield);
    event Borrowed(address indexed borrower, uint256 amount, uint256 interestRate);
    event Repaid(address indexed borrower, uint256 principal, uint256 interest);
    event YieldClaimed(address indexed lender, uint256 amount);
    event CreditProfileSet(address creditProfileAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Set the CreditProfile contract address (can only be called once by owner)
     */
    function setCreditProfile(address _creditProfileAddress) external onlyOwner {
        require(_creditProfileAddress != address(0), "Invalid address");
        require(address(creditProfile) == address(0), "CreditProfile already set");
        creditProfile = ICreditProfile(_creditProfileAddress);
        emit CreditProfileSet(_creditProfileAddress);
    }

    /**
     * @dev Deposit ETH into the lending pool
     */
    function deposit() external payable {
        require(msg.value >= MIN_DEPOSIT, "Deposit amount too low");

        LenderInfo storage lender = lenders[msg.sender];

        // Claim any pending yield before updating deposit
        if (lender.depositedAmount > 0) {
            _claimYield(msg.sender);
        }

        lender.depositedAmount += msg.value;
        lender.depositTimestamp = block.timestamp;
        lender.lastYieldClaim = block.timestamp;

        totalDeposited += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw deposited amount plus earned yield
     */
    function withdraw(uint256 amount) external {
        LenderInfo storage lender = lenders[msg.sender];
        require(lender.depositedAmount >= amount, "Insufficient balance");
        require(getAvailableLiquidity() >= amount, "Insufficient pool liquidity");

        // Claim yield first
        uint256 yieldEarned = _claimYield(msg.sender);

        lender.depositedAmount -= amount;
        totalDeposited -= amount;

        uint256 totalWithdraw = amount + yieldEarned;

        (bool success, ) = msg.sender.call{value: totalWithdraw}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount, yieldEarned);
    }

    /**
     * @dev Borrow ETH from the pool (credit score gated)
     */
    function borrow(uint256 amount) external {
        require(address(creditProfile) != address(0), "CreditProfile not set");
        require(amount > 0, "Amount must be greater than 0");
        require(!borrowers[msg.sender].isActive, "Active loan exists");

        // Check credit score and borrowing limit
        uint256 creditScore = creditProfile.getScore(msg.sender);
        require(creditScore >= 500, "Credit score too low");

        uint256 maxBorrowLimit = creditProfile.getMaxBorrowLimit(msg.sender);
        require(amount <= maxBorrowLimit, "Exceeds borrowing limit");

        // Check pool has enough liquidity
        uint256 availableLiquidity = getAvailableLiquidity();
        require(amount <= availableLiquidity, "Insufficient pool liquidity");

        // Check utilization rate doesn't exceed cap
        uint256 newUtilization = ((totalBorrowed + amount) * 100) / totalDeposited;
        require(newUtilization <= UTILIZATION_CAP, "Pool utilization too high");

        // Calculate interest rate based on credit score and utilization
        uint256 interestRate = calculateInterestRate(creditScore, newUtilization);

        // Record loan in credit profile
        uint256 loanIndex = creditProfile.getLoanCount(msg.sender);
        creditProfile.recordLoan(msg.sender, amount, interestRate);

        // Update borrower info
        borrowers[msg.sender] = BorrowerInfo({
            borrowedAmount: amount,
            borrowTimestamp: block.timestamp,
            interestRate: interestRate,
            creditProfileLoanIndex: loanIndex,
            isActive: true
        });

        totalBorrowed += amount;

        // Transfer funds to borrower
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Borrowed(msg.sender, amount, interestRate);
    }

    /**
     * @dev Repay borrowed amount with interest
     */
    function repay() external payable {
        require(address(creditProfile) != address(0), "CreditProfile not set");
        BorrowerInfo storage borrower = borrowers[msg.sender];
        require(borrower.isActive, "No active loan");

        uint256 interest = calculateInterest(
            borrower.borrowedAmount,
            borrower.interestRate,
            block.timestamp - borrower.borrowTimestamp
        );

        uint256 totalOwed = borrower.borrowedAmount + interest;
        require(msg.value >= totalOwed, "Insufficient repayment amount");

        // Check if repayment is on time (within 30 days)
        bool onTime = (block.timestamp - borrower.borrowTimestamp) <= 30 days;

        // Record repayment in credit profile
        creditProfile.recordRepayment(
            msg.sender,
            borrower.creditProfileLoanIndex,
            onTime
        );

        uint256 principal = borrower.borrowedAmount;
        totalBorrowed -= principal;
        totalYieldPaid += interest;

        // Reset borrower info
        borrower.isActive = false;
        borrower.borrowedAmount = 0;

        // Refund excess payment
        if (msg.value > totalOwed) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - totalOwed}("");
            require(refundSuccess, "Refund failed");
        }

        emit Repaid(msg.sender, principal, interest);
    }

    /**
     * @dev Claim earned yield
     */
    function claimYield() external {
        uint256 yield = _claimYield(msg.sender);
        require(yield > 0, "No yield to claim");

        (bool success, ) = msg.sender.call{value: yield}("");
        require(success, "Transfer failed");

        emit YieldClaimed(msg.sender, yield);
    }

    /**
     * @dev Internal function to calculate and update yield
     */
    function _claimYield(address lender) internal returns (uint256) {
        uint256 yield = calculateYieldEarned(lender);

        if (yield > 0) {
            lenders[lender].lastYieldClaim = block.timestamp;
            totalYieldPaid += yield;
        }

        return yield;
    }

    /**
     * @dev Calculate interest rate based on credit score and utilization
     */
    function calculateInterestRate(uint256 creditScore, uint256 utilization) public pure returns (uint256) {
        // Base rate calculation (higher credit score = lower rate)
        uint256 rate;

        if (creditScore >= 750) {
            rate = 500; // 5%
        } else if (creditScore >= 700) {
            rate = 600; // 6%
        } else if (creditScore >= 650) {
            rate = 750; // 7.5%
        } else if (creditScore >= 600) {
            rate = 900; // 9%
        } else if (creditScore >= 550) {
            rate = 1050; // 10.5%
        } else {
            rate = 1200; // 12%
        }

        // Adjust for utilization (higher utilization = higher rate)
        if (utilization > 60) {
            rate += 100; // +1%
        }
        if (utilization > 70) {
            rate += 100; // +1% more
        }

        // Ensure within bounds
        if (rate > MAX_BORROW_RATE) {
            rate = MAX_BORROW_RATE;
        }
        if (rate < MIN_BORROW_RATE) {
            rate = MIN_BORROW_RATE;
        }

        return rate;
    }

    /**
     * @dev Calculate interest owed on a loan
     */
    function calculateInterest(
        uint256 principal,
        uint256 interestRate,
        uint256 duration
    ) public pure returns (uint256) {
        // Simple interest: principal * rate * time / year
        return (principal * interestRate * duration) / (10000 * SECONDS_PER_YEAR);
    }

    /**
     * @dev Calculate yield earned by a lender
     */
    function calculateYieldEarned(address lender) public view returns (uint256) {
        LenderInfo memory lenderInfo = lenders[lender];

        if (lenderInfo.depositedAmount == 0) {
            return 0;
        }

        uint256 duration = block.timestamp - lenderInfo.lastYieldClaim;

        // Yield = depositedAmount * APY * duration / year
        return (lenderInfo.depositedAmount * BASE_LENDING_APY * duration) / (10000 * SECONDS_PER_YEAR);
    }

    /**
     * @dev Get available liquidity in the pool
     */
    function getAvailableLiquidity() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get pool utilization rate (as percentage)
     */
    function getUtilizationRate() public view returns (uint256) {
        if (totalDeposited == 0) {
            return 0;
        }
        return (totalBorrowed * 100) / totalDeposited;
    }

    /**
     * @dev Get lender's balance including earned yield
     */
    function getLenderBalance(address lender) external view returns (uint256) {
        return lenders[lender].depositedAmount + calculateYieldEarned(lender);
    }

    /**
     * @dev Get borrower's active loan details
     */
    function getBorrowerLoan(address borrower) external view returns (
        uint256 amount,
        uint256 interestRate,
        bool isActive,
        uint256 totalOwed
    ) {
        BorrowerInfo memory borrowerInfo = borrowers[borrower];

        uint256 interest = 0;
        if (borrowerInfo.isActive) {
            interest = calculateInterest(
                borrowerInfo.borrowedAmount,
                borrowerInfo.interestRate,
                block.timestamp - borrowerInfo.borrowTimestamp
            );
        }

        return (
            borrowerInfo.borrowedAmount,
            borrowerInfo.interestRate,
            borrowerInfo.isActive,
            borrowerInfo.borrowedAmount + interest
        );
    }

    /**
     * @dev Get yield earned by a lender
     */
    function getYieldEarned(address lender) external view returns (uint256) {
        return calculateYieldEarned(lender);
    }

    /**
     * @dev Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 _totalDeposited,
        uint256 _totalBorrowed,
        uint256 _availableLiquidity,
        uint256 _utilizationRate,
        uint256 _currentAPY
    ) {
        return (
            totalDeposited,
            totalBorrowed,
            getAvailableLiquidity(),
            getUtilizationRate(),
            BASE_LENDING_APY
        );
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Allow contract to receive ETH
    }
}
