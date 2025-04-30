// module.exports = {
//   networks: {
//     development: {
//       host: "127.0.0.1",
//       port: 8545,  // Use 7545 for Ganache GUI, 8545 for Ganache CLI
//       network_id: "*",
//       gas: 6721975,
//       gasPrice: 20000000000,
//       websockets: true
//     }
//   },
//   compilers: {
//     solc: {
//       version: "0.8.24",
//       settings: {
//         optimizer: {
//           enabled: true,
//           runs: 200
//         }
//       }
//     }
//   },
//   // Configure mocha for better testing
//   mocha: {
//     timeout: 100000,
//     useColors: true
//   }
// };
// 
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,  // Use 7545 for Ganache GUI, 8545 for Ganache CLI
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000,
      websockets: true
    }
  },
  compilers: {
    solc: {
      version: "0.8.20",  // Updated to your preferred version
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },
  // Updated mocha configuration with gas reporter
  mocha: {
    timeout: 100000,
    useColors: true,
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'INR',
      showTimeSpent: true,
      onlyCalledMethods: true,
      noColors: true
    }
  },
  // Added plugins section
  plugins: [
    'truffle-plugin-verify'
  ]
};