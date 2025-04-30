import moment from 'moment'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'
import { FaEthereum } from 'react-icons/fa'
import { rentBook, returnBook } from '@/services/blockchain'

const Calendar = ({ book, timestamps }) => {
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const { deposit } = book
  const { pricePerDay } = book

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate) return

    const s = moment(startDate)
    const eDate = moment(endDate)
    const dates = []
    while (s <= eDate) {
      dates.push(s.valueOf())
      s.add(1, 'days')
    }

    const total = deposit + pricePerDay * dates.length

    await toast.promise(
      rentBook({ bookId: book.id, timestamps: dates, value: total }),
      {
        pending: 'Approve rental transaction…',
        success: 'Book rented successfully 👌',
        error: 'Rental failed 🤯',
      }
    )
  }

  const resetForm = () => {
    setStartDate(null)
    setEndDate(null)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sm:w-[25rem] border p-6 border-gray-400 rounded-lg shadow-lg flex flex-col space-y-4"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <FaEthereum className="text-lg" />
          <span className="text-lg">
            {pricePerDay} <small>per day</small>
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <FaEthereum className="text-lg" />
          <span className="text-lg">
            {deposit} <small>deposit</small>
          </span>
        </div>
      </div>

      <DatePicker
        selected={startDate}
        onChange={setStartDate}
        placeholderText="Check-out date"
        dateFormat="yyyy-MM-dd"
        minDate={new Date()}
        excludeDates={timestamps}
        required
        className="rounded-lg w-full border border-gray-400 p-2"
      />
      <DatePicker
        selected={endDate}
        onChange={setEndDate}
        placeholderText="Return date"
        dateFormat="yyyy-MM-dd"
        minDate={startDate}
        excludeDates={timestamps}
        required
        className="rounded-lg w-full border border-gray-400 p-2"
      />

      <button
        type="submit"
        className="py-2 px-4 bg-gradient-to-l from-pink-600 to-gray-600 text-white rounded-md"
      >
        Rent Book
      </button>

      <Link href={`/books/bookings/${book.id}`} className="text-pink-500">
        View your rentals
      </Link>
    </form>
  )
}

export default Calendar
