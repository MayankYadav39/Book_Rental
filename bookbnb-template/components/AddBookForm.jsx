import { useState } from 'react'
import { createBook } from '@/services/blockchain'
import { useRouter } from 'next/router'

export default function AddBookForm() {
  const [form, setForm] = useState({
    title: '', 
    description: '', 
    image: '',
    price: '', 
    lateFee: '', 
    deposit: '',
  })
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  
  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })
  
  const handleSubmit = async e => {
    e.preventDefault()
    setBusy(true)
    try {
      await createBook({
        title: form.title,
        description: form.description,
        image: form.image,
        pricePerDay: form.price,
        lateFeePerDay: form.lateFee,
        deposit: form.deposit,
      })
      
      // force re-run of getServerSideProps
      router.replace(router.asPath)
    } catch (err) {
      console.error('Listing failed:', err)
      alert(err.message ?? 'Transaction rejected')
    } finally { 
      setBusy(false) 
    }
  }
  
  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 p-6 bg-white rounded-xl shadow w-full max-w-md"
    >
      <h2 className="text-xl font-bold text-gray-800">Add New Book</h2>
      
      {[
        { name: 'title', label: 'Title' },
        { name: 'description', label: 'Description' },
        { name: 'image', label: 'Image URL' },
        { name: 'price', label: 'Price per Day (ETH)' },
        { name: 'lateFee', label: 'Late Fee per Day (ETH)' },
        { name: 'deposit', label: 'Deposit (ETH)' }
      ].map(field => (
        <div key={field.name}>
          <label 
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {field.label}
          </label>
          <input
            id={field.name}
            required
            name={field.name}
            placeholder={field.label}
            value={form[field.name]}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
      ))}
      
      <div className="text-sm text-gray-500 mt-2">
        Note: The deposit must be greater than or equal to the late fee per day.
      </div>
      
      <button
        type="submit"
        disabled={busy}
        className={`mt-2 ${
          busy 
            ? 'bg-indigo-400'
            : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white font-semibold py-2 rounded transition-colors`}
      >
        {busy ? 'Listing...' : 'List Book'}
      </button>
    </form>
  )
}