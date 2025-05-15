const Review = require('../models/Review');
const Book = require('../models/Book');

// @desc    Get all reviews
// @route   GET /api/reviews
// @route   GET /api/books/:bookId/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    let query;

    if (req.params.bookId) {
      query = Review.find({ book: req.params.bookId }).populate({
        path: 'user',
        select: 'name'
      });
    } else {
      query = Review.find().populate({
        path: 'user',
        select: 'name'
      }).populate({
        path: 'book',
        select: 'title author'
      });
    }

    const reviews = await query;

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate({
      path: 'user',
      select: 'name'
    }).populate({
      path: 'book',
      select: 'title author'
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Add review
// @route   POST /api/books/:bookId/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    req.body.book = req.params.bookId;
    req.body.user = req.user.id;

    // Check if book exists
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with id of ${req.params.bookId}`
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: req.user.id,
      book: req.params.bookId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book'
      });
    }

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with id of ${req.params.id}`
      });
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with id of ${req.params.id}`
      });
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.remove();

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
