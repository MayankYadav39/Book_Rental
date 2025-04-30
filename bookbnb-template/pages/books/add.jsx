import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { createBook } from '@/services/blockchain'

export default function AddBook() {
  const { address } = useAccount()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [lateFeePerDay, setLateFeePerDay] = useState('')
  const [deposit, setDeposit] = useState('')
  const router = useRouter()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !description || !image || !pricePerDay || !lateFeePerDay || !deposit) {
      toast.error('Please fill in all fields')
      return
    }
    
    // Check if deposit is greater than or equal to late fee (contract requirement)
    if (parseFloat(deposit) < parseFloat(lateFeePerDay)) {
      toast.error('Deposit must be greater than or equal to late fee per day')
      return
    }
    
    const params = { 
      title, 
      description, 
      image, 
      pricePerDay, 
      lateFeePerDay, 
      deposit 
    }
    
    try {
      await toast.promise(
        createBook(params).then(() => router.push('/')),
        {
          pending: 'Listing book...',
          success: 'Book listed successfully 👌',
          error: 'Failed to list book 🤯',
        }
      )
    } catch (error) {
      console.error('Error listing book:', error)
    }
  }
  
  return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">List a Book</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded p-2 focus:outline-none"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded p-2 focus:outline-none h-24 resize-none"
            required
          />
          <input
            type="url"
            name="image"
            placeholder="Cover Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="border border-gray-300 rounded p-2 focus:outline-none"
            required
          />
          <input
            type="number"
            step="0.01"
            min="0"
            name="pricePerDay"
            placeholder="Price per day (ETH)"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
            className="border border-gray-300 rounded p-2 focus:outline-none"
            required
          />
          <input
            type="number"
            step="0.01"
            min="0"
            name="lateFeePerDay"
            placeholder="Late fee per day (ETH)"
            value={lateFeePerDay}
            onChange={(e) => setLateFeePerDay(e.target.value)}
            className="border border-gray-300 rounded p-2 focus:outline-none"
            required
          />
          <input
            type="number"
            step="0.01"
            min="0"
            name="deposit"
            placeholder="Deposit (ETH)"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            className="border border-gray-300 rounded p-2 focus:outline-none"
            required
          />
          
          <div className="text-sm text-gray-500">
            Note: Deposit must be greater than or equal to late fee per day
          </div>
          
          <button
            type="submit"
            className={`w-full text-white bg-[#ff385c] py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50`}
            disabled={!address}
          >
            List Book
          </button>
        </form>
      </div>
    </div>
  )
}