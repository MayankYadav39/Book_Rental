
# Decentralized Book Rental Platform

## CS 218: Programmable and Interoperable Blockchains

### Team Members
- **Mayank Yadav** – Roll No: 230002041  
- **Utkarsh Singh** – Roll No: 230041035  
- **Harshvardhan Choudhary** – Roll No: 230002027  
- **Jeel Savsani** – Roll No: 230001033  
- **Anuj Kothari** – Roll No: 230008010  
- **Prayag Lakhani** – Roll No: 230001045  

---

## Project Overview

This project implements a decentralized book-rental platform on Ethereum. Users can list books, rent them for a set period, and return them—handling deposits, payments, late-fees, and refunds entirely on‐chain.

---

## Features

1. **Book Listing**  
   - Anyone can list a book (title, description, image, daily price, late fee, deposit).  
   - The lister becomes the on‐chain owner.

2. **Book Renting**  
   - Rent for up to 30 days.  
   - Pay rental cost + security deposit.  
   - Rental cost goes immediately to the book owner.  
   - On‐chain tracking of start date & duration.

3. **Book Returning**  
   - Return at any time; deposit refunded minus any late fees.  
   - Late fees = days overdue × lateFeePerDay, capped at the deposit.  

4. **View Functions**  
   - Total book count, availability, due dates, and lateness status.  
   - Public book details (title, price, deposit) without personal data.

5. **User Tracking**  
   - Each user’s rentals tracked in O(1) operations.  

---
<video src="images/DEMO.mp4" controls autoplay loop muted width="480"></video>


## Smart Contract Design

- **Secure Payments** via OpenZeppelin’s `Address.sendValue()`.  
- **ReentrancyGuard** & checks-effects-interactions pattern.  
- **Input Validation** for zero values, string emptiness, logical constraints.  
- **Time Tracking** using `block.timestamp` for rental periods.

---

## Test Results

All 15 tests pass, covering listing, renting, returning, edge cases, and error handling:

![Test Results](images/test_gas_results.png)

---

## Gas Analysis

| Function      | Gas Used | Notes                         |
|---------------|----------|------------------------------|
| `listBook`    | 240 691  | One-time per book listing     |
| `rentBook`    | 77 310   | Includes payment to owner     |
| `returnBook`  | 65 993   | Includes refund computation   |

---

## Storage Efficiency

- Deployment cost: ~1 507 028 gas (≈22.4% of block limit)  
- Struct-packing & minimal arrays for user rentals  

---

## How to Run

### Prerequisites
- Node.js v12+, npm  
- Truffle v5.11.5  
- Ganache (CLI or GUI)  

### Setup & Testing

```bash
# Clone & install
git clone https://github.com/MayankYadav39/Book_Rental.git
cd book-rental/bookbnb-template
npm install

# Start Ganache in a separate terminal:
npx ganache-cli

# Compile, migrate, and test
truffle compile
truffle migrate --reset --network development
truffle test --network development
```

---

## Web Interface

Start the React UI and local blockchain:

```bash
yarn blockchain
npx hardhat run scripts/deploy.js --network localhost
yarn dev
```

Open <http://localhost:3000> and connect MetaMask.

### 📷 Screenshots

#### Home Page  
![Home Page](images/Home_page.png)

#### Book List  
![Book List](images/list_page.png)

#### Book Details & Rental  
![Book Details](images/Bookrent_page.png)

#### My Rentals  
![My Rentals](images/Myrental_page.png)

---

## ▶️ Demo Video

[Watch the demo video](images/DEMO.mp4)

---

## Future Enhancements

1. Dispute resolution & arbitration  
2. User‐rating system  
3. Book categories & search filters  
4. Rental extensions  
5. Bulk listing operations  

---

## Conclusion

By leveraging Ethereum smart contracts, this platform automates the complete rental lifecycle in a trustless, gas-efficient, and secure way—showcasing blockchain’s power for peer-to-peer rental marketplaces.
