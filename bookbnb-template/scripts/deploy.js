// scripts/deploy.js
const { ethers } = require('hardhat');
const fs = require('fs');

async function deployContract() {
  try {
    // Deploy BookRental with no constructor parameters
    const bookRental = await ethers.deployContract('BookRental');
    await bookRental.waitForDeployment();

    console.log('BookRental deployed to:', bookRental.target);
    return bookRental;
  } catch (error) {
    console.error('Error deploying BookRental:', error);
    throw error;
  }
}

async function saveContractAddress(contract) {
  try {
    const data = {
      bookRentalContract: contract.target
    };
    // Synchronously write so we know it's on disk before exiting
    fs.writeFileSync(
      './contracts/contractAddress.json',
      JSON.stringify(data, null, 2),
      'utf8'
    );
    console.log('Saved contract address:', data);
  } catch (error) {
    console.error('Error saving contract address:', error);
    throw error;
  }
}

async function main() {
  const contract = await deployContract();
  await saveContractAddress(contract);
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exitCode = 1;
});
