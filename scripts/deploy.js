require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("🚀 Deploying contracts with account:", deployer.address);

    // ✅ Step 1: Deploy MockUSDT
    console.log("📌 Deploying MockUSDT...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deployed();
    console.log("✅ MockUSDT deployed to:", mockUSDT.address);

    // ✅ Step 2: Deploy MockPNS (Passing deployer as owner)
    console.log("📌 Deploying MockPNS...");
    const MockPNS = await ethers.getContractFactory("MockPNS");
    const mockPNS = await MockPNS.deploy(deployer.address); // 🔹 Fix: Pass deployer.address
    await mockPNS.deployed();
    console.log("✅ MockPNS (PNS Token) deployed to:", mockPNS.address);

    // ✅ Step 3: Deploy TokenICO
    console.log("📌 Deploying TokenICO...");
    const tokenSalePrice = ethers.utils.parseUnits("0.01", 6); // 0.01 USDT per token
    const totalSupply = ethers.utils.parseUnits("1000000", 18); // 1,000,000 PNS tokens

    const TokenICO = await ethers.getContractFactory("TokenICO");
    const tokenICO = await TokenICO.deploy(mockPNS.address, mockUSDT.address, tokenSalePrice, totalSupply);
    await tokenICO.deployed();
    console.log("✅ TokenICO deployed to:", tokenICO.address);

    // ✅ Step 4: Transfer Tokens to TokenICO for Sale
    console.log("🔄 Transferring MockPNS tokens to TokenICO...");
    const tokensToSupply = ethers.utils.parseUnits("500000", 18); // 500,000 PNS Tokens for sale

    const transferTx = await mockPNS.transfer(tokenICO.address, tokensToSupply);
    await transferTx.wait();
    console.log(`✅ Transferred ${ethers.utils.formatUnits(tokensToSupply, 18)} MockPNS to TokenICO`);

    console.log("🚀 Deployment completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });