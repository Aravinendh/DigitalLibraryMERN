const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Prevent user from submitting more than one review per book
ReviewSchema.index({ book: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
ReviewSchema.statics.getAverageRating = async function(bookId) {
  const obj = await this.aggregate([
    {
      $match: { book: bookId }
    },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('Book').findByIdAndUpdate(bookId, {
      averageRating: obj.length > 0 ? obj[0].averageRating : 0,
      numReviews: obj.length > 0 ? obj[0].numReviews : 0
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.book);
});

// Call getAverageRating after remove
ReviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.book);
});

module.exports = mongoose.model('Review', ReviewSchema);
