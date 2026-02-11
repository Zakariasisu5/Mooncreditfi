// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CreditProfile
 * @dev Manages on-chain credit scores and loan history for DeFi lending
 */
contract CreditProfile {

    struct Loan {
        uint256 amount;
        uint256 timestamp;
        uint256 interestRate;
        bool repaid;
        bool onTime;
    }

    struct Profile {
        uint256 creditScore;
        uint256 totalLoans;
        uint256 repaidLoans;
        uint256 latePayments;
        uint256 totalBorrowed;
        uint256 totalRepaid;
    }

    // Mapping from user address to their credit profile
    mapping(address => Profile) public profiles;

    // Mapping from user address to their loan history
    mapping(address => Loan[]) public loanHistory;

    // Events
    event CreditScoreUpdated(address indexed user, uint256 newScore);
    event LoanRecorded(address indexed user, uint256 amount, uint256 interestRate);
    event RepaymentRecorded(address indexed user, uint256 loanIndex, bool onTime);

    // Constants for credit score calculation
    uint256 constant BASE_SCORE = 500;
    uint256 constant MAX_SCORE = 850;
    uint256 constant MIN_SCORE = 300;

    /**
     * @dev Initialize a new user profile with base credit score
     */
    function initializeProfile(address user) external {
        require(profiles[user].creditScore == 0, "Profile already exists");
        profiles[user].creditScore = BASE_SCORE;
        emit CreditScoreUpdated(user, BASE_SCORE);
    }

    /**
     * @dev Record a new loan for a user
     */
    function recordLoan(address user, uint256 amount, uint256 interestRate) external {
        require(amount > 0, "Amount must be greater than 0");

        // Initialize profile if it doesn't exist
        if (profiles[user].creditScore == 0) {
            profiles[user].creditScore = BASE_SCORE;
        }

        Loan memory newLoan = Loan({
            amount: amount,
            timestamp: block.timestamp,
            interestRate: interestRate,
            repaid: false,
            onTime: false
        });

        loanHistory[user].push(newLoan);
        profiles[user].totalLoans++;
        profiles[user].totalBorrowed += amount;

        emit LoanRecorded(user, amount, interestRate);
    }

    /**
     * @dev Record a loan repayment and update credit score
     */
    function recordRepayment(address user, uint256 loanIndex, bool onTime) external {
        require(loanIndex < loanHistory[user].length, "Invalid loan index");
        require(!loanHistory[user][loanIndex].repaid, "Loan already repaid");

        loanHistory[user][loanIndex].repaid = true;
        loanHistory[user][loanIndex].onTime = onTime;

        profiles[user].repaidLoans++;
        profiles[user].totalRepaid += loanHistory[user][loanIndex].amount;

        if (!onTime) {
            profiles[user].latePayments++;
        }

        // Recalculate credit score
        uint256 newScore = calculateCreditScore(user);
        profiles[user].creditScore = newScore;

        emit RepaymentRecorded(user, loanIndex, onTime);
        emit CreditScoreUpdated(user, newScore);
    }

    /**
     * @dev Calculate credit score based on loan history
     * Score is based on:
     * - Repayment rate (40%)
     * - On-time payment rate (30%)
     * - Total loans repaid (20%)
     * - Loan amount history (10%)
     */
    function calculateCreditScore(address user) public view returns (uint256) {
        Profile memory profile = profiles[user];

        if (profile.totalLoans == 0) {
            return BASE_SCORE;
        }

        uint256 score = BASE_SCORE;

        // Repayment rate factor (40% weight)
        uint256 repaymentRate = (profile.repaidLoans * 100) / profile.totalLoans;
        score += (repaymentRate * 140) / 100; // Max +140 points

        // On-time payment rate (30% weight)
        if (profile.repaidLoans > 0) {
            uint256 onTimeLoans = profile.repaidLoans - profile.latePayments;
            uint256 onTimeRate = (onTimeLoans * 100) / profile.repaidLoans;
            score += (onTimeRate * 105) / 100; // Max +105 points
        }

        // Total loans repaid factor (20% weight)
        if (profile.repaidLoans >= 10) {
            score += 70;
        } else if (profile.repaidLoans >= 5) {
            score += 50;
        } else if (profile.repaidLoans >= 3) {
            score += 30;
        } else if (profile.repaidLoans >= 1) {
            score += 10;
        }

        // Total repaid amount factor (10% weight)
        if (profile.totalRepaid >= 100 ether) {
            score += 35;
        } else if (profile.totalRepaid >= 50 ether) {
            score += 25;
        } else if (profile.totalRepaid >= 10 ether) {
            score += 15;
        } else if (profile.totalRepaid >= 1 ether) {
            score += 5;
        }

        // Penalty for late payments
        score -= (profile.latePayments * 20);

        // Ensure score is within bounds
        if (score > MAX_SCORE) {
            score = MAX_SCORE;
        } else if (score < MIN_SCORE) {
            score = MIN_SCORE;
        }

        return score;
    }

    /**
     * @dev Get user's current credit score
     */
    function getScore(address user) external view returns (uint256) {
        if (profiles[user].creditScore == 0) {
            return BASE_SCORE;
        }
        return profiles[user].creditScore;
    }

    /**
     * @dev Get user's complete profile
     */
    function getProfile(address user) external view returns (
        uint256 creditScore,
        uint256 totalLoans,
        uint256 repaidLoans,
        uint256 latePayments,
        uint256 totalBorrowed,
        uint256 totalRepaid
    ) {
        Profile memory profile = profiles[user];
        return (
            profile.creditScore == 0 ? BASE_SCORE : profile.creditScore,
            profile.totalLoans,
            profile.repaidLoans,
            profile.latePayments,
            profile.totalBorrowed,
            profile.totalRepaid
        );
    }

    /**
     * @dev Get user's loan history
     */
    function getLoanHistory(address user) external view returns (Loan[] memory) {
        return loanHistory[user];
    }

    /**
     * @dev Get specific loan details
     */
    function getLoan(address user, uint256 loanIndex) external view returns (
        uint256 amount,
        uint256 timestamp,
        uint256 interestRate,
        bool repaid,
        bool onTime
    ) {
        require(loanIndex < loanHistory[user].length, "Invalid loan index");
        Loan memory loan = loanHistory[user][loanIndex];
        return (loan.amount, loan.timestamp, loan.interestRate, loan.repaid, loan.onTime);
    }

    /**
     * @dev Get maximum borrowing limit based on credit score
     */
    function getMaxBorrowLimit(address user) external view returns (uint256) {
        uint256 score = profiles[user].creditScore;
        if (score == 0) {
            score = BASE_SCORE;
        }

        // Higher credit score = higher borrowing limit
        if (score >= 750) {
            return 10 ether;
        } else if (score >= 700) {
            return 5 ether;
        } else if (score >= 650) {
            return 3 ether;
        } else if (score >= 600) {
            return 2 ether;
        } else if (score >= 550) {
            return 1 ether;
        } else {
            return 0.5 ether;
        }
    }

    /**
     * @dev Get number of loans for a user
     */
    function getLoanCount(address user) external view returns (uint256) {
        return loanHistory[user].length;
    }
}
