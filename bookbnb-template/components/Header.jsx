import React from 'react'
import Link from 'next/link'
import { FaBook } from 'react-icons/fa'
import { ConnectBtn } from '.'

const Header = () => {
  return (
    <header
      className="flex justify-between items-center p-4 px-8
    sm:px-10 md:px-20 border-b-2 border-b-slate-200 w-full"
    >
      <Link href={'/'}>
        <p className="text-[#ff385c] flex items-center text-xl font-medium">
          <FaBook className="mr-2" />
          BookRental
        </p>
      </Link>

      <ButtonGroup />
      <ConnectBtn />
    </header>
  )
}

const ButtonGroup = () => {
  return (
    <div
      className="md:flex hidden items-center justify-center border-gray-300
      border overflow-hidden rounded-full cursor-pointer"
    >
      <div className="inline-flex" role="group">
        <Link href="/">
          <button
            className="
              rounded-l-full
              px-5
              py-3
              text-[#ff385c]
              font-medium
              text-sm
              leading-tight
              hover:bg-black hover:bg-opacity-5
              focus:outline-none focus:ring-0
              transition
              duration-150
              ease-in-out
            "
          >
            All Books
          </button>
        </Link>

        <Link href="/books/add">
          <button
            type="button"
            className="
              px-5
              py-3 
              border-x border-gray-300
              text-[#ff385c]
              font-medium
              text-sm
              leading-tight
              hover:bg-black hover:bg-opacity-5
              focus:outline-none focus:ring-0
              transition
              duration-150
              ease-in-out
            "
          >
            List Book
          </button>
        </Link>

        <Link href="/MyRental">
          <button
            className="
              rounded-r-full
              px-5
              py-3
              text-[#ff385c]
              font-medium
              text-sm
              leading-tight
              hover:bg-black hover:bg-opacity-5
              focus:outline-none focus:ring-0
              transition
              duration-150
              ease-in-out
            "
          >
            My Rentals
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Header
