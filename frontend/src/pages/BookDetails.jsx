import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/books/${id}`);
        setBook(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch book details');
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleReviewChange = (e) => {
    setReviewFormData({
      ...reviewFormData,
      [e.target.name]: e.target.name === 'rating' ? parseInt(e.target.value) : e.target.value
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      toast.error('You must be logged in to leave a review');
      navigate('/login');
      return;
    }
    
    try {
      setSubmittingReview(true);
      await axios.post(`/api/books/${id}/reviews`, reviewFormData);
      
      // Refresh book data to show the new review
      const res = await axios.get(`/api/books/${id}`);
      setBook(res.data.data);
      
      // Reset form
      setReviewFormData({
        rating: 5,
        comment: ''
      });
      
      toast.success('Review submitted successfully');
      setSubmittingReview(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center my-8">
        <h2 className="text-xl font-semibold text-red-600">{error || 'Book not found'}</h2>
        <Link to="/" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  // Check if the current user has already reviewed this book
  const hasReviewed = book.reviews?.some(review => review.user?._id === user?.id);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="text-primary-600 hover:text-primary-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Books
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Book Cover */}
          <div className="md:w-1/3 p-4">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-auto object-cover rounded-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
              }}
            />
            
            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              {isAuthenticated() && (
                <Link
                  to={`/books/${book._id}/read`}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  Read Book
                </Link>
              )}
              
              {isAdmin() && (
                <div className="flex space-x-2">
                  <Link
                    to={`/admin/books/edit/${book._id}`}
                    className="btn btn-secondary flex-1 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    className="btn btn-danger flex-1 flex items-center justify-center"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this book?')) {
                        // Delete book logic
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Book Details */}
          <div className="md:w-2/3 p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-gray-600 mb-4">by {book.author}</p>
            
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${
                      i < Math.round(book.averageRating) ? 'fill-current' : 'stroke-current fill-none'
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600 ml-2">
                {book.averageRating ? book.averageRating.toFixed(1) : '0'} ({book.numReviews} {book.numReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            
            <div className="mb-4">
              <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded">
                {book.category}
              </span>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{book.description}</p>
            </div>
            
            <div className="text-sm text-gray-500">
              Added on {new Date(book.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          
          {/* Review Form */}
          {isAuthenticated() && !hasReviewed && (
            <div className="mb-8 bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-3">Write a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label htmlFor="rating" className="form-label">Rating</label>
                  <select
                    id="rating"
                    name="rating"
                    value={reviewFormData.rating}
                    onChange={handleReviewChange}
                    className="form-input"
                    required
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="comment" className="form-label">Comment</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={reviewFormData.comment}
                    onChange={handleReviewChange}
                    className="form-input"
                    rows="4"
                    placeholder="Share your thoughts about this book"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
          
          {/* Reviews List */}
          {book.reviews && book.reviews.length > 0 ? (
            <div className="space-y-4">
              {book.reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-current' : 'stroke-current fill-none'
                              }`}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 font-medium">{review.user?.name || 'User'}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Delete Review Button (for admin or review owner) */}
                    {(isAdmin() || (user && review.user?._id === user.id)) && (
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this review?')) {
                            // Delete review logic
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reviews yet. Be the first to review this book!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
