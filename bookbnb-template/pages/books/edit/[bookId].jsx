import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { ZeroAddress } from 'ethers'
import Link from 'next/link'
import { FaEthereum, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa'
import { MdOutlineCheckCircle, MdOutlinePendingActions } from 'react-icons/md'

import { 
  getBook, 
  rentBook, 
  returnBook, 
  getDueDate, 
  isBookLate,
  getMaxRentalDays
} from '@/services/blockchain'

// Import Actions component if you have it
import Actions from '@/components/Actions'

export default function BookDetails({ book }) {
  const { address } = useAccount()
  const [days, setDays] = useState(1)
  const [loading, setLoading] = useState(false)
  const [dueDate, setDueDate] = useState(null)
  const [lateInfo, setLateInfo] = useState({ late: false, days: 0 })
  const [maxDays, setMaxDays] = useState(30)
  const router = useRouter()

  useEffect(() => {
    // If book is rented, get due date and late status
    const fetchAdditionalInfo = async () => {
      try {
        if (book.isRented) {
          const dueDateTimestamp = await getDueDate(book.id)
          setDueDate(dueDateTimestamp ? new Date(dueDateTimestamp * 1000) : null)
          
          const lateStatus = await isBookLate(book.id)
          setLateInfo(lateStatus)
        }
        
        // Get max rental days from contract
        const maxRentalDays = await getMaxRentalDays()
        setMaxDays(maxRentalDays)
      } catch (err) {
        console.error("Error fetching additional book info:", err)
      }
    }
    
    fetchAdditionalInfo()
  }, [book.id, book.isRented])

  const handleRent = async (e) => {
    e.preventDefault()
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }
    
    if (days < 1 || days > maxDays) {
      toast.error(`Rental period must be between 1 and ${maxDays} days`)
      return
    }
    
    setLoading(true)
    
    try {
      await toast.promise(
        rentBook(book.id, days).then(() => {
          router.reload()
        }),
        {
          pending: 'Processing rental transaction...',
          success: 'Book rented successfully 👌',
          error: 'Failed to rent book 🤯'
        }
      )
    } catch (err) {
      console.error("Error renting book:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }
    
    setLoading(true)
    
    try {
      await toast.promise(
        returnBook(book.id).then(() => {
          router.reload()
        }),
        {
          pending: 'Processing return transaction...',
          success: 'Book returned successfully 👌',
          error: 'Failed to return book 🤯'
        }
      )
    } catch (err) {
      console.error("Error returning book:", err)
    } finally {
      setLoading(false)
    }
  }

  const isOwner = address && address.toLowerCase() === book.owner.toLowerCase()
  const isRenter = address && address.toLowerCase() === book.renter.toLowerCase()
  const canReturn = isRenter && book.isRented
  const canRent = !book.isRented && !isOwner && address

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Book Image */}
        <div className="md:w-1/3">
          <img 
            src={book.image || '/placeholder-book.jpg'} 
            alt={book.title}
            className="w-full h-auto object-cover rounded-lg shadow-md"
          />
        </div>
        
        {/* Book Details */}
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{book.title}</h1>
          
          {/* Owner Info */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Listed by: {book.owner.slice(0, 6)}...{book.owner.slice(-4)}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className="mb-4">
            {book.isRented ? (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center w-fit">
                <MdOutlinePendingActions className="mr-1" />
                Currently Rented
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center w-fit">
                <MdOutlineCheckCircle className="mr-1" />
                Available
              </span>
            )}
          </div>
          
          {/* Price Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
              <p className="text-gray-500 text-sm">Price per day</p>
              <p className="text-xl font-bold flex items-center">
                <FaEthereum className="mr-1 text-gray-700" />
                {book.pricePerDay}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
              <p className="text-gray-500 text-sm">Late fee per day</p>
              <p className="text-xl font-bold flex items-center">
                <FaEthereum className="mr-1 text-gray-700" />
                {book.lateFeePerDay}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
              <p className="text-gray-500 text-sm">Security deposit</p>
              <p className="text-xl font-bold flex items-center">
                <FaEthereum className="mr-1 text-gray-700" />
                {book.deposit}
              </p>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{book.description}</p>
          </div>
          
          {/* Rental Info (if rented) */}
          {book.isRented && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold flex items-center mb-2">
                <FaCalendarAlt className="mr-2 text-gray-600" />
                Rental Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Rented by</p>
                  <p>{book.renter.slice(0, 6)}...{book.renter.slice(-4)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Rental period</p>
                  <p>{book.daysBooked} days</p>
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
          
          {/* Actions */}
          {isOwner && <Actions book={book} />}
          
          {/* Rent Form */}
          {canRent && (
            <form onSubmit={handleRent} className="mt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-1/3">
                  <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">
                    Rental Period (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxDays}
                    id="days"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
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
                    {loading ? 'Processing...' : `Rent for ${days} day${days !== 1 ? 's' : ''} (${(book.pricePerDay * days + book.deposit).toFixed(4)} ETH)`}
                  </button>
                </div>
              </div>
              
              <div className="mt-2 flex items-start text-sm text-gray-600">
                <FaInfoCircle className="mr-1 mt-0.5 flex-shrink-0" />
                <p>
                  Total cost includes: {book.pricePerDay} ETH/day × {days} day{days !== 1 ? 's' : ''} = {(book.pricePerDay * days).toFixed(4)} ETH + {book.deposit} ETH deposit 
                  (refundable upon return)
                </p>
              </div>
            </form>
          )}
          
          {/* Return Button */}
          {canReturn && (
            <button
              onClick={handleReturn}
              disabled={loading}
              className={`mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg 
              hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Return Book'}
            </button>
          )}
          
          {/* Back Button */}
          <div className="mt-8">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to all books
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps = async (context) => {
  try {
    const { bookId } = context.query
    const book = await getBook(bookId)
    
    if (!book || !book.title) {
      return {
        notFound: true
      }
    }
    
    return {
      props: {
        book: JSON.parse(JSON.stringify(book))
      }
    }
  } catch (error) {
    console.error("Error fetching book:", error)
    return {
      notFound: true
    }

    
  }
}