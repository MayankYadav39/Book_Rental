# Decentralized Book Rental Platform

## CS 218: Programmable and Interoperable Blockchains

### Team Members
Mayank Yadav – Roll No: 230002041

Utkarsh Singh – Roll No: 230041035

Harshvardhan Choudhary – Roll No: 230002027

Jeel Savsani – Roll No: 230001033

Anuj Kothari – Roll No: 230008010

Prayag Lakhani – Roll No: 230001045





## Project Overview

This project implements a decentralized book rental platform on the Ethereum blockchain. The platform allows users to list books for rent, rent books from others, and return them after use. The contract handles the entire rental lifecycle including deposits, payments, late fees, and refunds.

## Features

1. **Book Listing**
   - Any user can list books for rent
   - Each book has a title, description, image, daily price, late fee, and deposit amount
   - Lister becomes the owner of the book in the system

2. **Book Renting**
   - Users can rent books for a specified number of days (up to 30)
   - Rental requires payment of both the rental cost and a security deposit
   - Rental payments are sent immediately to the book owner
   - System tracks rental start date and duration

3. **Book Returning**
   - Renters can return books when finished
   - Security deposit is returned to the renter minus any late fees
   - Late fees are calculated based on days past the due date
   - Late fees are capped at the deposit amount

4. **View Functions**
   - Anyone can check total number of books in the system
   - Query book availability status without accessing personal data
   - View public book details (title, price, deposit) while preserving privacy
   - Check due dates and lateness status through privacy-preserving interfaces
   - All data stored on-chain is pseudonymous (uses blockchain addresses, not personal identifiers)

5. **User Tracking**
   - System tracks all rentals made by each user
   - Efficient O(1) operations for adding and removing user rentals

## Smart Contract Design

The BookRental contract is built with a focus on security, efficiency, and reliability. The contract handles the entire rental lifecycle with robust error handling and secure payment management.

### Key Smart Contract Features

1. **Secure Payment Handling**
   - Clear separation of rental payments and security deposits
   - Immediate payment to book owners for rental costs
   - Secure deposit holding during rental period
   - Automatic calculation of late fees based on return date
   - Guaranteed refund of deposit (minus any applicable late fees)

2. **Transaction Safety**
   - Built-in protection against reentrancy attacks
   - State changes performed before external value transfers
   - Comprehensive error handling with clear error messages
   - Validation of all inputs to prevent invalid operations
   - Secure value transfer using OpenZeppelin's `sendValue()`

3. **Transaction Reliability**
   - In case of any discrepancy, the payment logic ensures funds are correctly distributed
   - Late fee calculations are capped at the deposit amount to prevent excessive charges
   - Dual-action financial operations (owner payment and renter refund) are handled separately
   - Error in one payment will not affect the other transaction
   - Each step in the rental process is atomic and consistent

## Security Measures

1. **Reentrancy Protection**
   - Implemented OpenZeppelin's ReentrancyGuard
   - Follow the checks-effects-interactions pattern
   - State changes completed before external calls

2. **Input Validation**
   - Comprehensive validation of all user inputs
   - Checks for empty strings, zero values, and logical constraints
   - Deposit must be greater than or equal to late fee

3. **Access Control**
   - Proper ownership checks for book operations
   - Only the renter can return a book
   - Only non-owners can rent a book
   - Only book owner receives rental payments

4. **Secure Fund Handling**
   - Used OpenZeppelin's `Address.sendValue()` for safe ETH transfers
   - Security deposit handling with proper refund logic
   - Ensures payments go to the correct recipients in all scenarios

5. **Time-based Security**
   - Used `block.timestamp` securely for rental duration tracking
   - Accurate calculation of rental periods and late fees
   - Protection against timestamp manipulation through robust validation

## Test Results

The contract has been thoroughly tested with 15 passing tests covering all functionality:

![Test Results](terminal-test-results.jpg)

The tests verify:
- Book listing functionality
- Rental process and payment handling
- Return process and late fee calculation
- Edge cases such as trying to rent your own book
- Error handling for invalid inputs
- Refund logic for on-time and late returns

## Gas Analysis

Gas costs have been optimized for all major functions:

| Function      | Gas Used | Notes                               |
|---------------|----------|------------------------------------|
| listBook      | 240691   | One-time cost per book             |
| rentBook      | 77310    | Includes payment to book owner     |
| returnBook    | 65993    | Includes refund calculation        |

These gas metrics demonstrate the efficiency of the contract implementation, with particular attention paid to frequently called functions.

## Storage Efficiency

The contract is optimized for storage efficiency:
- Total deployment cost: 1507028 gas (22.4% of block limit)
- Used struct packing to minimize storage slots
- Efficient tracking of user rentals with minimal storage overhead

## Transaction Success Rate

All operations have been tested for reliability, with a 100% success rate for valid transactions.

## How to Run the Project

### Prerequisites

- Node.js v12+ and npm
- Truffle v5.11.5
- Ganache for local blockchain

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/MayankYadav39/book-rental
   cd book-rental/bookbnb-template
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Ganache (if not already installed):
   ```bash
   npm install -g ganache-cli
   ```

4. Install required Truffle plugins:
   ```bash
   npm install --save-dev eth-gas-reporter truffle-plugin-verify truffle-contract-size solidity-coverage
   ```

### Running the Project

1. Start Ganache (in a separate terminal):
   ```bash
   ganache-cli
   ```

2. Compile the contracts:
   ```bash
   truffle compile
   ```

3. Run the tests:
   ```bash
   truffle test
   ```

4. Deploy the contract:
   ```bash
   truffle migrate
   ```

5. For gas reporting:
   ```bash
   truffle test --network development --gasReport
   ```

## Web Interface

The project includes a modern, user-friendly web interface for interacting with the BookRental smart contract. Our UI provides a seamless experience for both book owners and renters.

1. Start the development server:
   ```bash
   yarn blockchain
   npx hardhat run scripts/deploy.js --network localhost
   yarn dev
   
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Connect your MetaMask wallet to interact with the contract

### UI Features

The interface offers a comprehensive set of features:

**Book Listing Interface**
![Book Listing Interface](UI-listing-screenshot.jpg)
- Clean form for adding new books to the platform
- Input validation ensures all required fields are completed
- Clear guidance on deposit requirements (must exceed late fee)
- Direct connection to MetaMask for transaction signing

**Book Details and Rental**
![Book Details and Rental](UI-rental-screenshot.jpg)
- Detailed book information display
- Clear pricing information (daily rate, late fees, deposit)
- Flexible rental period selection with real-time cost calculation
- Transparent breakdown of total costs (rental + deposit)
- Seamless MetaMask integration for payment

**Book Management**
![Book Management](UI-return-screenshot.jpg)
- Clear display of rental information
- Remaining rental period calculation with due date
- Easy book return functionality
- Automatic calculation of any applicable late fees
- Transparent refund process for deposits

**Additional UI Features**
![Book Rental UI](UI-all-books-screenshot.jpg)
- Responsive design works on both desktop and mobile
- Dark mode interface for reduced eye strain
- Wallet integration with account selection
- Tab-based navigation between All Books, List Book, and My Rentals
- Real-time updates when blockchain transactions complete

### UI Demo

[Space for UI Demo Video]

The interface demonstrates the full rental lifecycle:
1. Listing a book with all relevant details
2. Browsing the marketplace of available books
3. Selecting and renting a book with flexible duration
4. Managing active rentals and tracking due dates
5. Returning books and receiving deposit refunds

## Future Enhancements

1. **Dispute Resolution System**
   - Add arbitration for disputes about book condition

2. **Rating System**
   - Allow users to rate renters and book owners

3. **Book Categories**
   - Implement categories for easier browsing

4. **Extended Rentals**
   - Allow renters to extend their rental period

5. **Bulk Operations**
   - Support listing multiple books in a single transaction

## Conclusion

This decentralized book rental platform demonstrates the power of blockchain for creating trustless rental systems. By leveraging Ethereum smart contracts, we've created a system that handles the entire rental lifecycle without requiring trust between participants.

The implementation prioritizes gas efficiency, security, and user experience, making it a practical solution for real-world use cases.
