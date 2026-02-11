// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DePINFunding
 * @dev Allows users to fund DePIN infrastructure, records contributions and shares, distributes real yields, and mints proof-of-impact NFTs.
 */
contract DePINFunding {

    uint256 constant PRECISION = 1e18;
    uint256 constant MIN_CONTRIBUTION = 0.01 ether;

    address public owner;

    uint256 public totalShares;
    uint256 public totalContributions;
    uint256 public totalYieldsDistributed;
    uint256 public cumulativeYieldPerShare;

    // Contributor information
    mapping(address => Contributor) public contributors;

    // Minimal ERC721 implementation for proof-of-impact NFTs
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances; // Balance is 1 per address for simplicity
    uint256 private _nextTokenId = 1;

    struct Contributor {
        uint256 shares;
        uint256 rewardDebt;
        uint256 tokenId; // 0 if not minted
    }

    // Events
    event Contributed(address indexed contributor, uint256 amount);
    event YieldClaimed(address indexed contributor, uint256 amount);
    event YieldDistributed(uint256 amount);
    event InfrastructureFunded(address indexed recipient, uint256 amount);
    event NFTMinted(address indexed to, uint256 tokenId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /**
     * @dev Contribute ETH to fund DePIN infrastructure
     */
    function contribute() external payable {
        require(msg.value >= MIN_CONTRIBUTION, "Contribution too small");

        Contributor storage contrib = contributors[msg.sender];

        // Claim any pending yield
        uint256 pending = pendingYield(msg.sender);
        if (pending > 0) {
            _safeTransfer(msg.sender, pending);
            emit YieldClaimed(msg.sender, pending);
        }

        // Mint NFT if first contribution
        if (contrib.tokenId == 0) {
            uint256 tokenId = _nextTokenId++;
            _owners[tokenId] = msg.sender;
            _balances[msg.sender] = 1;
            contrib.tokenId = tokenId;
            emit NFTMinted(msg.sender, tokenId);
        }

        // Update shares (proportional to contribution)
        contrib.shares += msg.value;
        totalShares += msg.value;
        totalContributions += msg.value;

        // Update reward debt
        contrib.rewardDebt = contrib.shares * cumulativeYieldPerShare / PRECISION;

        emit Contributed(msg.sender, msg.value);
    }

    /**
     * @dev Claim earned yield
     */
    function claimYield() external {
        uint256 pending = pendingYield(msg.sender);
        require(pending > 0, "No yield to claim");

        Contributor storage contrib = contributors[msg.sender];
        _safeTransfer(msg.sender, pending);
        contrib.rewardDebt = contrib.shares * cumulativeYieldPerShare / PRECISION;

        emit YieldClaimed(msg.sender, pending);
    }

    /**
     * @dev Distribute real yield (profit-sharing) to the pool
     */
    function distributeYield() external payable onlyOwner {
        require(msg.value > 0, "No yield to distribute");
        require(totalShares > 0, "No shares in pool");

        cumulativeYieldPerShare += (msg.value * PRECISION) / totalShares;
        totalYieldsDistributed += msg.value;

        emit YieldDistributed(msg.value);
    }

    /**
     * @dev Fund infrastructure by transferring ETH to a recipient (e.g., for solar/compute deployment)
     */
    function fundInfrastructure(uint256 amount, address payable recipient) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= address(this).balance, "Insufficient balance");
        require(recipient != address(0), "Invalid recipient");

        recipient.transfer(amount);

        emit InfrastructureFunded(recipient, amount);
    }

    /**
     * @dev Calculate pending yield for a contributor
     */
    function pendingYield(address _contributor) public view returns (uint256) {
        Contributor memory contrib = contributors[_contributor];
        if (contrib.shares == 0) {
            return 0;
        }
        return (contrib.shares * cumulativeYieldPerShare / PRECISION) - contrib.rewardDebt;
    }

    /**
     * @dev Get contributor's details
     */
    function getContributor(address user) external view returns (
        uint256 shares,
        uint256 tokenId,
        uint256 pendingYieldAmount
    ) {
        Contributor memory contrib = contributors[user];
        return (
            contrib.shares,
            contrib.tokenId,
            pendingYield(user)
        );
    }

    /**
     * @dev Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 _totalShares,
        uint256 _totalContributions,
        uint256 _totalYieldsDistributed,
        uint256 _availableBalance
    ) {
        return (
            totalShares,
            totalContributions,
            totalYieldsDistributed,
            address(this).balance
        );
    }

    // NFT view functions (minimal ERC721 compliance)

    /**
     * @dev Returns the owner of the `tokenId` token.
     */
    function ownerOf(uint256 tokenId) external view returns (address) {
        address own = _owners[tokenId];
        require(own != address(0), "Invalid token ID");
        return own;
    }

    /**
     * @dev Returns the number of tokens owned by `_owner`.
     */
    function balanceOf(address _owner) external view returns (uint256) {
        return _balances[_owner];
    }

    // Internal safe transfer
    function _safeTransfer(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}("");
        require(success, "Transfer failed");
    }

    // Allow contract to receive ETH
    receive() external payable {}
}