import { useEffect } from 'react';
import { Booking } from '@/components';
import { useRouter } from 'next/router';
import { globalActions } from '@/store/globalSlices';
import { useDispatch, useSelector } from 'react-redux';
import { getBookings, getBook } from '@/services/blockchain';

const Bookings = ({ bookData, bookingsData }) => {
  const router = useRouter();
  const { bookId } = router.query;

  const dispatch = useDispatch();

  const { setBook, setBookings } = globalActions;
  const { book, bookings } = useSelector((states) => states.globalStates);

  useEffect(() => {
    dispatch(setBook(bookData));
    dispatch(setBookings(bookingsData));
  }, [dispatch, setBook, bookData, setBookings, bookingsData]);

  return (
    <div className="w-full sm:w-3/5 mx-auto mt-8">
      <h1 className="text-center text-3xl text-black font-bold">Bookings</h1>
      {bookings.length < 1 && <div>No bookings for this book yet</div>}

      {bookings.map((booking, i) => (
        <Booking key={i} id={bookId} booking={booking} book={book} />
      ))}
    </div>
  );
};

export default Bookings;

export const getServerSideProps = async (context) => {
  const { bookId } = context.query;
  const bookData = await getBook(bookId);
  const bookingsData = await getBookings(bookId);

  return {
    props: {
      bookData: JSON.parse(JSON.stringify(bookData)),
      bookingsData: JSON.parse(JSON.stringify(bookingsData)),
    },
  };
};
