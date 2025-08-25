# Enrollment Email Setup Guide

## Overview
The enrollment system automatically sends professional emails to both the admin (tarunchoudhary0711@gmail.com) and the student when an enrollment form is submitted.

## Required Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Garud Classes <noreply@garudclasses.com>
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

## API Endpoint

**POST** `/api/emails/enrollment`

### Request Body
```json
{
  "fullName": "Student Name",
  "dateOfBirth": "2005-06-15",
  "gender": "male",
  "email": "student@example.com",
  "mobileNumber": "9876543210",
  "alternateContact": "9876543211",
  "street": "123 Street",
  "city": "City",
  "state": "State",
  "pincode": "123456",
  "currentClass": "11th",
  "targetExam": "jee-main",
  "schoolCollege": "School Name",
  "preferredBatch": "evening",
  "sourceOfInformation": "website",
  "message": "Additional message"
}
```

### Response
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

## Email Templates

### Admin Notification
- **To**: tarunchoudhary0711@gmail.com
- **Subject**: "New Student Enrollment - [Name] ([Exam])"
- **Content**: Professional HTML email with all enrollment details

### Student Confirmation
- **To**: Student's email address
- **Subject**: "Enrollment Application Received - Garud Classes"
- **Content**: Confirmation email with application summary

## Testing

Use the test script to verify the endpoint:

```bash
cd Backend
npm install axios
node test-enrollment.js
```

## Features

- ✅ Professional HTML email templates
- ✅ Automatic admin notification
- ✅ Student confirmation email
- ✅ Form validation
- ✅ Error handling
- ✅ Responsive design
- ✅ All enrollment data included

## Security

- Public endpoint (no authentication required)
- Input validation and sanitization
- Rate limiting recommended for production
- CORS configured for frontend access
