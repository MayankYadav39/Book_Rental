// hardhat.config.js

require("@nomicfoundation/hardhat-toolbox");
// or, if you just want ethers:
// require("@nomicfoundation/hardhat-ethers");
 


module.exports = {
  solidity: {
    version: "0.8.24",           // ← match your pragma exactly
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    localhost: { url: "http://127.0.0.1:8545" }
  }
};
