import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
  });
  const [bookFile, setBookFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBook, setLoadingBook] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const categories = [
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
    // If in edit mode, fetch the book data
    if (isEditMode) {
      const fetchBook = async () => {
        try {
          const res = await api.get(`/books/${id}`);
          const book = res.data.data;
          
          setFormData({
            title: book.title,
            author: book.author,
            description: book.description,
            category: book.category,
          });
          
          setPreview(book.coverImage);
          setLoadingBook(false);
        } catch (err) {
          setError('Failed to fetch book details');
          toast.error('Failed to fetch book details');
          setLoadingBook(false);
        }
      };

      fetchBook();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBookFile(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.title || !formData.author || !formData.description || !formData.category) {
        toast.error('Please fill in all fields');
        setLoading(false);
        return;
      }
      
      // In create mode, book file is required
      if (!isEditMode && !bookFile) {
        toast.error('Please upload a book file');
        setLoading(false);
        return;
      }

      // Create a new FormData object
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      
      // Log what fields we're about to send
      console.log('Form fields being sent:', {
        title: formData.title,
        author: formData.author,
        category: formData.category,
        hasBookFile: !!bookFile,
        hasCoverImage: !!coverImage
      });
      
      // Add file field - this is the critical part
      if (bookFile) {
        console.log('Adding book file to form data:', {
          name: bookFile.name,
          type: bookFile.type,
          size: bookFile.size
        });
        // Use 'file' as the field name to match backend expectation
        formDataToSend.append('file', bookFile);
      }
      
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }
      
      // Log all field names in the FormData
      const formDataFields = [];
      for (let pair of formDataToSend.entries()) {
        formDataFields.push(pair[0]);
      }
      console.log('All fields in FormData:', formDataFields);

      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Always use the regular endpoint now that we've fixed the validation issue
      const endpoint = isEditMode ? `/books/${id}` : '/books';
      
      console.log('Using regular endpoint with file upload');
      let response;
      try {
        if (id) {
          // Update book
          response = await api.put(endpoint, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          // Create book
          response = await api.post(endpoint, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
        
        console.log('Form submission successful:', response.data);
        toast.success(isEditMode ? 'Book updated successfully' : 'Book added successfully');
      } catch (apiError) {
        console.error('API Error:', apiError);
        throw apiError; // Re-throw to be caught by the outer try/catch
      }
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || err.message || 'Error submitting form');
      toast.error(err.response?.data?.message || err.message || 'Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  if (loadingBook) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Book' : 'Add New Book'}
        </h1>
        <Link to="/admin/dashboard" className="text-primary-600 hover:text-primary-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Book title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="author" className="form-label">Author</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Author name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="form-label">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="bookFile" className="form-label">
                  Book File {isEditMode ? '(Leave empty to keep current file)' : ''}
                </label>
                <input
                  type="file"
                  id="bookFile"
                  onChange={handleFileChange}
                  className="form-input"
                  accept=".pdf,.epub"
                  required={!isEditMode}
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, EPUB</p>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  rows="5"
                  placeholder="Book description"
                  required
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="coverImage" className="form-label">
                  Cover Image {isEditMode ? '(Leave empty to keep current image)' : ''}
                </label>
                <input
                  type="file"
                  id="coverImage"
                  onChange={handleCoverChange}
                  className="form-input"
                  accept="image/*"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 300x450 pixels</p>
              </div>
              
              {/* Image Preview */}
              {preview && (
                <div className="mt-4">
                  <p className="form-label">Cover Preview</p>
                  <div className="w-32 h-48 overflow-hidden border rounded">
                    <img
                      src={preview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="btn btn-secondary mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                isEditMode ? 'Update Book' : 'Add Book'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;
