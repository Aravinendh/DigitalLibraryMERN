import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'All Categories',
    'Fiction',
    'Non-fiction',
    'Science',
    'Technology',
    'History',
    'Biography',
    'Self-help',
    'Business',
    'Literature',
    'Other'
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        let url = `/api/books?page=${currentPage}&limit=8`;
        
        if (searchTerm) {
          url += `&title[$regex]=${searchTerm}&title[$options]=i`;
        }
        
        if (category && category !== 'All Categories') {
          url += `&category=${category}`;
        }
        
        const res = await axios.get(url);
        setBooks(res.data.data);
        
        // Calculate total pages
        const total = res.data.pagination ? 
          Math.ceil(res.data.count / 8) : 
          1;
        
        setTotalPages(total);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch books');
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchTerm, category, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1); // Reset to first page on category change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary-700 text-white py-12 px-4 rounded-lg mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to Digital Library
          </h1>
          <p className="text-lg mb-6">
            Discover, read and enjoy thousands of books in our digital collection
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 justify-center">
            <input
              type="text"
              placeholder="Search for books..."
              className="px-4 py-2 rounded-md text-gray-800 w-full md:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-4 py-2 rounded-md text-gray-800 w-full md:w-auto"
              value={category}
              onChange={handleCategoryChange}
            >
              {categories.map((cat, index) => (
                <option key={index} value={cat === 'All Categories' ? '' : cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Books Grid */}
      {error ? (
        <div className="text-center text-red-500 my-8">{error}</div>
      ) : books.length === 0 ? (
        <div className="text-center my-8">
          <h2 className="text-xl font-semibold">No books found</h2>
          <p className="text-gray-600 mt-2">Try a different search term or category</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6">Available Books</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book._id} className="card hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 ${
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
                    <span className="text-gray-600 text-sm ml-1">
                      ({book.numReviews} {book.numReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {book.category}
                    </span>
                    <Link to={`/books/${book._id}`} className="text-primary-600 hover:text-primary-700">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === index + 1
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
