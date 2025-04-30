import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { createBook } from '@/services/blockchain'

export default function AddBook() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    pricePerDay: '',
    deposit: '',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { title, description, image, pricePerDay, deposit } = form
    if (!title || !description || !image || !pricePerDay || !deposit) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      await createBook({ title, description, image, pricePerDay, deposit })
      toast.success('Book listed successfully!')
      // Navigate back to home, triggering getServerSideProps
      router.push('/')
    } catch (err) {
      console.error('Listing error:', err)
      toast.error('Failed to list book')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">List a New Book</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="border p-2"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2"
        />
        <input
          name="image"
          value={form.image}
          onChange={handleChange}
          placeholder="Image URL"
          className="border p-2"
        />
        <input
          name="pricePerDay"
          value={form.pricePerDay}
          onChange={handleChange}
          placeholder="Price per day (ETH)"
          type="number"
          step="0.01"
          className="border p-2"
        />
        <input
          name="deposit"
          value={form.deposit}
          onChange={handleChange}
          placeholder="Deposit (ETH)"
          type="number"
          step="0.01"
          className="border p-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Listing...' : 'List Book'}
        </button>
      </form>
    </div>
  )
}
