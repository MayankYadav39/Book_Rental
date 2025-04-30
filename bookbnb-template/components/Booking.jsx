import Link from 'next/link'
import { useAccount } from 'wagmi'
import { toast } from 'react-toastify'
import Identicon from 'react-identicons'
import { formatDate, truncate } from '@/utils/helper'
import { rentBook, returnBook } from '@/services/blockchain'

export default function Booking({ booking, book }) {
  const { address } = useAccount()

  const handleRent = async () => {
    const value = booking.pricePerDay + book.deposit
    await toast.promise(
      rentBook({ bookId: book.id, value }),
      {
        pending: 'Approve rental tx…',
        success: 'Book rented 👍',
        error: 'Rental failed 😢',
      }
    )
  }

  const handleReturn = async () => {
    await toast.promise(
      returnBook(book.id),
      {
        pending: 'Approve return tx…',
        success: 'Book returned 👍',
        error: 'Return failed 😢',
      }
    )
  }

  const isPastDue = Date.now() > booking.rentUntil && !booking.returned

  return (
    <div className="flex justify-between items-center bg-gray-100 p-4 my-2 rounded-lg">
      <Link href={`/books/${book.id}`} className="flex items-center space-x-3">
        <Identicon string={booking.renter} size={30} className="rounded-full" />
        <div>
          <p>{formatDate(booking.rentStart)}</p>
          <p className="text-sm text-gray-500">{truncate(booking.renter, 4, 4, 11)}</p>
        </div>
      </Link>

      <div className="flex space-x-2">
        {address === booking.renter && !booking.returned && (
          <>
            <button
              onClick={handleReturn}
              className="px-3 py-1 bg-red-500 text-white rounded-full text-sm"
            >
              Return
            </button>
            <button
              onClick={handleRent}
              className="px-3 py-1 bg-green-500 text-white rounded-full text-sm"
            >
              Extend
            </button>
          </>
        )}

        {booking.returned && (
          <span className="px-3 py-1 bg-yellow-300 rounded-full text-sm">
            Returned
          </span>
        )}

        {isPastDue && !booking.returned && (
          <span className="px-3 py-1 bg-orange-400 rounded-full text-sm">
            Past Due
          </span>
        )}
      </div>
    </div>
  )
}
