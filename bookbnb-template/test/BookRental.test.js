const BookRental = artifacts.require("BookRental");
const truffleAssert = require('truffle-assertions');
const { time, BN } = require('@openzeppelin/test-helpers');

contract("BookRental", accounts => {
  const [owner, alice, bob, carol] = accounts;
  let bookRental;

  // metadata for our test books
  const title = "The Catcher in the Rye";
  const description = "Classic novel by J.D. Salinger";
  const image = "ipfs://imagehash";
  const pricePerDay = web3.utils.toWei("0.01", "ether");
  const lateFeePerDay = web3.utils.toWei("0.015", "ether");
  const deposit = web3.utils.toWei("0.1", "ether");

  beforeEach(async () => {
    bookRental = await BookRental.new({ from: owner });
  });

  describe("Listing books", () => {
    it("should allow anyone to list a book", async () => {
      const tx = await bookRental.listBook(
        title, description, image,
        pricePerDay, lateFeePerDay, deposit,
        { from: alice }
      );

      // Event parameters
      truffleAssert.eventEmitted(tx, "BookListed", ev => {
        return ev.id.toNumber() === 1
            && ev.owner === alice
            && ev.title === title
            && ev.pricePerDay.toString() === pricePerDay
            && ev.lateFeePerDay.toString() === lateFeePerDay
            && ev.deposit.toString() === deposit;
      });

      // Read back from the `books` mapping
      const b = await bookRental.books(1);
      assert.equal(b.id.toNumber(), 1);
      assert.equal(b.title, title);
      assert.equal(b.description, description);
      assert.equal(b.image, image);
      assert.equal(b.pricePerDay.toString(), pricePerDay);
      assert.equal(b.lateFeePerDay.toString(), lateFeePerDay);
      assert.equal(b.deposit.toString(), deposit);
      assert.equal(b.owner, alice);
      assert.equal(b.renter, "0x0000000000000000000000000000000000000000");
      assert.equal(b.isRented, false);
      
      // Check getBookDetails
      const details = await bookRental.getBookDetails(1);
      assert.equal(details[0], title); // title
      assert.equal(details[1].toString(), pricePerDay); // pricePerDay
      assert.equal(details[2].toString(), deposit); // deposit
      assert.equal(details[3], alice); // owner
      assert.equal(details[4], "0x0000000000000000000000000000000000000000"); // renter
      assert.equal(details[5].toString(), "0"); // rentedAt
      assert.equal(details[6], true); // isAvailable
    });

    it("reverts on zero price or deposit", async () => {
      // zero pricePerDay
      await truffleAssert.reverts(
        bookRental.listBook(title, description, image,
          0, lateFeePerDay, deposit, { from: owner }),
        "price = 0"
      );
      // zero lateFeePerDay
      await truffleAssert.reverts(
        bookRental.listBook(title, description, image,
          pricePerDay, 0, deposit, { from: owner }),
        "late fee = 0"
      );
      // zero deposit
      await truffleAssert.reverts(
        bookRental.listBook(title, description, image,
          pricePerDay, lateFeePerDay, 0, { from: owner }),
        "deposit = 0"
      );
      
      // deposit less than late fee
      const smallDeposit = web3.utils.toWei("0.01", "ether");
      const largeLateFee = web3.utils.toWei("0.02", "ether");
      await truffleAssert.reverts(
        bookRental.listBook(title, description, image,
          pricePerDay, largeLateFee, smallDeposit, { from: owner }),
        "deposit must cover at least one day of late fees"
      );
    });
    
    it("properly tracks total books count", async () => {
      // No books initially
      const initialCount = await bookRental.totalBooks();
      assert.equal(initialCount.toNumber(), 0);
      
      // Add 3 books
      await bookRental.listBook(title, description, image, pricePerDay, lateFeePerDay, deposit, { from: alice });
      await bookRental.listBook("Book 2", "Desc 2", "img2", pricePerDay, lateFeePerDay, deposit, { from: bob });
      await bookRental.listBook("Book 3", "Desc 3", "img3", pricePerDay, lateFeePerDay, deposit, { from: carol });
      
      const finalCount = await bookRental.totalBooks();
      assert.equal(finalCount.toNumber(), 3);
    });
  });

  describe("Renting books", () => {
    let aliceBalanceBefore;
    
    beforeEach(async () => {
      await bookRental.listBook(
        title, description, image,
        pricePerDay, lateFeePerDay, deposit,
        { from: alice }
      );
      aliceBalanceBefore = new BN(await web3.eth.getBalance(alice));
    });

    it("allows rent with exact deposit + rentCost and emits BookRented", async () => {
      const daysRequested = new BN(2);
      const rentCost = new BN(pricePerDay).mul(daysRequested);
      const totalCost = new BN(deposit).add(rentCost);

      const tx = await bookRental.rentBook(
        1, daysRequested,
        { from: bob, value: totalCost }
      );

      truffleAssert.eventEmitted(tx, "BookRented", ev => {
        return ev.id.toNumber() === 1
            && ev.renter === bob
            && ev.daysBooked.toString() === daysRequested.toString();
      });

      const b = await bookRental.books(1);
      assert.equal(b.renter, bob);
      assert.equal(b.isRented, true);
      assert.equal(b.daysBooked.toString(), daysRequested.toString());
      assert(b.rentedAt.gt(new BN(0)));
      
      // Verify owner was paid the rental cost immediately
      const aliceBalanceAfter = new BN(await web3.eth.getBalance(alice));
      assert.equal(
        aliceBalanceAfter.sub(aliceBalanceBefore).toString(),
        rentCost.toString(),
        "Owner should receive rental payment immediately"
      );
      
      // Verify user rentals tracking
      const bobRentals = await bookRental.getUserRentals(bob);
      assert.equal(bobRentals.length, 1);
      assert.equal(bobRentals[0].toString(), "1");
    });

    it("rejects rent with wrong payment amount", async () => {
      const daysRequested = new BN(2);
      const wrongPayment = new BN(deposit); // missing rent
      await truffleAssert.reverts(
        bookRental.rentBook(1, daysRequested, { from: bob, value: wrongPayment }),
        "wrong ETH sent"
      );
    });

    it("rejects owner renting their own book", async () => {
      const daysRequested = new BN(1);
      const totalCost = new BN(deposit).add(new BN(pricePerDay));
      await truffleAssert.reverts(
        bookRental.rentBook(1, daysRequested, { from: alice, value: totalCost }),
        "owner cannot rent"
      );
    });

    it("rejects double rentals", async () => {
      const daysRequested = new BN(1);
      const totalCost = new BN(deposit).add(new BN(pricePerDay));
      await bookRental.rentBook(1, daysRequested, { from: bob, value: totalCost });

      await truffleAssert.reverts(
        bookRental.rentBook(1, daysRequested, { from: carol, value: totalCost }),
        "already rented"
      );
    });
    
    it("rejects rental period exceeding maximum", async () => {
      const maxDays = await bookRental.MAX_RENTAL_DAYS();
      const excessiveDays = maxDays.toNumber() + 1;
      const rentCost = new BN(pricePerDay).mul(new BN(excessiveDays));
      const totalCost = new BN(deposit).add(rentCost);
      
      await truffleAssert.reverts(
        bookRental.rentBook(1, excessiveDays, { from: bob, value: totalCost }),
        "exceeds maximum rental period"
      );
    });
  });

  describe("Returning books", () => {
    let aliceBalanceBefore;
    let bobBalanceBefore;
    
    beforeEach(async () => {
      await bookRental.listBook(
        title, description, image,
        pricePerDay, lateFeePerDay, deposit,
        { from: alice }
      );
      
      const daysRequested = new BN(2);
      const rentCost = new BN(pricePerDay).mul(daysRequested);
      const totalCost = new BN(deposit).add(rentCost);
      
      // Capture balances before rental
      aliceBalanceBefore = new BN(await web3.eth.getBalance(alice));
      
      // Bob rents the book
      await bookRental.rentBook(1, daysRequested, { from: bob, value: totalCost });
      
      // Capture Bob's balance after rental
      bobBalanceBefore = new BN(await web3.eth.getBalance(bob));
    });

    it("returns on time with no late fee and correct refund", async () => {
      const tx = await bookRental.returnBook(1, { from: bob });

      // Expect lateDays = 0, ownerPaid = 0 (already paid during rental), refund = full deposit
      truffleAssert.eventEmitted(tx, "BookReturned", ev => {
        return ev.id.toNumber() === 1
            && ev.renter === bob
            && ev.lateDays.toNumber() === 0
            && ev.ownerPaid.toString() === "0" // No additional payment to owner
            && ev.renterRefund.toString() === deposit;
      });

      const b = await bookRental.books(1);
      assert.equal(b.isRented, false);
      assert.equal(b.renter, "0x0000000000000000000000000000000000000000");
      assert.equal(b.daysBooked.toNumber(), 0);
      
      // Verify Bob got deposit back (adjust for gas costs)
      const bobBalanceAfter = new BN(await web3.eth.getBalance(bob));
      const txInfo = await web3.eth.getTransaction(tx.tx);
      const txReceipt = await web3.eth.getTransactionReceipt(tx.tx);
      const gasUsed = new BN(txReceipt.gasUsed);
      const gasPrice = new BN(txInfo.gasPrice);
      const gasCost = gasPrice.mul(gasUsed);
      
      const expectedBalance = bobBalanceBefore.add(new BN(deposit)).sub(gasCost);
      assert(bobBalanceAfter.gte(expectedBalance.sub(new BN(1e12))), "Renter should receive full deposit back");
      
      // Verify user rentals tracking is updated
      const bobRentals = await bookRental.getUserRentals(bob);
      assert.equal(bobRentals.length, 0, "Bob should have no rentals after return");
    });

    it("applies late fee on delayed return", async () => {
      // jump 4 days: 2 booked + 2 late
      await time.increase(time.duration.days(4));
      await time.advanceBlock();
      
      // Get balances before return
      const aliceBalanceBeforeReturn = new BN(await web3.eth.getBalance(alice));
      const bobBalanceBeforeReturn = new BN(await web3.eth.getBalance(bob));
      
      const tx = await bookRental.returnBook(1, { from: bob });

      const lateDays = new BN(2);
      const lateFee = new BN(lateFeePerDay).mul(lateDays);
      const expectedRenterRefund = new BN(deposit).sub(lateFee);

      truffleAssert.eventEmitted(tx, "BookReturned", ev => {
        return ev.id.toNumber() === 1
            && ev.renter === bob
            && ev.lateDays.toNumber() === 2
            && ev.ownerPaid.toString() === lateFee.toString()
            && ev.renterRefund.toString() === expectedRenterRefund.toString();
      });

      // Verify Alice received late fees
      const aliceBalanceAfter = new BN(await web3.eth.getBalance(alice));
      assert.equal(
        aliceBalanceAfter.sub(aliceBalanceBeforeReturn).toString(),
        lateFee.toString(),
        "Owner should receive late fees"
      );
      
      // Verify Bob received partial deposit back
      const bobBalanceAfter = new BN(await web3.eth.getBalance(bob));
      const txInfo = await web3.eth.getTransaction(tx.tx);
      const txReceipt = await web3.eth.getTransactionReceipt(tx.tx);
      const gasUsed = new BN(txReceipt.gasUsed);
      const gasPrice = new BN(txInfo.gasPrice);
      const gasCost = gasPrice.mul(gasUsed);
      
      const expectedBalance = bobBalanceBeforeReturn.add(expectedRenterRefund).sub(gasCost);
      assert(bobBalanceAfter.gte(expectedBalance.sub(new BN(1e12))), "Renter should receive partial deposit");
    });

    it("reverts if non-renter tries to return", async () => {
      await truffleAssert.reverts(
        bookRental.returnBook(1, { from: carol }),
        "only renter"
      );
    });

    it("allows re-renting after a return", async () => {
      await bookRental.returnBook(1, { from: bob });

      const daysRequested = new BN(1);
      const totalCost = new BN(deposit).add(new BN(pricePerDay));
      const tx = await bookRental.rentBook(1, daysRequested, { from: carol, value: totalCost });

      truffleAssert.eventEmitted(tx, "BookRented", ev => {
        return ev.id.toNumber() === 1 && ev.renter === carol;
      });

      const b = await bookRental.books(1);
      assert.equal(b.renter, carol);
      assert.equal(b.isRented, true);
      
      // Verify user rentals are tracked
      const carolRentals = await bookRental.getUserRentals(carol);
      assert.equal(carolRentals.length, 1);
      assert.equal(carolRentals[0].toString(), "1");
    });
    
    it("handles extreme late case with deposit fully used", async () => {
      // Jump forward by many days to ensure late fees exceed deposit
      await time.increase(time.duration.days(10)); // 8 days late
      
      const tx = await bookRental.returnBook(1, { from: bob });
      
      // Late fees exceed deposit, so entire deposit should be used
      const expectedLateFees = deposit; // Capped at deposit
      const expectedRefund = 0;
      
      truffleAssert.eventEmitted(tx, "BookReturned", ev => {
        return ev.ownerPaid.toString() === expectedLateFees
            && ev.renterRefund.toString() === expectedRefund.toString();
      });
    });
  });
  

  
  describe("Helper functions", () => {
    beforeEach(async () => {
      await bookRental.listBook(
        title, description, image,
        pricePerDay, lateFeePerDay, deposit,
        { from: alice }
      );
      
      const daysRequested = new BN(3);
      const rentCost = new BN(pricePerDay).mul(daysRequested);
      const totalCost = new BN(deposit).add(rentCost);
      
      // Bob rents the book
      await bookRental.rentBook(1, daysRequested, { from: bob, value: totalCost });
    });
    
    it("correctly reports due date", async () => {
      const b = await bookRental.books(1);
      const dueDate = await bookRental.getDueDate(1);
      
      const expected = new BN(b.rentedAt).add(new BN(b.daysBooked).mul(new BN(86400))); // 1 day = 86400 seconds
      assert.equal(dueDate.toString(), expected.toString());
    });
    
    it("correctly reports book lateness status", async () => {
      // Initially not late
      let lateStatus = await bookRental.isBookLate(1);
      assert.equal(lateStatus[0], false);
      assert.equal(lateStatus[1].toNumber(), 0);
      
      // Move forward 4 days (1 day late)
      await time.increase(time.duration.days(4));
      await time.advanceBlock();
      
      lateStatus = await bookRental.isBookLate(1);
      assert.equal(lateStatus[0], true);
      assert.equal(lateStatus[1].toNumber(), 1);
    });
  });
});