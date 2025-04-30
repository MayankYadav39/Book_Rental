import React from 'react'
import Link from 'next/link'
import { FaStar } from 'react-icons/fa'
import { FaEthereum } from 'react-icons/fa'
import { formatDate } from '@/utils/helper'

// Renamed prop from `appartment` to `book`
const Card = ({ book }) => {
  // Compute formatted due date if rented
  let dueDisplay = ''
  if (book.isRented) {
    // Calculate due date based on rentedAt and daysBooked
    // rentedAt is Unix timestamp in seconds, need to convert to milliseconds
    const rentedAtMs = Number(book.rentedAt) * 1000
    const daysBookedMs = Number(book.daysBooked) * 24 * 60 * 60 * 1000
    const dueDateMs = rentedAtMs + daysBookedMs
    
    // Format date as MM/DD/YY
    const dueDate = new Date(dueDateMs)
    const month = dueDate.getMonth() + 1 // getMonth() is 0-indexed
    const day = dueDate.getDate()
    const year = dueDate.getFullYear().toString().substr(-2) // Get last 2 digits of year
    
    dueDisplay = `${month}/${day}/${year}`
  }

  return (
    <div className="shadow-md w-96 text-xl pb-5 rounded-b-2xl mb-20">
      <Link href={`/books/${book.id}`}> {/* Updated route */}
        <img
          src={book.image}   // single cover image URL
          alt={book.title}
          className="w-full h-64 object-cover rounded-t-2xl"
        />
      </Link>
      <div className="px-4">
        <div className="flex justify-between items-start mt-2">
          <p className="font-semibold capitalize text-[15px]">{book.title}</p>
          <p className="flex items-center space-x-1 text-sm">
            <FaStar />
            <span>
              {book.isRented ? 'Not Available' : 'Available'}
            </span>
          </p>
        </div>
        <div className="flex justify-between items-center text-sm">
          {book.isRented ? (
            <div>
        
              <p className="text-gray-700">{dueDisplay}</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 text-sm">&nbsp;</p>
              <p className="text-gray-700">&nbsp;</p>
            </div>
          )}
          <b className="flex items-center space-x-1 font-semibold">
            <FaEthereum />
            <span>{book.pricePerDay} / day</span> {/* Updated label */}
          </b>
        </div>
      </div>
    </div>
  )
}

export default Card