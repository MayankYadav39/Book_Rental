// scripts/smoke-test-extended.js
const hre     = require("hardhat");
const { ethers } = hre;

async function main() {
  // Deploy
  const Factory = await ethers.getContractFactory("BookRental");
  const c       = await Factory.deploy();
  await c.waitForDeployment();
  console.log("Deployed at:", c.target);

  // 1) list a book
  await c.listBook(
    "Smoke Title",
    "Smoke Desc",
    "https://example.com/img.png",
    ethers.parseEther("0.001"),  // pricePerDay
    ethers.parseEther("0.0005"), // lateFeePerDay
    ethers.parseEther("0.002")   // deposit
  );
  console.log("After listBook → totalBooks:", (await c.totalBooks()).toString()); // 1

  // 2) rent it for 2 days
  const days = 2;
  const price = ethers.parseEther("0.001").mul(days);
  const deposit = ethers.parseEther("0.002");
  const total = price.add(deposit);

  const rentTx = await c.rentBook(1, days, { value: total });
  await rentTx.wait();
  console.log("After rentBook → isAvailable:", (await c.getBookDetails(1))[6]); // false

  // 3) fast-forward time by 3 days (Hardhat-only)
  await hre.network.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
  await hre.network.provider.send("evm_mine");

  // 4) check late status
  const [isLate, lateDays] = await c.isBookLate(1);
  console.log("isBookLate:", isLate, "lateDays:", lateDays.toString()); // true, 1

  // 5) return the book
  const retTx = await c.returnBook(1);
  await retTx.wait();
  console.log("After returnBook → isAvailable:", (await c.getBookDetails(1))[6]); // true

  // 6) edge-case: try over-max days (should revert)
  try {
    await c.rentBook(1, 31, { value: ethers.parseEther("0.001").mul(31).add(deposit) });
    console.error("❌ Expected revert for exceeding MAX_RENTAL_DAYS");
  } catch (e) {
    console.log("✔️ MAX_RENTAL_DAYS enforced");
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
