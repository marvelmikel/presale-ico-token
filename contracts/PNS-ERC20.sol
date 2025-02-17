// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockPNS is ERC20, Ownable {
    constructor(address initialOwner) ERC20("MockPNS", "PNS") Ownable(initialOwner) {
        _mint(initialOwner, 1000000 * 10**18); // Mint 1,000,000 PNS tokens to the owner
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}