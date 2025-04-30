// pages/index.jsx
import { useState } from 'react'
import Head from 'next/head'
import { ZeroAddress } from 'ethers'  // v6 constant for 0x00…00

// Remove Category import if it's causing issues
// import Category from '@/components/Category'
import Collection from '@/components/Collection'
import SearchBar from '@/components/SearchBar'

import { getBooks } from '@/services/blockchain'
import { defaultBooks } from '@/data/defaultBooks'

export default function Home({ books = [] }) {
  // fall back to demo set if the chain is empty / offline
  const allBooks = books.length ? books : defaultBooks
  
  // Add state for filtered books
  const [filteredBooks, setFilteredBooks] = useState(allBooks)
  
  // Handle search functionality
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredBooks(allBooks)
      return
    }
    
    const filtered = allBooks.filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredBooks(filtered)
  }

  return (
    <>
      <Head>
        <title>BookBnB | Rent your reads</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Add SearchBar component */}
      <div className="container mx-auto px-4 py-8">
        <SearchBar onSearch={handleSearch} />
      </div>
      
      {/* Removed Category component until fixed */}
      {/* <Category /> */}
      
      <Collection books={filteredBooks} />
    </>
  )
}

/**
 * Server-side: ensure everything is JSON-serialisable before sending to the client.
 */
export const getServerSideProps = async () => {
  try {
    const raw = await getBooks()
    
    const books = raw.map((b, i) => ({
      // BigInt ➜ Number is already done inside getBooks(), so just pass through.
      id: b.id ?? i,
      pricePerDay: b.pricePerDay ?? 0,
      lateFeePerDay: b.lateFeePerDay ?? 0,
      deposit: b.deposit ?? 0,
      
      // Rental information
      rentedAt: b.rentedAt ?? 0,
      daysBooked: b.daysBooked ?? 0,
      rentCostPaid: b.rentCostPaid ?? 0,
      
      // simple strings
      title: b.title ?? '',
      description: b.description ?? '',
      image: b.image ?? '',
      
      // booleans / addresses
      isRented: !!b.isRented,
      owner: b.owner ?? ZeroAddress,
      renter: b.renter ?? ZeroAddress,
    }))
    
    return { props: { books } }
  } catch (err) {
    console.warn('[BookBnB] chain fetch failed → falling back to demo data', err)
    return { props: { books: [] } }
  }
}