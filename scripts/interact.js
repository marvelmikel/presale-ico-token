require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  // ✅ Set up provider and wallet
  const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon_amoy");
  const wallet = new ethers.Wallet(`0x${process.env.PRIVATE_KEY}`, provider);

  // ✅ Contract Addresses
  const tokenICOAddress = "0x2a728Bdc69f227610e591992C619bf9c763989eb"; // 🔹 Replace with your TokenICO contract
  const usdtAddress = "0x0426C953F706465af61205Acf125bF397e819241"; // 🔹 Replace with Mock USDT contract

  // ✅ ABI Definitions
  const tokenICOAbi = [
    "function buyToken(uint256 _tokenAmount) external",
    "function getPurchaseHistory() external view returns (tuple(address buyer, uint256 tokenAmount, uint256 usdtPaid)[])",
    "function transferOwnership(address newOwner) external",
    "function updateTokenSalePrice(uint256 _tokenSalePrice) external",
    "function getTokenPrice() external view returns (uint256)",
    "function calculateUSDTAmount(uint256 _tokenAmount) external view returns (uint256)",
    "function totalTokensSold() external view returns (uint256)",
    "function totalRaisedUSDT() external view returns (uint256)",
    "function totalSupply() external view returns (uint256)"
  ];

  const usdtAbi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
  ];

  // ✅ Initialize Contracts
  const tokenICO = new ethers.Contract(tokenICOAddress, tokenICOAbi, wallet);
  const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, wallet);

  // ✅ Fetch Token Sale Price
  const tokenPrice = await tokenICO.getTokenPrice();
  console.log("🔹 Token Sale Price:", ethers.utils.formatUnits(tokenPrice, 6), "USDT");

  // ✅ Calculate USDT amount for 5 tokens
  const tokenAmount = ethers.utils.parseUnits("5", "ether");
  const usdtAmount = await tokenICO.calculateUSDTAmount(tokenAmount);
  console.log("💰 Amount for 5 tokens:", ethers.utils.formatUnits(usdtAmount, 6), "USDT");

  // ✅ Buy tokens (2 tokens for testing)
  await buyTokens(tokenICO, usdtContract, wallet, "200");

  // ✅ Check total tokens sold in TokenICO contract
  const totalTokensSold = await tokenICO.totalTokensSold();
  console.log(`🔍 Total tokens sold in TokenICO contract: ${ethers.utils.formatUnits(totalTokensSold, 18)}`);

  // ✅ Check total USDT raised in TokenICO contract
  const totalRaisedUSDT = await tokenICO.totalRaisedUSDT();
  console.log(`🔍 Total USDT raised in TokenICO contract: ${ethers.utils.formatUnits(totalRaisedUSDT, 6)} USDT`);

  // ✅ Check total supply in TokenICO contract
  const totalSupply = await tokenICO.totalSupply();
  console.log(`🔍 Total supply in TokenICO contract: ${ethers.utils.formatUnits(totalSupply, 18)}`);

  // ✅ Calculate total remaining tokens
  const totalRemainingTokens = totalSupply.sub(totalTokensSold);
  console.log(`🔍 Total remaining tokens in TokenICO contract: ${ethers.utils.formatUnits(totalRemainingTokens, 18)}`);
}

async function buyTokens(tokenICO, usdtContract, wallet, amount) {
  try {
    console.log(`🔍 Attempting to buy ${amount} tokens...`);

    // ✅ Convert amount to correct decimals
    const tokenAmount = ethers.utils.parseUnits(amount, "ether");
    const usdtAmount = await tokenICO.calculateUSDTAmount(tokenAmount);
    console.log(`💰 USDT Required: ${ethers.utils.formatUnits(usdtAmount, 6)} USDT`);

    // ✅ Step 1: Ensure Wallet has Enough USDT
    const balance = await usdtContract.balanceOf(wallet.address);
    if (balance.lt(usdtAmount)) {
      throw new Error("❌ Insufficient USDT balance.");
    }

    // ✅ Step 2: Check and Approve USDT Spending
    const allowance = await usdtContract.allowance(wallet.address, tokenICO.address);
    if (allowance.lt(usdtAmount)) {
      console.log("🔍 Approving USDT...");
      const approveTx = await usdtContract.approve(tokenICO.address, usdtAmount);
      await approveTx.wait();
      console.log(`✅ Approved ${ethers.utils.formatUnits(usdtAmount, 6)} USDT.`);
    } else {
      console.log("✅ USDT already approved.");
    }

    // ✅ Step 3: Execute Buy Transaction with Manual Gas Limit
    console.log("🔍 Buying Tokens...");
    const gasLimit = 300000; // Set a manual gas limit
    const buyTx = await tokenICO.buyToken(tokenAmount, { gasLimit });
    await buyTx.wait();
    console.log(`🎉 Successfully bought ${amount} tokens!`);
  } catch (error) {
    console.error("❌ Error during buyTokens:", error.message);
    if (error.error && error.error.data) {
      console.error("❌ Error data:", error.error.data);
    }
  }
}

// ✅ Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });