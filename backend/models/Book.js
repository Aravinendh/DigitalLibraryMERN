const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
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
    ]
  },
  coverImage: {
    type: String,
    default: 'no-image.jpg'
  },
  fileUrl: {
    type: String,
    required: [true, 'Please upload a book file']
  },
  publicId: {
    type: String
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 1 // Changed from 0 to 1 to satisfy validation
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Cascade delete reviews when a book is deleted
BookSchema.pre('remove', async function(next) {
  await this.model('Review').deleteMany({ book: this._id });
  next();
});

// Reverse populate with reviews
BookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'book',
  justOne: false
});

module.exports = mongoose.model('Book', BookSchema);
