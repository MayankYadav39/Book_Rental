// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BookRental is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Address for address payable;

    Counters.Counter private _bookIds;
    
    // Maximum rental period in days - use constant for gas savings
    uint256 public constant MAX_RENTAL_DAYS = 30;
    // Use constant for seconds in a day to save gas in calculations
    uint256 private constant SECONDS_PER_DAY = 86400;

    struct Book {
        uint256 id;
        string title;
        string description;
        string image;
        uint256 pricePerDay;   // wei
        uint256 lateFeePerDay; 
        uint256 deposit;       // wei (collateral)
        address owner;         // book lister
        address renter;
        uint256 rentedAt;      // timestamp when rent started
        uint256 daysBooked;    // how many days were paid for up-front
        // Pack boolean with other small fields to save storage
        bool isRented;
        uint256 rentCostPaid;  // tracks the actual rent cost paid (for clearer accounting)
    }

    // Main book storage mapping
    mapping(uint256 => Book) public books;
    
    // Map user => bookId => isRented
    mapping(address => mapping(uint256 => bool)) private userRentals;
    // Track all bookIds a user has rented (for enumeration)
    mapping(address => uint256[]) private userRentalIds;
    // Map user => bookId => index in userRentalIds array for O(1) removal
    mapping(address => mapping(uint256 => uint256)) private userRentalIndexes;

    /* ─────────────────────────────── Events ─────────────────────────────── */
    event BookListed(
        uint256 indexed id,
        address indexed owner,
        string title,
        uint256 pricePerDay,
        uint256 lateFeePerDay,
        uint256 deposit
    );
    
    event BookRented(
        uint256 indexed id,
        address indexed renter,
        uint256 rentedAt,
        uint256 daysBooked,
        uint256 dueAt          // rentedAt + daysBooked·1day
    );
    
    event BookReturned(
        uint256 indexed id,
        address indexed renter,
        uint256 daysUsed,
        uint256 lateDays,
        uint256 ownerPaid,     // how much owner received
        uint256 renterRefund   // deposit refund after any deductions
    );

    /* ───────────────────────────── List Book ────────────────────────────── */
    /// Any address can add books to the catalogue.
    function listBook(
        string calldata title,
        string calldata description,
        string calldata image,
        uint256 pricePerDay,
        uint256 lateFeePerDay,
        uint256 deposit
    ) external {
        // Use unchecked for gas optimization on incrementing
        unchecked {
            // Group similar validations to save gas
            require(bytes(title).length > 0 && 
                    bytes(description).length > 0 && 
                    bytes(image).length > 0, "empty field");
                    
            require(pricePerDay > 0, "price = 0");
            require(lateFeePerDay > 0, "late fee = 0");
            require(deposit > 0, "deposit = 0");
            
            // Safety check
            require(deposit >= lateFeePerDay, "deposit must cover at least one day of late fees");
    
            _bookIds.increment();
            uint256 id = _bookIds.current();
    
            books[id] = Book({
                id: id,
                title: title,
                description: description,
                image: image,
                pricePerDay: pricePerDay,
                lateFeePerDay: lateFeePerDay,
                deposit: deposit,
                owner: msg.sender,     // the book lister
                renter: address(0),
                rentedAt: 0,
                daysBooked: 0,
                isRented: false,
                rentCostPaid: 0
            });
    
            emit BookListed(id, msg.sender, title, pricePerDay, lateFeePerDay, deposit);
        }
    }

    /* ───────────────────────────── Rent Book ────────────────────────────── */
    function rentBook(uint256 bookId, uint256 daysRequested)
        external
        payable
        nonReentrant
    {
        require(daysRequested > 0, "days = 0");
        require(daysRequested <= MAX_RENTAL_DAYS, "exceeds maximum rental period");

        Book storage b = books[bookId];
        require(b.id != 0, "book not found");
        require(!b.isRented, "already rented");
        require(msg.sender != b.owner, "owner cannot rent");

        // Use unchecked for gas optimization where overflow is impossible
        unchecked {
            uint256 rentCost = b.pricePerDay * daysRequested;
            uint256 total = b.deposit + rentCost;
            require(msg.value == total, "wrong ETH sent");
    
            // Book is being rented
            b.renter = msg.sender;
            b.isRented = true;
            b.rentedAt = block.timestamp;
            b.daysBooked = daysRequested;
            b.rentCostPaid = rentCost;
            
            // Track this rental for the user - O(1) operations
            userRentals[msg.sender][bookId] = true;
            
            // Track array position for faster removals later
            uint256 arrLen = userRentalIds[msg.sender].length;
            userRentalIndexes[msg.sender][bookId] = arrLen;
            userRentalIds[msg.sender].push(bookId);
            
            // Pay the book owner immediately for the rental cost
            payable(b.owner).sendValue(rentCost);
    
            emit BookRented(
                bookId,
                msg.sender,
                b.rentedAt,
                daysRequested,
                b.rentedAt + daysRequested * SECONDS_PER_DAY
            );
        }
    }

    /* ──────────────────────────── Return Book ───────────────────────────── */
    function returnBook(uint256 bookId) external nonReentrant {
        Book storage b = books[bookId];
        require(b.isRented, "not rented");
        require(b.renter == msg.sender, "only renter");

        uint256 nowTs = block.timestamp;
        
        // Optimize calculation with unchecked and constant
        uint256 daysUsed;
        unchecked {
            daysUsed = ((nowTs - b.rentedAt) + SECONDS_PER_DAY - 1) / SECONDS_PER_DAY;
        }

        /* -------- Late-return calculation -------- */
        uint256 lateDays = 0;
        if (daysUsed > b.daysBooked) {
            unchecked {
                lateDays = daysUsed - b.daysBooked;
            }
        }
        
        /* -------- Payouts -------- */
        uint256 lateFees = 0;
        uint256 actualLateFees = 0;
        uint256 ownerPaid = 0;
        uint256 renterRefund = b.deposit;
        
        // Only calculate fees if late
        if (lateDays > 0) {
            unchecked {
                lateFees = lateDays * b.lateFeePerDay;
                
                // Cap late fees at deposit amount
                actualLateFees = lateFees > b.deposit ? b.deposit : lateFees;
                ownerPaid = actualLateFees;
                renterRefund = b.deposit - actualLateFees;
            }
        }

        // Update state before external calls
        _removeRental(msg.sender, bookId);
        
        // Reset book state
        b.isRented = false;
        b.renter = address(0);
        b.rentedAt = 0;
        b.daysBooked = 0;
        b.rentCostPaid = 0;

        // External calls after state changes
        if (lateDays > 0 && ownerPaid > 0) {
            payable(b.owner).sendValue(ownerPaid);
        }
        
        if (renterRefund > 0) {
            payable(msg.sender).sendValue(renterRefund);
        }

        emit BookReturned(
            bookId,
            msg.sender,
            daysUsed,
            lateDays,
            ownerPaid, // Only late fees
            renterRefund
        );
    }

    /* ─────────────────────────────── Views ──────────────────────────────── */
    // Get total number of books listed
    function totalBooks() external view returns (uint256) {
        return _bookIds.current();
    }
    
    // Get book details
    function getBookDetails(uint256 bookId) external view returns (
        string memory,   // title
        uint256,         // pricePerDay
        uint256,         // deposit
        address,         // owner
        address,         // renter
        uint256,         // rentedAt
        bool             // isAvailable
    ) {
        Book storage b = books[bookId];
        require(b.id != 0, "book not found");
        
        return (
            b.title,
            b.pricePerDay,
            b.deposit,
            b.owner,
            b.renter,
            b.rentedAt,
            !b.isRented  // isAvailable is the opposite of isRented
        );
    }
    
    // Check if a user has rented a specific book
    function hasUserRented(address user, uint256 bookId) external view returns (bool) {
        return userRentals[user][bookId];
    }
    
    // Get all books rented by a user - slightly more expensive but used less frequently
    function getUserRentals(address user) external view returns (uint256[] memory) {
        return userRentalIds[user];
    }
    
    // Helper function to calculate when a book is due
    function getDueDate(uint256 bookId) external view returns (uint256) {
        Book storage b = books[bookId];
        require(b.isRented, "book not rented");
        
        unchecked {
            return b.rentedAt + (b.daysBooked * SECONDS_PER_DAY);
        }
    }
    
    // Helper to check if a book is late
    function isBookLate(uint256 bookId) external view returns (bool, uint256) {
        Book storage b = books[bookId];
        if (!b.isRented) return (false, 0);
        
        unchecked {
            uint256 dueAt = b.rentedAt + (b.daysBooked * SECONDS_PER_DAY);
            if (block.timestamp > dueAt) {
                uint256 lateDays = ((block.timestamp - dueAt) + SECONDS_PER_DAY - 1) / SECONDS_PER_DAY;
                return (true, lateDays);
            }
            
            return (false, 0);
        }
    }
    
    /* ──────────────────────────── Internal ─────────────────────────────── */
    // Optimized: O(1) removal from user rentals tracking
    function _removeRental(address user, uint256 bookId) internal {
        // Set rental status to false
        if (userRentals[user][bookId]) {
            userRentals[user][bookId] = false;
            
            uint256 index = userRentalIndexes[user][bookId];
            uint256 lastIndex = userRentalIds[user].length - 1;
            
            // If not removing the last element, swap with the last one
            if (index != lastIndex) {
                uint256 lastBookId = userRentalIds[user][lastIndex];
                userRentalIds[user][index] = lastBookId;
                userRentalIndexes[user][lastBookId] = index;
            }
            
            // Remove the last element
            userRentalIds[user].pop();
            delete userRentalIndexes[user][bookId];
        }
    }
}