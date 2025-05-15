const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory at:', uploadDir);
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    console.log('Storing file in:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  console.log('Checking file type:', file.originalname, file.mimetype);
  
  // Accept pdf, epub, and images
  const filetypes = /pdf|epub|jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    console.log('File type accepted');
    return cb(null, true);
  } else {
    console.log('File type rejected');
    return cb(new Error('Only PDF, EPUB, and image files are allowed'), false);
  }
};

// Create a middleware to log the incoming request before multer processes it
const logRequest = (req, res, next) => {
  console.log('Incoming request headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  next();
};

// Initialize upload with debug logging
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB max file size
  fileFilter: fileFilter
});

// Create a wrapped version of upload.single that includes logging
const wrappedSingle = (fieldName) => {
  console.log(`Setting up multer for field: ${fieldName}`);
  return (req, res, next) => {
    console.log(`Processing upload for field: ${fieldName}`);
    console.log('Request content type:', req.headers['content-type']);
    
    // Call the original upload.single middleware
    const middleware = upload.single(fieldName);
    middleware(req, res, (err) => {
      if (err) {
        console.error(`Multer error for field ${fieldName}:`, err);
      } else {
        console.log(`Upload successful for field ${fieldName}:`, req.file ? 'File received' : 'No file received');
      }
      next(err);
    });
  };
};

// Create a wrapped version of upload.fields that includes logging
const wrappedFields = (fields) => {
  console.log(`Setting up multer for fields:`, fields.map(f => f.name).join(', '));
  return (req, res, next) => {
    console.log(`Processing upload for multiple fields`);
    console.log('Request content type:', req.headers['content-type']);
    
    // Call the original upload.fields middleware
    const middleware = upload.fields(fields);
    middleware(req, res, (err) => {
      if (err) {
        console.error(`Multer error for fields:`, err);
      } else {
        console.log(`Upload successful:`, req.files ? 'Files received' : 'No files received');
        if (req.files) {
          Object.keys(req.files).forEach(fieldName => {
            console.log(`Field ${fieldName} received ${req.files[fieldName].length} file(s)`);
          });
        }
      }
      next(err);
    });
  };
};

// Export both the original multer instance and our wrapped version
module.exports = {
  ...upload,
  single: wrappedSingle,
  fields: wrappedFields,
  logRequest
};
