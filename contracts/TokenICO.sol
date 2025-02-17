// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenICO {
    event TokensPurchased(address indexed buyer, uint256 tokenAmount, uint256 usdtAmount, string tokenSymbol);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event TokensDeposited(uint256 amount);

    address public owner;
    address public usdtAddress;
    IERC20 public usdt;
    IERC20 public token;
    uint256 public tokenSalePrice;
    uint256 public totalRaisedUSDT;
    uint256 public totalTokensSold;
    uint256 public totalSupply;
    string public constant tokenSymbol = "PNS";

    struct Purchase {
        address buyer;
        uint256 tokenAmount;
        uint256 usdtPaid;
        string tokenSymbol;
    }

    Purchase[] public purchaseRecords;
    mapping(address => uint256) public tokensBought;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(address _tokenAddress, address _usdtAddress, uint256 _tokenSalePrice, uint256 _totalSupply) {
        require(_tokenAddress != address(0), "Invalid token address");
        require(_usdtAddress != address(0), "Invalid USDT address");
        require(_tokenSalePrice > 0, "Token price must be greater than zero");
        require(_totalSupply > 0, "Total supply must be greater than zero");

        owner = msg.sender;
        token = IERC20(_tokenAddress);
        usdtAddress = _usdtAddress;
        usdt = IERC20(_usdtAddress);
        tokenSalePrice = _tokenSalePrice;
        totalSupply = _totalSupply;

        emit OwnershipTransferred(address(0), owner);
    }

    function buyToken(uint256 _tokenAmount) external {
        require(_tokenAmount > 0, "Token amount must be greater than zero");
        require(totalTokensSold + _tokenAmount <= totalSupply, "Not enough tokens left for sale");

        // ✅ Convert Token Amount to USDT Amount (Assuming USDT has 6 decimals and PNS has 18)
        uint256 usdtAmount = (_tokenAmount * tokenSalePrice) / 1e18;

        require(usdt.balanceOf(msg.sender) >= usdtAmount, "Not enough USDT balance");
        require(usdt.allowance(msg.sender, address(this)) >= usdtAmount, "USDT allowance too low");

        // ✅ Ensure the ICO contract holds enough PNS tokens to sell
        require(token.balanceOf(address(this)) >= _tokenAmount, "Not enough PNS tokens in ICO contract");

        // ✅ Transfer USDT from buyer to owner
        require(usdt.transferFrom(msg.sender, owner, usdtAmount), "USDT transfer failed");

        // ✅ Transfer PNS tokens to buyer
        require(token.transfer(msg.sender, _tokenAmount), "Token transfer failed");

        // ✅ Update records
        tokensBought[msg.sender] += _tokenAmount;
        totalTokensSold += _tokenAmount;
        totalRaisedUSDT += usdtAmount;

        purchaseRecords.push(Purchase(msg.sender, _tokenAmount, usdtAmount, tokenSymbol));

        emit TokensPurchased(msg.sender, _tokenAmount, usdtAmount, tokenSymbol);
    }

    function getPurchaseHistory() external view returns (Purchase[] memory) {
        return purchaseRecords;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function updateTokenSalePrice(uint256 _tokenSalePrice) external onlyOwner {
        require(_tokenSalePrice > 0, "Token price must be greater than zero");
        tokenSalePrice = _tokenSalePrice;
    }

    function getTokenPrice() external view returns (uint256) {
        return tokenSalePrice;
    }

    function calculateUSDTAmount(uint256 _tokenAmount) external view returns (uint256) {
        require(_tokenAmount > 0, "Token amount must be greater than zero");
        return (_tokenAmount * tokenSalePrice) / 1e18;
    }

    // ✅ Allow the owner to deposit MockPNS tokens before starting sales
    function depositTokens(uint256 _amount) external onlyOwner {
        require(token.transferFrom(msg.sender, address(this), _amount), "Token deposit failed");
        emit TokensDeposited(_amount);
    }

    // ✅ Get the remaining token balance in ICO contract
    function getRemainingTokens() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}