// filepath: /Users/michaelmarvellous/dev/pns-ico/hardhat.config.js
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0"
      },
      {
        version: "0.8.20"
      },
      {
        version: "0.8.28"
      }
    ]
  },
  networks: {
    mumbai: {
      url: "https://rpc.ankr.com/polygon_amoy",
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  }
};