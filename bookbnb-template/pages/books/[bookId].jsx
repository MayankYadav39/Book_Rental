// pages/books/[bookId].jsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAccount } from 'wagmi';

import {
  getBook,
  getUserRentals,
  getDueDate,
  isBookLate,
  rentBook,
  returnBook,
  getMaxRentalDays
} from '@/services/blockchain';

import { defaultBooks } from '@/data/defaultBooks';
import { globalActions } from '@/store/globalSlices';
import { toast } from 'react-toastify';

import {
  Title,
  ImageGrid,
  Description,
  Actions
} from '@/components';

// ---------------------------------------------------------------------------
//  React component
// ---------------------------------------------------------------------------
export default function Book({
  bookData,
  maxRentalDays
}) {
  const dispatch = useDispatch();
  const { address } = useAccount();
  const router = useRouter();
  const { bookId } = router.query;

  const [loading, setLoading] = useState(false);
  const [daysToRent, setDaysToRent] = useState(1);
  const [dueDate, setDueDate] = useState(null);
  const [lateInfo, setLateInfo] = useState({ late: false, days: 0 });

  const { setBook } = globalActions;
  const { book } = useSelector((state) => state.globalStates);

  // push SSR data into Redux once on mount
  useEffect(() => {
    dispatch(setBook(bookData));
  }, [dispatch, setBook, bookData]);

  // Fetch additional data if book is rented
  useEffect(() => {
    const fetchBookStatus = async () => {
      if (book?.isRented) {
        try {
          // Get due date
          const dueDateTimestamp = await getDueDate(bookId);
          if (dueDateTimestamp) {
            setDueDate(new Date(dueDateTimestamp * 1000));
          }

          // Check if book is late
          const lateStatus = await isBookLate(bookId);
          setLateInfo(lateStatus);
        } catch (error) {
          console.error("Error fetching book status:", error);
        }
      }
    };

    if (book?.id && book?.isRented) {
      fetchBookStatus();
    }
  }, [book, bookId]);

  const handleRentBook = async (e) => {
    e.preventDefault();
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (daysToRent < 1 || daysToRent > maxRentalDays) {
      toast.error(`Rental period must be between 1 and ${maxRentalDays} days`);
      return;
    }

    setLoading(true);
    try {
      await toast.promise(
        rentBook(bookId, daysToRent).then(() => {
          router.reload();
        }),
        {
          pending: 'Processing rental transaction...',
          success: 'Book rented successfully!',
          error: 'Failed to rent book. Please try again.'
        }
      );
    } catch (error) {
      console.error("Error renting book:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      await toast.promise(
        returnBook(bookId).then(() => {
          router.reload();
        }),
        {
          pending: 'Processing return transaction...',
          success: 'Book returned successfully!',
          error: 'Failed to return book. Please try again.'
        }
      );
    } catch (error) {
      console.error("Error returning book:", error);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = address && book?.owner && address.toLowerCase() === book.owner.toLowerCase();
  const isRenter = address && book?.renter && address.toLowerCase() === book.renter.toLowerCase();
  const canRent = !book?.isRented && !isOwner && address;
  const canReturn = isRenter && book?.isRented;

  // Calculate total rental cost
  const rentalCost = book?.pricePerDay ? book.pricePerDay * daysToRent : 0;
  const totalCost = book?.deposit ? rentalCost + book.deposit : 0;

  return (
    <>
      <Head>
        <title>{book?.title || 'Book'} | BookBnB</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="py-8 px-4 sm:px-10 md:px-32 max-w-7xl mx-auto space-y-8">
        <Title book={book} />
        
        {/* Book Image */}
        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
          <img 
            src={book?.image || '/placeholder-book.png'} 
            alt={book?.title || 'Book cover'} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Book Details */}
        <Description book={book} />
        
        {/* Rental Status */}
        {book?.isRented && (
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Rental Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Rented by</p>
                <p>{book.renter ? `${book.renter.slice(0, 6)}...${book.renter.slice(-4)}` : 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Rental period</p>
                <p>{book.daysBooked || 0} days</p>
              </div>
              {dueDate && (
                <div>
                  <p className="text-gray-500 text-sm">Due date</p>
                  <p>{dueDate.toLocaleDateString()}</p>
                </div>
              )}
              {lateInfo.late && (
                <div>
                  <p className="text-gray-500 text-sm">Late by</p>
                  <p className="text-red-600 font-medium">{lateInfo.days} days</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Price Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <p className="text-gray-500 text-sm">Price per day</p>
            <p className="text-xl font-bold">{book?.pricePerDay || 0} ETH</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <p className="text-gray-500 text-sm">Late fee per day</p>
            <p className="text-xl font-bold">{book?.lateFeePerDay || 0} ETH</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <p className="text-gray-500 text-sm">Security deposit</p>
            <p className="text-xl font-bold">{book?.deposit || 0} ETH</p>
          </div>
        </div>
        
        {/* Actions for Owner */}
        {isOwner && <Actions book={book} />}
        
        {/* Rent Form */}
        {canRent && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Rent this Book</h3>
            <form onSubmit={handleRentBook}>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-1/3">
                  <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">
                    Rental Period (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxRentalDays}
                    id="days"
                    value={daysToRent}
                    onChange={(e) => setDaysToRent(parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>
                
                <div className="w-full sm:w-2/3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-[#ff385c] text-white py-2 px-4 rounded-lg 
                    hover:bg-red-600 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Processing...' : `Rent for ${daysToRent} day${daysToRent !== 1 ? 's' : ''} (${totalCost.toFixed(4)} ETH)`}
                  </button>
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  Total cost includes: {book?.pricePerDay || 0} ETH/day × {daysToRent} day{daysToRent !== 1 ? 's' : ''} = {rentalCost.toFixed(4)} ETH + {book?.deposit || 0} ETH deposit 
                  (refundable upon return)
                </p>
              </div>
            </form>
          </div>
        )}
        
        {/* Return Button */}
        {canReturn && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Return this Book</h3>
            <div className="flex flex-col space-y-4">
              <p className="text-sm text-gray-600">
                When you return the book, you'll receive your deposit back minus any applicable late fees.
                {lateInfo.late && ` You are currently ${lateInfo.days} day${lateInfo.days !== 1 ? 's' : ''} late.`}
              </p>
              <button
                onClick={handleReturnBook}
                disabled={loading}
                className={`bg-blue-600 text-white py-2 px-4 rounded-lg 
                hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : 'Return Book'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
//  getServerSideProps – runs on every request
// ---------------------------------------------------------------------------
export const getServerSideProps = async ({ params }) => {
  const { bookId } = params;

  try {
    // 1. Primary source: on-chain
    const book = await getBook(bookId);

    // 2. Fallback: demo record with the same id
    const bookData = book?.title
      ? book
      : defaultBooks.find((b) => b.id === Number(bookId)) ?? null;

    // 3. Get max rental days from contract
    const maxRentalDays = await getMaxRentalDays();

    // If no book found, return 404
    if (!bookData) {
      return {
        notFound: true
      };
    }

    return {
      props: {
        bookData: JSON.parse(JSON.stringify(bookData)),
        maxRentalDays: maxRentalDays || 30  // Default to 30 if fetch fails
      }
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    
    // Try to get from defaultBooks if blockchain fetch fails
    const fallbackBook = defaultBooks.find((b) => b.id === Number(bookId));
    
    if (fallbackBook) {
      return {
        props: {
          bookData: JSON.parse(JSON.stringify(fallbackBook)),
          maxRentalDays: 30 // Default value
        }
      };
    }
    
    return {
      notFound: true
    };
  }
};