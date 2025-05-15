const Book = require('../models/Book');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Book.find(JSON.parse(queryStr)).populate({
      path: 'reviews',
      select: 'rating comment user'
    });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Book.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const books = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: books.length,
      pagination,
      data: books
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name'
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private (Admin only)
exports.createBook = async (req, res) => {
  try {
    console.log('Creating book');
    console.log('User:', req.user ? req.user.id : 'No user');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? 'Files exist' : 'No files');
    if (req.files) {
      console.log('File fields:', Object.keys(req.files));
      if (req.files.file) {
        console.log('Book file:', req.files.file[0].originalname);
      }
      if (req.files.coverImage) {
        console.log('Cover image:', req.files.coverImage[0].originalname);
      }
    }
    
    // Add user to req.body
    if (req.user) {
      req.body.user = req.user.id;
    }

    let fileUrl = '';
    let publicId = '';
    let coverImageUrl = '';
    let coverImagePublicId = '';
    
    // Upload book file to Cloudinary if it exists
    if (req.files && req.files.file && req.files.file.length > 0) {
      const bookFile = req.files.file[0];
      console.log('Uploading book file to Cloudinary:', bookFile.path);
      try {
        const result = await cloudinary.uploader.upload(bookFile.path, {
          resource_type: 'auto',
          folder: 'digital_library/books'
        });
        
        fileUrl = result.secure_url;
        publicId = result.public_id;
        console.log('Book file uploaded successfully to Cloudinary');
        
        // Delete file from server after upload
        fs.unlinkSync(bookFile.path);
      } catch (uploadError) {
        console.error('Cloudinary upload error for book file:', uploadError);
        
        // Check if it's a Cloudinary authentication error
        if (uploadError.error && uploadError.error.http_code === 401) {
          console.error('Cloudinary authentication failed. Please check your Cloudinary credentials.');
          console.error('Cloudinary config:', {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY ? 'REDACTED' : 'MISSING',
            api_secret: process.env.CLOUDINARY_API_SECRET ? 'REDACTED' : 'MISSING'
          });
        }
        
        // Use placeholder if upload fails
        fileUrl = 'https://res.cloudinary.com/dmub7pac7/image/upload/v1652345678/digital_library/placeholder-book.pdf';
        publicId = 'placeholder_' + Date.now();
      }
    } else {
      // Use placeholder if no file
      console.log('No book file uploaded, using placeholder');
      fileUrl = 'https://res.cloudinary.com/dmub7pac7/image/upload/v1652345678/digital_library/placeholder-book.pdf';
      publicId = 'placeholder_' + Date.now();
    }
    
    // Upload cover image to Cloudinary if it exists
    if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
      const coverImage = req.files.coverImage[0];
      console.log('Uploading cover image to Cloudinary:', coverImage.path);
      try {
        const result = await cloudinary.uploader.upload(coverImage.path, {
          resource_type: 'image',
          folder: 'digital_library/covers'
        });
        
        coverImageUrl = result.secure_url;
        coverImagePublicId = result.public_id;
        console.log('Cover image uploaded successfully to Cloudinary');
        
        // Delete file from server after upload
        fs.unlinkSync(coverImage.path);
      } catch (uploadError) {
        console.error('Cloudinary upload error for cover image:', uploadError);
        // Use placeholder if upload fails
        coverImageUrl = '';
        coverImagePublicId = '';
      }
    }
    
    // Create book with file URL and required fields
    const book = await Book.create({
      title: req.body.title || 'Untitled Book',
      author: req.body.author || 'Unknown Author',
      description: req.body.description || 'No description available',
      category: req.body.category || 'Uncategorized',
      user: req.body.user || '000000000000000000000000', // Default user ID if none provided
      fileUrl: fileUrl,
      publicId: publicId,
      coverImage: coverImageUrl || '', // Add cover image URL if available
      coverImagePublicId: coverImagePublicId || '', // Add cover image public ID if available
      averageRating: 1, // Set to minimum required value
      numReviews: 0
    });

    console.log('Book created successfully:', book._id);
      
    res.status(201).json({
      success: true,
      data: book
    });
  } catch (err) {
    console.error('Book creation error:', err);
    
    // If error and file exists, delete uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Admin only)
exports.updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with id of ${req.params.id}`
      });
    }

    console.log('Updating book:', req.params.id);
    console.log('Request files:', req.files ? 'Files exist' : 'No files');
    if (req.files) {
      console.log('File fields:', Object.keys(req.files));
    }

    // Upload new book file if provided
    if (req.files && req.files.file && req.files.file.length > 0) {
      console.log('Uploading new book file');
      // Delete previous file from cloudinary if exists
      if (book.publicId) {
        console.log('Deleting previous book file from Cloudinary:', book.publicId);
        await cloudinary.uploader.destroy(book.publicId);
      }

      // Upload new file
      const bookFile = req.files.file[0];
      const result = await cloudinary.uploader.upload(bookFile.path, {
        resource_type: 'raw',
        folder: 'digital_library/books'
      });

      // Add file URL to req.body
      req.body.fileUrl = result.secure_url;
      req.body.publicId = result.public_id;
      console.log('New book file uploaded to Cloudinary');

      // Delete file from server after upload
      fs.unlinkSync(bookFile.path);
    }
    
    // Upload new cover image if provided
    if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
      console.log('Uploading new cover image');
      // Delete previous cover image from cloudinary if exists
      if (book.coverImagePublicId) {
        console.log('Deleting previous cover image from Cloudinary:', book.coverImagePublicId);
        await cloudinary.uploader.destroy(book.coverImagePublicId);
      }

      // Upload new cover image
      const coverImage = req.files.coverImage[0];
      const result = await cloudinary.uploader.upload(coverImage.path, {
        resource_type: 'image',
        folder: 'digital_library/covers'
      });

      // Add cover image URL to req.body
      req.body.coverImage = result.secure_url;
      req.body.coverImagePublicId = result.public_id;
      console.log('New cover image uploaded to Cloudinary');

      // Delete file from server after upload
      fs.unlinkSync(coverImage.path);
    }

    // Update book
    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (err) {
    // If error, delete uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin only)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with id of ${req.params.id}`
      });
    }

    // Delete file from cloudinary if exists
    if (book.publicId) {
      await cloudinary.uploader.destroy(book.publicId);
    }

    // Remove book from database
    await book.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
