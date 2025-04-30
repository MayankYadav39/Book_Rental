// components/Collection.jsx
import Card from './Card';
import { defaultBooks } from '@/data/defaultBooks';

export default function Collection({ books = [] }) {
  // accept only books that have a non-empty title and required fields
  const valid = books.filter(b => 
    b.title && 
    b.title.trim().length > 0 && 
    b.description && 
    b.image
  );
  
  // fall back to demo set if nothing valid came from the chain
  const list = valid.length ? valid : defaultBooks;
  
  if (!list.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        No books listed yet!
      </div>
    );
  }
  
  return (
    <div className="py-8 px-4 sm:px-14 flex flex-wrap justify-center gap-4">
      {list.map(book => (
        <Card 
          key={book.id ?? book.title} 
          book={{
            ...book,
            // Ensure all required properties exist with fallbacks
            id: book.id ?? 0,
            title: book.title ?? '',
            description: book.description ?? '',
            image: book.image ?? '',
            pricePerDay: book.pricePerDay ?? 0,
            lateFeePerDay: book.lateFeePerDay ?? 0,
            deposit: book.deposit ?? 0,
            isRented: !!book.isRented,
            owner: book.owner ?? '0x0000000000000000000000000000000000000000',
            renter: book.renter ?? '0x0000000000000000000000000000000000000000',
          }} 
        />
      ))}
    </div>
  );
}