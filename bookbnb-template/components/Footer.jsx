import React from 'react'

const Footer = () => {
  return (
    <div
      className="fixed left-0 right-0 bottom-0 px-20 py-6 flex flex-col sm:flex-row
    justify-center items-center sm:justify-between bg-white border-t-2 border-t-slate-200 z-50"
    >
      <p className="flex space-x-4 items-center text-gray-600 text-lg font-medium">
        BookRental
      </p>
      <div className="flex space-x-4 justify-center items-center font-semibold text-sm">
        <p>
          &copy;{new Date().getFullYear()}{' '}
          <span className="text-gray-600 font-semibold">Anchit Sinha.</span> All rights reserved
        </p>
      </div>
    </div>
  )
}

export default Footer
