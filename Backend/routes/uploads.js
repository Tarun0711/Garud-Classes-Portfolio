const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { 
  singleUpload, 
  multipleUpload, 
  fieldsUpload, 
  handleUploadError,
  getFileUrl,
  deleteFile 
} = require('../config/upload');

// @desc    Upload single file
// @route   POST /api/uploads/single
// @access  Private
router.post('/single', protect, (req, res, next) => {
  singleUpload(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    // Get file URL
    const fileUrl = getFileUrl(req.file.filename, req);
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path
      }
    });
  });
});

// @desc    Upload multiple files
// @route   POST /api/uploads/multiple
// @access  Private
router.post('/multiple', protect, (req, res, next) => {
  multipleUpload(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select files to upload'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: getFileUrl(file.filename, req),
      path: file.path
    }));

    res.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length
      }
    });
  });
});

// @desc    Upload profile image
// @route   POST /api/uploads/profile-image
// @access  Private
router.post('/profile-image', protect, (req, res, next) => {
  singleUpload(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select an image file to upload'
      });
    }

    // Validate file type (should be image)
    if (!req.file.mimetype.startsWith('image/')) {
      // Delete uploaded file
      deleteFile(req.file.path);
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only image files are allowed for profile pictures'
      });
    }

    const fileUrl = getFileUrl(req.file.filename, req);
    
    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path
      }
    });
  });
});

// @desc    Upload course materials
// @route   POST /api/uploads/course-materials
// @access  Private (Teachers and Admins only)
router.post('/course-materials', protect, authorize('teacher', 'admin'), (req, res, next) => {
  multipleUpload(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select files to upload'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: getFileUrl(file.filename, req),
      path: file.path,
      type: getFileType(file.mimetype)
    }));

    res.json({
      success: true,
      message: `${uploadedFiles.length} course material(s) uploaded successfully`,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length
      }
    });
  });
});

// @desc    Upload class recording
// @route   POST /api/uploads/class-recording
// @access  Private (Teachers and Admins only)
router.post('/class-recording', protect, authorize('teacher', 'admin'), (req, res, next) => {
  singleUpload(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a recording file to upload'
      });
    }

    // Validate file type (should be video or audio)
    if (!req.file.mimetype.startsWith('video/') && !req.file.mimetype.startsWith('audio/')) {
      // Delete uploaded file
      deleteFile(req.file.path);
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only video and audio files are allowed for class recordings'
      });
    }

    const fileUrl = getFileUrl(req.file.filename, req);
    
    res.json({
      success: true,
      message: 'Class recording uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path,
        type: getFileType(req.file.mimetype)
      }
    });
  });
});

// @desc    Upload with specific fields
// @route   POST /api/uploads/fields
// @access  Private
router.post('/fields', protect, (req, res, next) => {
  fieldsUpload(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    const uploadedFiles = {};
    
    // Process profile image
    if (req.files.profileImage && req.files.profileImage[0]) {
      const file = req.files.profileImage[0];
      uploadedFiles.profileImage = {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: getFileUrl(file.filename, req),
        path: file.path
      };
    }

    // Process course materials
    if (req.files.courseMaterials && req.files.courseMaterials.length > 0) {
      uploadedFiles.courseMaterials = req.files.courseMaterials.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: getFileUrl(file.filename, req),
        path: file.path,
        type: getFileType(file.mimetype)
      }));
    }

    // Process class recording
    if (req.files.classRecording && req.files.classRecording[0]) {
      const file = req.files.classRecording[0];
      uploadedFiles.classRecording = {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: getFileUrl(file.filename, req),
        path: file.path,
        type: getFileType(file.mimetype)
      };
    }

    if (Object.keys(uploadedFiles).length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select files to upload'
      });
    }

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles
    });
  });
});

// @desc    Delete uploaded file
// @route   DELETE /api/uploads/:filename
// @access  Private
router.delete('/:filename', protect, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Find the file path (you might want to store file paths in your database)
    // For now, we'll construct the path based on filename
    const filePath = `./uploads/${filename}`;
    
    const deleted = deleteFile(filePath);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        error: 'File not found',
        message: 'The specified file could not be found or deleted'
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      error: 'Failed to delete file',
      message: 'An error occurred while deleting the file'
    });
  }
});

// @desc    Get file info
// @route   GET /api/uploads/:filename
// @access  Private
router.get('/:filename', protect, (req, res) => {
  try {
    const { filename } = req.params;
    const fileUrl = getFileUrl(filename, req);
    
    res.json({
      success: true,
      data: {
        filename,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      error: 'Failed to get file info',
      message: 'An error occurred while getting file information'
    });
  }
});

// Helper function to determine file type
function getFileType(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('application/') || mimetype.startsWith('text/')) return 'document';
  return 'other';
}

// Error handling middleware
router.use(handleUploadError);

module.exports = router;
