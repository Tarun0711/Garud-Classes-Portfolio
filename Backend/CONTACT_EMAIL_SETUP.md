# Contact Form Email Setup

This document explains how the contact form email functionality works in the Garud Classes application.

## Overview

The contact form on the website now sends professional email notifications to the admin when someone submits an inquiry. The system also sends a confirmation email to the person who submitted the form.

## Email Flow

### 1. Contact Form Submission
When a user submits the contact form on the website:
- Form data is sent to `/api/emails/contact` endpoint
- A professional notification email is sent to `tarunchoudhary0711@gmail.com`
- A confirmation email is sent to the user's email address

### 2. Email Content

#### Admin Notification Email
- **Subject**: "New Contact Form Inquiry - [Name]"
- **Recipient**: tarunchoudhary0711@gmail.com
- **Content**: Professional HTML email with all form details including:
  - Contact information (name, email, phone)
  - Course interest and preferred contact time
  - User's message
  - Submission timestamp

#### User Confirmation Email
- **Subject**: "Inquiry Received - Garud Classes"
- **Recipient**: User's email address
- **Content**: Confirmation email thanking them and providing next steps

## API Endpoint

### POST /api/emails/contact

**Required Fields:**
- `name` (string) - Full name of the inquirer
- `email` (string) - Valid email address
- `phone` (string) - Phone number

**Optional Fields:**
- `course` (string) - Course of interest
- `message` (string) - Additional message/query
- `preferredTime` (string) - Preferred contact time

**Response:**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "data": {
    "messageId": "email-message-id",
    "inquirerEmail": "user@example.com",
    "adminNotified": true
  }
}
```

## Testing

To test the email functionality:

1. Make sure your `.env` file has the correct SMTP settings:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Garud Classes
```

2. Run the test script:
```bash
node test-contact-email.js
```

3. Check your email (tarunchoudhary0711@gmail.com) for the test email.

## Frontend Integration

The contact form in `GarudClassesWeb/src/pages/Contact.tsx` has been updated to:
- Use the proper API endpoint (`/api/emails/contact`)
- Handle success and error responses
- Show appropriate toast notifications
- Reset the form on successful submission

## Error Handling

The system handles various error scenarios:
- Invalid email addresses
- Missing required fields
- SMTP connection issues
- Network errors

All errors are logged and appropriate error messages are returned to the frontend.

## Security

- Input validation is performed on all form fields
- Email addresses are validated before sending
- SMTP credentials are stored securely in environment variables
- No sensitive data is logged

## Troubleshooting

### Common Issues:

1. **Emails not sending**: Check SMTP settings in `.env`
2. **Authentication errors**: Ensure you're using Gmail App Password, not regular password
3. **2-Step Verification**: Must be enabled on Gmail account
4. **Port issues**: Use port 587 for Gmail SMTP

### Debug Steps:

1. Check server logs for error messages
2. Verify SMTP settings with test script
3. Ensure backend server is running on port 5000
4. Check network connectivity

## Files Modified

- `Backend/routes/emails.js` - Added contact email endpoint
- `Backend/config/email.js` - Added sendCustomEmail function
- `GarudClassesWeb/src/pages/Contact.tsx` - Updated form submission
- `Backend/test-contact-email.js` - Test script for email functionality

