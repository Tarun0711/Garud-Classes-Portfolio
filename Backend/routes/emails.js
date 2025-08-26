const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const emailService = require('../config/email').emailService;
const User = require('../models/User');
const Class = require('../models/Class');
const Course = require('../models/Course');

// @desc    Send welcome email
// @route   POST /api/emails/welcome
// @access  Private (Admins only)
router.post('/welcome', protect, authorize('admin'), [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('name').notEmpty().withMessage('Name is required'),
  validate
], async (req, res) => {
  try {
    const { email, name } = req.body;

    const result = await emailService.sendEmail({ to: email, template: 'welcome', context: { userName: name } });
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Welcome email sent successfully',
        data: {
          messageId: result.messageId,
          recipient: email
        }
      });
    } else {
      res.status(500).json({
        error: 'Failed to send email',
        message: result.error
      });
    }

  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({
      error: 'Failed to send welcome email',
      message: 'An error occurred while sending the welcome email'
    });
  }
});

// @desc    Send class reminder
// @route   POST /api/emails/class-reminder
// @access  Private (Teachers and Admins only)
router.post('/class-reminder', protect, authorize('teacher', 'admin'), [
  body('classId').isMongoId().withMessage('Valid class ID is required'),
  validate
], async (req, res) => {
  try {
    const { classId } = req.body;

    const classItem = await Class.findById(classId)
      .populate('course', 'title')
      .populate('students.student', 'name email');

    if (!classItem) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The specified class could not be found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && classItem.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only send reminders for your own classes'
      });
    }

    const sentEmails = [];
    const failedEmails = [];

    // Send reminder to each enrolled student
    for (const studentEnrollment of classItem.students) {
      try {
        const result = await emailService.sendEmail({
          to: studentEnrollment.student.email,
          template: 'classReminder',
          context: {
            className: classItem.title,
            startTime: classItem.startTime.toLocaleString()
          }
        });

        if (result.success) {
          sentEmails.push({
            email: studentEnrollment.student.email,
            name: studentEnrollment.student.name,
            messageId: result.messageId
          });
        } else {
          failedEmails.push({
            email: studentEnrollment.student.email,
            name: studentEnrollment.student.name,
            error: result.error
          });
        }
      } catch (error) {
        failedEmails.push({
          email: studentEnrollment.student.email,
          name: studentEnrollment.student.name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Class reminders sent',
      data: {
        totalStudents: classItem.students.length,
        sentEmails,
        failedEmails,
        sentCount: sentEmails.length,
        failedCount: failedEmails.length
      }
    });

  } catch (error) {
    console.error('Send class reminder error:', error);
    res.status(500).json({
      error: 'Failed to send class reminders',
      message: 'An error occurred while sending class reminders'
    });
  }
});

// @desc    Send course announcement
// @route   POST /api/emails/course-announcement
// @access  Private (Teachers and Admins only)
router.post('/course-announcement', protect, authorize('teacher', 'admin'), [
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
  validate
], async (req, res) => {
  try {
    const { courseId, subject, message } = req.body;

    const course = await Course.findById(courseId)
      .populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The specified course could not be found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && course.instructor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only send announcements for your own courses'
      });
    }

    // Get all enrolled students (you might need to implement enrollment tracking)
    // For now, we'll send to all users with student role
    const students = await User.findByRole('student');

    const sentEmails = [];
    const failedEmails = [];

    // Send announcement to each student
    for (const student of students) {
      try {
        const result = await emailService.sendCustomEmail(
          student.email,
          subject,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2c3e50;">Course Announcement: ${course.title}</h2>
              <p>Hello ${student.name},</p>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                ${message}
              </div>
              <p>Best regards,<br>${course.instructor.name}</p>
            </div>
          `
        );

        if (result.success) {
          sentEmails.push({
            email: student.email,
            name: student.name,
            messageId: result.messageId
          });
        } else {
          failedEmails.push({
            email: student.email,
            name: student.name,
            error: result.error
          });
        }
      } catch (error) {
        failedEmails.push({
          email: student.email,
          name: student.name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Course announcement sent',
      data: {
        course: course.title,
        totalStudents: students.length,
        sentEmails,
        failedEmails,
        sentCount: sentEmails.length,
        failedCount: failedEmails.length
      }
    });

  } catch (error) {
    console.error('Send course announcement error:', error);
    res.status(500).json({
      error: 'Failed to send course announcement',
      message: 'An error occurred while sending the course announcement'
    });
  }
});

// @desc    Send custom email
// @route   POST /api/emails/custom
// @access  Private (Admins only)
router.post('/custom', protect, authorize('admin'), [
  body('to').isEmail().withMessage('Please provide a valid recipient email'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
  validate
], async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    const result = await emailService.sendCustomEmail(to, subject, message);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Custom email sent successfully',
        data: {
          messageId: result.messageId,
          recipient: to,
          subject
        }
      });
    } else {
      res.status(500).json({
        error: 'Failed to send email',
        message: result.error
      });
    }

  } catch (error) {
    console.error('Send custom email error:', error);
    res.status(500).json({
      error: 'Failed to send custom email',
      message: 'An error occurred while sending the custom email'
    });
  }
});

// @desc    Send bulk emails
// @route   POST /api/emails/bulk
// @access  Private (Admins only)
router.post('/bulk', protect, authorize('admin'), [
  body('emails').isArray({ min: 1 }).withMessage('At least one email is required'),
  body('emails.*').isEmail().withMessage('Each email must be valid'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
  validate
], async (req, res) => {
  try {
    const { emails, subject, message } = req.body;

    const sentEmails = [];
    const failedEmails = [];

    // Send email to each recipient
    for (const email of emails) {
      try {
        const result = await emailService.sendCustomEmail(email, subject, message);

        if (result.success) {
          sentEmails.push({
            email,
            messageId: result.messageId
          });
        } else {
          failedEmails.push({
            email,
            error: result.error
          });
        }
      } catch (error) {
        failedEmails.push({
          email,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk emails sent',
      data: {
        totalEmails: emails.length,
        sentEmails,
        failedEmails,
        sentCount: sentEmails.length,
        failedCount: failedEmails.length
      }
    });

  } catch (error) {
    console.error('Send bulk emails error:', error);
    res.status(500).json({
      error: 'Failed to send bulk emails',
      message: 'An error occurred while sending bulk emails'
    });
  }
});

// @desc    Send password reset email
// @route   POST /api/emails/password-reset
// @access  Public
router.post('/password-reset', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  validate
], async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token (this should be done in the auth route, but for demo purposes)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/token`;

    const result = await emailService.sendEmail({ to: user.email, template: 'passwordReset', context: resetLink });
    
    if (result.success) {
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    } else {
      res.status(500).json({
        error: 'Failed to send reset email',
        message: result.error
      });
    }

  } catch (error) {
    console.error('Send password reset email error:', error);
    res.status(500).json({
      error: 'Failed to send password reset email',
      message: 'An error occurred while sending the password reset email'
    });
  }
});

// @desc    Send contact form notification
// @route   POST /api/emails/contact
// @access  Public
router.post('/contact', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  validate
], async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      course,
      message,
      preferredTime
    } = req.body;

    // Create a professional contact form notification email
    const contactEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📞 New Contact Form Submission</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Garud Classes - Contact Inquiry</p>
          </div>
          
          <div style="background-color: #3498db; color: white; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="margin: 0; font-size: 20px;">📋 Inquiry Details</h2>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div>
              <h3 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; margin-bottom: 15px;">👤 Contact Information</h3>
              <p><strong>Full Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>
            
            <div>
              <h3 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; margin-bottom: 15px;">🎯 Course Interest</h3>
              ${course ? `<p><strong>Course:</strong> ${course}</p>` : '<p><strong>Course:</strong> Not specified</p>'}
              ${preferredTime ? `<p><strong>Preferred Time:</strong> ${preferredTime}</p>` : '<p><strong>Preferred Time:</strong> Not specified</p>'}
            </div>
          </div>
          
          ${message ? `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; margin-bottom: 15px;">💬 Message</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
              <p style="margin: 0; color: #2c3e50; line-height: 1.6;">${message}</p>
            </div>
          </div>
          ` : ''}
          
          <div style="background-color: #e8f5e8; border-left: 4px solid #27ae60; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
            <p style="margin: 0; color: #2c3e50;"><strong>📅 Submission Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              This is an automated notification from the Garud Classes contact form.<br>
              Please respond to the inquiry at: <strong>${email}</strong> or call: <strong>${phone}</strong>
            </p>
          </div>
        </div>
      </div>
    `;

    // Send contact notification to admin
    const result = await emailService.sendCustomEmail(
      'tarunchoudhary0711@gmail.com',
      `New Contact Form Inquiry - ${name}`,
      contactEmailHtml
    );
    
    if (result.success) {
      // Also send a confirmation email to the inquirer
      const inquirerConfirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">📧 Message Received!</h1>
              <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Thank you for contacting Garud Classes</p>
            </div>
            
            <div style="background-color: #27ae60; color: white; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="margin: 0; font-size: 20px;">✅ Inquiry Submitted Successfully</h2>
            </div>
            
            <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
              Dear <strong>${name}</strong>,
            </p>
            
            <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
              Thank you for reaching out to Garud Classes! We have received your inquiry and our team will get back to you within 24 hours.
            </p>
            
            ${course ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin: 0 0 15px 0;">📋 Inquiry Summary</h3>
              <p style="margin: 5px 0;"><strong>Course Interest:</strong> ${course}</p>
              ${preferredTime ? `<p style="margin: 5px 0;"><strong>Preferred Contact Time:</strong> ${preferredTime}</p>` : ''}
            </div>
            ` : ''}
            
            <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
              We're excited to help you on your educational journey and will provide you with detailed information about our courses, fee structure, and enrollment process.
            </p>
            
            <div style="background-color: #e8f5e8; border-left: 4px solid #27ae60; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #2c3e50;"><strong>📞 Contact Information:</strong><br>
              If you have any urgent queries, please call us at our office number or reply to this email.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
                Best regards,<br>
                <strong>The Garud Classes Team</strong>
              </p>
            </div>
          </div>
        </div>
      `;

      // Send confirmation to inquirer (don't wait for this to complete)
      emailService.sendCustomEmail(email, 'Inquiry Received - Garud Classes', inquirerConfirmationHtml)
        .catch(err => console.log('Failed to send inquirer confirmation:', err));

      res.json({
        success: true,
        message: 'Contact form submitted successfully',
        data: {
          messageId: result.messageId,
          inquirerEmail: email,
          adminNotified: true
        }
      });
    } else {
      res.status(500).json({
        error: 'Failed to send contact notification',
        message: result.error
      });
    }

  } catch (error) {
    console.error('Send contact notification error:', error);
    res.status(500).json({
      error: 'Failed to send contact notification',
      message: 'An error occurred while processing the contact form'
    });
  }
});

// @desc    Send enrollment notification
// @route   POST /api/emails/enrollment
// @access  Public
router.post('/enrollment', [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('mobileNumber').notEmpty().withMessage('Mobile number is required'),
  body('currentClass').notEmpty().withMessage('Current class is required'),
  body('targetExam').notEmpty().withMessage('Target exam is required'),
  body('preferredBatch').notEmpty().withMessage('Preferred batch is required'),
  validate
], async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      email,
      mobileNumber,
      alternateContact,
      street,
      city,
      state,
      pincode,
      currentClass,
      targetExam,
      schoolCollege,
      preferredBatch,
      sourceOfInformation,
      message
    } = req.body;

    // Create a professional enrollment notification email
    const enrollmentEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🎓 New Student Enrollment</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Garud Classes - Student Registration</p>
          </div>
          
          <div style="background-color: #3498db; color: white; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="margin: 0; font-size: 20px;">📋 Enrollment Details</h2>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div>
              <h3 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; margin-bottom: 15px;">👤 Basic Information</h3>
              <p><strong>Full Name:</strong> ${fullName}</p>
              ${dateOfBirth ? `<p><strong>Date of Birth:</strong> ${dateOfBirth}</p>` : ''}
              ${gender ? `<p><strong>Gender:</strong> ${gender}</p>` : ''}
            </div>
            
            <div>
              <h3 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; margin-bottom: 15px;">📞 Contact Details</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Mobile:</strong> ${mobileNumber}</p>
              ${alternateContact ? `<p><strong>Alternate:</strong> ${alternateContact}</p>` : ''}
            </div>
          </div>
          
          ${(street || city || state || pincode) ? `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; margin-bottom: 15px;">📍 Address</h3>
            ${street ? `<p><strong>Street:</strong> ${street}</p>` : ''}
            ${city ? `<p><strong>City:</strong> ${city}</p>` : ''}
            ${state ? `<p><strong>State:</strong> ${state}</p>` : ''}
            ${pincode ? `<p><strong>Pincode:</strong> ${pincode}</p>` : ''}
          </div>
          ` : ''}
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div>
              <h3 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; margin-bottom: 15px;">🎯 Academic Details</h3>
              <p><strong>Current Class:</strong> ${currentClass}</p>
              <p><strong>Target Exam:</strong> ${targetExam}</p>
              ${schoolCollege ? `<p><strong>School/College:</strong> ${schoolCollege}</p>` : ''}
              <p><strong>Preferred Batch:</strong> ${preferredBatch}</p>
            </div>
            
            <div>
              <h3 style="color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 8px; margin-bottom: 15px;">ℹ️ Additional Info</h3>
              ${sourceOfInformation ? `<p><strong>Source:</strong> ${sourceOfInformation}</p>` : ''}
              ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            </div>
          </div>
          
          <div style="background-color: #e8f5e8; border-left: 4px solid #27ae60; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
            <p style="margin: 0; color: #2c3e50;"><strong>📅 Enrollment Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              This is an automated notification from the Garud Classes enrollment system.<br>
              Please respond to the student's email: <strong>${email}</strong>
            </p>
          </div>
        </div>
      </div>
    `;

    // Send enrollment notification to admin
    const result = await emailService.sendCustomEmail(
      'tarunchoudhary0711@gmail.com',
      `New Student Enrollment - ${fullName} (${targetExam})`,
      enrollmentEmailHtml
    );
    
    if (result.success) {
      // Also send a confirmation email to the student
      const studentConfirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🎉 Enrollment Received!</h1>
              <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing Garud Classes</p>
            </div>
            
            <div style="background-color: #27ae60; color: white; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="margin: 0; font-size: 20px;">✅ Application Submitted Successfully</h2>
            </div>
            
            <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
              Dear <strong>${fullName}</strong>,
            </p>
            
            <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
              Thank you for submitting your enrollment application to Garud Classes! We have received your application for <strong>${targetExam}</strong> preparation.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin: 0 0 15px 0;">📋 Application Summary</h3>
              <p style="margin: 5px 0;"><strong>Target Exam:</strong> ${targetExam}</p>
              <p style="margin: 5px 0;"><strong>Current Class:</strong> ${currentClass}</p>
              <p style="margin: 5px 0;"><strong>Preferred Batch:</strong> ${preferredBatch}</p>
            </div>
            
            <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
              Our team will review your application and contact you within 24-48 hours to discuss the next steps, including course details, fee structure, and batch scheduling.
            </p>
            
            <div style="background-color: #e8f5e8; border-left: 4px solid #27ae60; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #2c3e50;"><strong>📞 Contact Information:</strong><br>
              If you have any urgent queries, please call us at our office number or reply to this email.</p>
            </div>
            
            <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
              We're excited to have you join our learning community and help you achieve your academic goals!
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
                Best regards,<br>
                <strong>The Garud Classes Team</strong>
              </p>
            </div>
          </div>
        </div>
      `;

      // Send confirmation to student (don't wait for this to complete)
      emailService.sendCustomEmail(email, 'Enrollment Application Received - Garud Classes', studentConfirmationHtml)
        .catch(err => console.log('Failed to send student confirmation:', err));

      res.json({
        success: true,
        message: 'Enrollment submitted successfully',
        data: {
          messageId: result.messageId,
          studentEmail: email,
          adminNotified: true
        }
      });
    } else {
      res.status(500).json({
        error: 'Failed to send enrollment notification',
        message: result.error
      });
    }

  } catch (error) {
    console.error('Send enrollment notification error:', error);
    res.status(500).json({
      error: 'Failed to send enrollment notification',
      message: 'An error occurred while processing the enrollment'
    });
  }
});

// @desc    Get email templates
// @route   GET /api/emails/templates
// @access  Private (Admins only)
router.get('/templates', protect, authorize('admin'), (req, res) => {
  try {
    const templates = [
      {
        name: 'welcome',
        description: 'Welcome email for new users',
        variables: ['userName']
      },
      {
        name: 'passwordReset',
        description: 'Password reset email',
        variables: ['resetLink']
      },
      {
        name: 'classReminder',
        description: 'Class reminder email',
        variables: ['className', 'startTime']
      }
    ];

    res.json({
      success: true,
      data: {
        templates,
        count: templates.length
      }
    });

  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({
      error: 'Failed to get email templates',
      message: 'An error occurred while fetching email templates'
    });
  }
});

module.exports = router;
