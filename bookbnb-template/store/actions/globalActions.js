export const globalActions = {
  // List of all books (if you ever need it)
  setBooks:      (state, action) => { state.books = action.payload },

  // Single Book detail
  setBook:       (state, action) => { state.book = action.payload },

  // Reviews for the current book
  setReviews:    (state, action) => { state.reviews = action.payload },

  // Toggle the review modal’s CSS scale
  setReviewModal:(state, action) => { state.reviewModal = action.payload },

  // All bookings for the current book
  setBookings:   (state, action) => { state.bookings = action.payload },

  // (Optional) Single booking detail
  setBooking:    (state, action) => { state.booking = action.payload },

  // Blocked/rented dates for the calendar
  setTimestamps: (state, action) => { state.timestamps = action.payload },
}
