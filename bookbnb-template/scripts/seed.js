const { faker } = require('@faker-js/faker');
const { ethers } = require('hardhat');
const fs = require('fs');

const toWei = (num) => ethers.parseEther(num.toString());
const dataCount = 5;
// Sample cover image URLs
const sampleImages = [
  'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?cs=srgb&dl=pexels-pixabay-159866.jpg&fm=jpg',
  'https://placekitten.com/250/350',
  'https://placekitten.com/300/400',
  'https://placekitten.com/350/450',
  'https://placekitten.com/400/500',
];

function generateFakeBooks(count) {
  const books = [];
  for (let i = 0; i < count; i++) {
    const title = faker.lorem.words(3);
    const description = faker.lorem.paragraph();
    const image = sampleImages[i % sampleImages.length];
    const pricePerDay = faker.number.float({ min: 0.1, max: 1, precision: 0.01 });
    const deposit = faker.number.float({ min: pricePerDay * 2, max: pricePerDay * 5, precision: 0.01 });
    books.push({ title, description, image, pricePerDay, deposit });
  }
  return books;
}

async function main() {
  const raw = fs.readFileSync('./contracts/contractAddress.json', 'utf8');
  const { bookRentalContract: address } = JSON.parse(raw);
  const contract = await ethers.getContractAt('BookRental', address);

  const books = generateFakeBooks(dataCount);
  for (const book of books) {
    const tx = await contract.listBook(
      book.title,
      book.description,
      book.image,
      toWei(book.pricePerDay),
      toWei(book.deposit)
    );
    await tx.wait();
    console.log(`Listed book: ${book.title}`);
  }
}

main().catch(console.error);

