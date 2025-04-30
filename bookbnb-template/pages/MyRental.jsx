// pages/myrentals.jsx
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import Collection from '@/components/Collection'
import { getBooks } from '@/services/blockchain'

export default function MyRentals() {
  const { address, isConnected } = useAccount()
  const [books,  setBooks]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected) {
      setBooks([])
      setLoading(false)
      return
    }

    async function fetchAndFilter() {
      setLoading(true)
      try {
        // 1) Fetch all books
        const raw = await getBooks()

        // 2) Normalize raw → plain JS objects (if needed)
        const allBooks = raw.map((b, i) => ({
          id:            b.id            ?? i,
          title:         b.title         ?? '',
          description:   b.description   ?? '',
          image:         b.image         ?? '',
          pricePerDay:   b.pricePerDay   ?? 0,
          lateFeePerDay: b.lateFeePerDay ?? 0,
          deposit:       b.deposit       ?? 0,
          rentedAt:      b.rentedAt      ?? 0,
          daysBooked:    b.daysBooked    ?? 0,
          rentCostPaid:  b.rentCostPaid  ?? 0,
          isRented:      !!b.isRented,
          owner:         b.owner         ?? '',
          renter:        b.renter        ?? ''
        }))

        // 3) Filter to only those you’ve rented
        const myRented = allBooks.filter(
          (book) =>
            book.isRented &&
            book.renter.toLowerCase() === address.toLowerCase()
        )

        setBooks(myRented)
      } catch (err) {
        console.error('Failed to fetch/filter books:', err)
        setBooks([])
      } finally {
        setLoading(false)
      }
    }

    fetchAndFilter()
  }, [address, isConnected])

  return (
    <>
      <Head>
        <title>My Rentals | BookBnB</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">My Rentals</h1>

        {loading && <p>Loading your rentals…</p>}

        {!loading && !isConnected && (
          <p>Please connect your wallet to see your rentals.</p>
        )}

        {!loading && isConnected && books.length === 0 && (
          <p>You haven’t rented any books yet.</p>
        )}

        {!loading && books.length > 0 && (
          <Collection books={books} />
        )}
      </main>
    </>
  )
}
