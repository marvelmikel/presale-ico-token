// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "mUSDT") {
        _mint(msg.sender, 10_000 * 10**6); // ✅ Mint 10,000 USDT (6 decimals)
    }

    function faucet() external {
        _mint(msg.sender, 1_000 * 10**6); // ✅ Give 1,000 USDT (6 decimals)
    }

    function decimals() public pure override returns (uint8) {
        return 6; // ✅ Ensure 6 decimal places like real USDT
    }
}