import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';

// Load environment variables from .env file (Ensure this is done before using process.env)
dotenv.config();

// Initialize S3 client with credentials from environment variables
const s3 = new S3Client({
  credentials: {
    secretAccessKey: process.env.S3_SECRET_KEY,
    accessKeyId: process.env.S3_ACCESS_KEY,
  },
  region: process.env.S3_REGION, // It's good practice to specify the region
});

// Set up the storage configuration for multer-s3
const storage = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    // Unique file name for each upload, based on timestamp
    cb(null, `${Date.now().toString()}-${file.originalname}`);
  },
});

// File type validation (allow only images)
const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images only (jpeg, jpg, png)!');
  }
};

// Set up multer to use the storage configuration and file filter
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => checkFileType(file, cb),
}).array('file', 5); // 'file' is the field name, and 5 is the file limit

// Convert callback-based upload function into a Promise-based function
const uploadMiddleware = (req, res, next) => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        reject(err); // Reject the promise if an error occurs
      } else {
        resolve(); // Resolve the promise if everything is okay
      }
    });
  })
    .then(() => next()) // If successful, proceed to the next middleware
    .catch((err) => {
      res.status(400).json({ message: err.message }); // Send error response if upload fails
    });
};

export default uploadMiddleware;
