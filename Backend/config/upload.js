const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
 
// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file typesn
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
  };

  // Check if file type is allowed
  const isAllowed = Object.values(allowedTypes).flat().includes(file.mimetype);
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, videos, and audio files are allowed.'), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on file type
    let subDir = 'misc';
    
    if (file.mimetype.startsWith('image/')) {
      subDir = 'images';
    } else if (file.mimetype.startsWith('video/')) {
      subDir = 'videos';
    } else if (file.mimetype.startsWith('audio/')) {
      subDir = 'audio';
    } else if (file.mimetype.startsWith('application/') || file.mimetype.startsWith('text/')) {
      subDir = 'documents';
    }

    const fullPath = path.join(uploadDir, subDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Sanitize filename
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 10 // Maximum 10 files per request
  }
});

// Single file upload
const singleUpload = upload.single('file');

// Multiple files upload
const multipleUpload = upload.array('files', 10);

// Specific field uploads
const fieldsUpload = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'courseMaterials', maxCount: 10 },
  { name: 'classRecording', maxCount: 1 }
]);

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: `File size should be less than ${process.env.MAX_FILE_SIZE || '10MB'}`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 10 files allowed per request'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field',
        message: 'Unexpected file field in request'
      });
    }
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message
    });
  }
  
  next(err);
};

// Helper function to get file URL
const getFileUrl = (filename, req) => {
  if (!filename) return null;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

// Helper function to delete file
const deleteFile = (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  upload,
  singleUpload,
  multipleUpload,
  fieldsUpload,
  handleUploadError,
  getFileUrl,
  deleteFile,
  uploadDir
};
