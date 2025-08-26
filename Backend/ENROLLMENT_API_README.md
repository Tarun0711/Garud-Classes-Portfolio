# Enrollment API Documentation

## Overview
The Enrollment API provides a complete system for handling student enrollment applications with automatic email notifications.

## Endpoints

### 1. Submit Enrollment Application
**POST** `/api/emails/enrollment`

Submits a student enrollment application and sends notification emails.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "fullName": "string (required)",
  "dateOfBirth": "string (YYYY-MM-DD)",
  "gender": "string (male/female/other)",
  "email": "string (required, valid email)",
  "mobileNumber": "string (required, 10 digits)",
  "alternateContact": "string (optional)",
  "street": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)",
  "pincode": "string (optional, 6 digits)",
  "currentClass": "string (required)",
  "targetExam": "string (required)",
  "schoolCollege": "string (optional)",
  "preferredBatch": "string (required)",
  "sourceOfInformation": "string (optional)",
  "message": "string (optional)"
}
```

#### Field Validation
- **fullName**: Required, non-empty string
- **email**: Required, valid email format
- **mobileNumber**: Required, exactly 10 digits
- **currentClass**: Required, must be selected
- **targetExam**: Required, must be selected
- **preferredBatch**: Required, must be selected

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "Enrollment submitted successfully",
  "data": {
    "messageId": "email-message-id",
    "studentEmail": "student@example.com",
    "adminNotified": true
  }
}
```

**Validation Error (400)**
```json
{
  "error": "Validation failed",
  "message": "Field validation errors"
}
```

**Server Error (500)**
```json
{
  "error": "Failed to send enrollment notification",
  "message": "Error details"
}
```

## Email Notifications

### Admin Notification
- **Recipient**: tarunchoudhary0711@gmail.com
- **Subject**: "New Student Enrollment - [Name] ([Exam])"
- **Content**: Professional HTML email with complete enrollment details

### Student Confirmation
- **Recipient**: Student's email address
- **Subject**: "Enrollment Application Received - Garud Classes"
- **Content**: Confirmation email with application summary and next steps

## Email Template Features

### Admin Email Includes:
- 🎓 Student's full enrollment details
- 📞 Contact information
- 🎯 Academic preferences
- 📍 Address details
- 📅 Enrollment timestamp
- 📋 Professional formatting

### Student Email Includes:
- ✅ Confirmation of application receipt
- 📋 Application summary
- ⏰ Next steps timeline
- 📞 Contact information
- 🎯 Course details

## Implementation Details

### Backend Files Modified:
1. **`routes/emails.js`** - Added enrollment endpoint
2. **`config/email.js`** - Email configuration and templates

### Frontend Files Modified:
1. **`components/ui/enrollment-modal.tsx`** - Updated form submission

### Dependencies:
- `nodemailer` - Email sending
- `express-validator` - Input validation
- `cors` - Cross-origin requests

## Setup Requirements

### Environment Variables:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Garud Classes <noreply@garudclasses.com>
```

### Gmail Configuration:
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in EMAIL_PASS

## Testing

### Test Script:
```bash
cd Backend
npm install axios
node test-enrollment.js
```

### Manual Testing:
1. Fill out enrollment form on frontend
2. Submit form
3. Check admin email (tarunchoudhary0711@gmail.com)
4. Check student confirmation email
5. Verify API response

## Security Features

- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting support
- ✅ Error handling
- ✅ Professional email templates
- ✅ No sensitive data exposure

## Production Considerations

- Add rate limiting for enrollment endpoint
- Implement CAPTCHA for spam prevention
- Add email queue system for high volume
- Monitor email delivery rates
- Set up email bounce handling
- Implement enrollment data storage

## Support

For technical support or questions about the enrollment system, please refer to the main project documentation or contact the development team.
