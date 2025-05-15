const express = require('express');
const { 
  getBooks, 
  getBook, 
  createBook, 
  updateBook, 
  deleteBook 
} = require('../controllers/books');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Include review router
const reviewRouter = require('./reviews');

const router = express.Router();

// Re-route into other resource routers
router.use('/:bookId/reviews', reviewRouter);

router
  .route('/')
  .get(getBooks)
  .post(
    protect, 
    authorize('admin'), 
    upload.logRequest,
    upload.fields([
      { name: 'file', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 }
    ]), 
    createBook
  );

// Special route for book creation without file upload
router.route('/no-file').post(protect, authorize('admin'), createBook);

router
  .route('/:id')
  .get(getBook)
  .put(
    protect, 
    authorize('admin'), 
    upload.logRequest,
    upload.fields([
      { name: 'file', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 }
    ]), 
    updateBook
  )
  .delete(protect, authorize('admin'), deleteBook);

module.exports = router;
