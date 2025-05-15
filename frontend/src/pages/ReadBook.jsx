import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ReadBook = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // PDF state
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

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

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return newPageNumber >= 1 && newPageNumber <= numPages ? newPageNumber : prevPageNumber;
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 2.0));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.6));
  const resetZoom = () => setScale(1.0);

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Link to={`/books/${id}`} className="text-primary-600 hover:text-primary-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Book Details
        </Link>
        <h1 className="text-xl font-bold">{book.title}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* PDF Controls */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className={`px-3 py-1 rounded ${
                pageNumber <= 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {pageNumber} of {numPages || '--'}
            </span>
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className={`px-3 py-1 rounded ${
                pageNumber >= numPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              Next
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              title="Zoom Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              title="Reset Zoom"
            >
              <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
            </button>
            <button
              onClick={zoomIn}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              title="Zoom In"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* PDF Viewer */}
        <div className="p-4 flex justify-center bg-gray-100 min-h-screen">
          <Document
            file={book.fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={() => setError('Error loading PDF')}
            loading={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            }
            error={
              <div className="text-center my-8">
                <h2 className="text-xl font-semibold text-red-600">Failed to load PDF</h2>
                <p className="text-gray-600 mt-2">The document may be in an unsupported format or unavailable.</p>
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-lg"
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default ReadBook;
