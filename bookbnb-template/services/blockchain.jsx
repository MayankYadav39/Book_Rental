// services/blockchain.jsx
import {
  ethers,
  BrowserProvider,
  JsonRpcProvider
} from 'ethers';

import address from '@/contracts/contractAddress.json';
import bookRentalAbi from '@/artifacts/contracts/BookRental.sol/BookRental.json';

// Helper functions for ETH/wei conversions
const toWei = (amount) => {
  if (amount === null || amount === undefined) return ethers.parseEther("0");
  return ethers.parseEther(amount.toString());
};

const fromWei = (weiAmount) => {
  if (!weiAmount) return 0;
  return Number(ethers.formatEther(weiAmount));
};

// Get provider based on environment
async function getProvider() {
  if (typeof window === 'undefined') {
    return new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  }
  
  if (!window.ethereum) {
    throw new Error("No Ethereum provider found. Please install MetaMask.");
  }
  
  return new BrowserProvider(window.ethereum);
}

// Get contract instance
async function getContract() {
  try {
    const provider = await getProvider();
    const signerOrProvider = typeof window === 'undefined' 
      ? provider 
      : await provider.getSigner();
    
    return new ethers.Contract(
      address.bookRentalContract,
      bookRentalAbi.abi,
      signerOrProvider
    );
  } catch (error) {
    console.error("Error getting contract instance:", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                              READ operations                              */
/* -------------------------------------------------------------------------- */

/**
 * Get total number of books
 */
export async function getTotalBooks() {
  try {
    const contract = await getContract();
    console.log("Contract address:", contract.target);
    
    // Try to manually handle the call
    const provider = await getProvider();
    const data = contract.interface.encodeFunctionData("totalBooks", []);
    const result = await provider.call({
      to: contract.target,
      data: data
    });
    
    console.log("Raw result:", result);
    
    if (result === "0x") {
      console.log("Empty result returned, possibly new contract with no books");
      return 0;
    }
    
    const total = contract.interface.decodeFunctionResult("totalBooks", result);
    console.log("Decoded result:", total);
    return Number(total[0]);
  } catch (error) {
    console.error("Error getting total books:", error);
    return 0; // Return 0 as a fallback
  }
}

/**
 * Fetch all books
 */
export async function getBooks() {
  try {
    const contract = await getContract();
    const total = await getTotalBooks();
    const books = [];
    
    for (let i = 1; i <= total; i++) {
      try {
        const book = await contract.books(i);
        books.push({
          id: Number(book.id),
          title: book.title,
          description: book.description,
          image: book.image,
          pricePerDay: fromWei(book.pricePerDay),
          lateFeePerDay: fromWei(book.lateFeePerDay),
          deposit: fromWei(book.deposit),
          owner: book.owner,
          renter: book.renter,
          rentedAt: Number(book.rentedAt),
          daysBooked: Number(book.daysBooked),
          isRented: book.isRented,
          rentCostPaid: fromWei(book.rentCostPaid)
        });
      } catch (err) {
        console.error(`Error fetching book ${i}:`, err);
      }
    }
    
    return books;
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

/**
 * Fetch a single book by ID
 */
export async function getBook(id) {
  try {
    const contract = await getContract();
    const book = await contract.books(id);
    
    return {
      id: Number(book.id),
      title: book.title,
      description: book.description,
      image: book.image,
      pricePerDay: fromWei(book.pricePerDay),
      lateFeePerDay: fromWei(book.lateFeePerDay),
      deposit: fromWei(book.deposit),
      owner: book.owner,
      renter: book.renter,
      rentedAt: Number(book.rentedAt),
      daysBooked: Number(book.daysBooked),
      isRented: book.isRented,
      rentCostPaid: fromWei(book.rentCostPaid)
    };
  } catch (error) {
    console.error(`Error fetching book ${id}:`, error);
    return null;
  }
}

/**
 * Get book details (uses the contract's view function)
 */
export async function getBookDetails(bookId) {
  try {
    const contract = await getContract();
    const [
      title,
      pricePerDay,
      deposit,
      owner,
      renter,
      rentedAt,
      isAvailable
    ] = await contract.getBookDetails(bookId);
    
    return {
      title,
      pricePerDay: fromWei(pricePerDay),
      deposit: fromWei(deposit),
      owner,
      renter,
      rentedAt: Number(rentedAt),
      isAvailable
    };
  } catch (error) {
    console.error(`Error getting book details for ${bookId}:`, error);
    return null;
  }
}

/**
 * Check if user has rented a specific book
 */
export async function hasUserRented(user, bookId) {
  try {
    const contract = await getContract();
    return await contract.hasUserRented(user, bookId);
  } catch (error) {
    console.error(`Error checking if user ${user} rented book ${bookId}:`, error);
    return false;
  }
}

/**
 * Get all books rented by a user
 */
export async function getUserRentals(user) {
  try {
    const contract = await getContract();
    const rentals = await contract.getUserRentals(user);
    return rentals.map(id => Number(id));
  } catch (error) {
    console.error(`Error getting rentals for user ${user}:`, error);
    return [];
  }
}

/**
 * Get due date for a rented book
 */
export async function getDueDate(bookId) {
  try {
    const contract = await getContract();
    const dueDate = await contract.getDueDate(bookId);
    return Number(dueDate);
  } catch (error) {
    console.error(`Error getting due date for book ${bookId}:`, error);
    return null;
  }
}

/**
 * Check if a book is late
 */
export async function isBookLate(bookId) {
  try {
    const contract = await getContract();
    const [isLate, lateDays] = await contract.isBookLate(bookId);
    return {
      late: isLate,
      days: Number(lateDays)
    };
  } catch (error) {
    console.error(`Error checking if book ${bookId} is late:`, error);
    return { late: false, days: 0 };
  }
}

/**
 * Get maximum rental days
 */
export async function getMaxRentalDays() {
  try {
    const contract = await getContract();
    const maxDays = await contract.MAX_RENTAL_DAYS();
    return Number(maxDays);
  } catch (error) {
    console.error("Error getting max rental days:", error);
    return 30; // Default fallback
  }
}

/* -------------------------------------------------------------------------- */
/*                         WRITE operations (browser only)                    */
/* -------------------------------------------------------------------------- */

/**
 * List a new book
 */
export async function createBook(bookData) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("No Ethereum provider found. Please install MetaMask.");
  }
  
  try {
    const { title, description, image, pricePerDay, lateFeePerDay, deposit } = bookData;
    
    // Input validation
    if (!title || !description || !image) {
      throw new Error("Missing required book information");
    }
    
    if (!pricePerDay || !lateFeePerDay || !deposit) {
      throw new Error("Price, late fee, and deposit must be valid numbers");
    }
    
    const contract = await getContract();
    
    // Convert to wei
    const priceInWei = toWei(pricePerDay);
    const lateFeeInWei = toWei(lateFeePerDay);
    const depositInWei = toWei(deposit);
    
    console.log("Listing book with parameters:", {
      title,
      description,
      image,
      pricePerDay: priceInWei.toString(),
      lateFeePerDay: lateFeeInWei.toString(),
      deposit: depositInWei.toString()
    });
    
    // Call the contract method directly, with exact parameter ordering
    const tx = await contract.listBook(
      title,
      description,
      image,
      priceInWei,
      lateFeeInWei,
      depositInWei
    );
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Book listed successfully:", receipt);
    return receipt;
  } catch (error) {
    console.error("Error listing book:", error);
    throw error;
  }
}

/**
 * Rent a book for specified days
 */
export async function rentBook(bookId, daysRequested) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("No Ethereum provider found. Please install MetaMask.");
  }
  
  try {
    const contract = await getContract();
    const book = await contract.books(bookId);
    
    // Calculate total cost
    const rentCost = book.pricePerDay * BigInt(daysRequested);
    const totalCost = book.deposit + rentCost;
    
    console.log("Renting book with parameters:", {
      bookId,
      daysRequested,
      rentCost: rentCost.toString(),
      deposit: book.deposit.toString(),
      totalCost: totalCost.toString()
    });
    
    // Execute the transaction
    const tx = await contract.rentBook(bookId, daysRequested, {
      value: totalCost
    });
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Book rented successfully:", receipt);
    return receipt;
  } catch (error) {
    console.error(`Error renting book ${bookId}:`, error);
    throw error;
  }
}

/**
 * Return a book
 */
export async function returnBook(bookId) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("No Ethereum provider found. Please install MetaMask.");
  }
  
  try {
    const contract = await getContract();
    
    console.log(`Returning book ${bookId}`);
    
    // Execute the transaction
    const tx = await contract.returnBook(bookId);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Book returned successfully:", receipt);
    return receipt;
  } catch (error) {
    console.error(`Error returning book ${bookId}:`, error);
    throw error;
  }
}