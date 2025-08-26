# Garud Classes Backend

A comprehensive backend API for the Garud Classes educational platform, built with Node.js, Express, MongoDB, and featuring file uploads, email services, and role-based access control.

## 🚀 Features

- **User Management**: Registration, authentication, and role-based access control
- **Course Management**: Create, update, and manage educational courses
- **Class Scheduling**: Schedule and manage live classes with attendance tracking
- **File Uploads**: Secure file handling with Multer for various file types
- **Email Services**: Automated email notifications and reminders
- **MongoDB Integration**: Robust data persistence with Mongoose ODM
- **Security**: JWT authentication, input validation, and security middleware
- **API Documentation**: Comprehensive REST API endpoints

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Email Service**: Nodemailer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan

## 📁 Project Structure

```
Backend/
├── config/                 # Configuration files
│   ├── database.js        # MongoDB connection
│   ├── email.js           # Email service configuration
│   └── upload.js          # File upload configuration
├── middleware/            # Custom middleware
│   ├── auth.js            # Authentication middleware
│   └── validate.js        # Input validation middleware
├── models/                # MongoDB models
│   ├── User.js            # User model
│   ├── Course.js          # Course model
│   └── Class.js           # Class model
├── routes/                # API routes
│   ├── auth.js            # Authentication routes
│   ├── users.js           # User management routes
│   ├── courses.js         # Course management routes
│   ├── classes.js         # Class management routes
│   ├── uploads.js         # File upload routes
│   └── emails.js          # Email service routes
├── uploads/               # File upload directory
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── env.example            # Environment variables template
└── README.md              # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Configure Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/garud-classes
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Email Configuration (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=Garud Classes <noreply@garudclasses.com>
   
   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Verify the server is running**
   ```bash
   curl http://localhost:5000/health
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | User registration | Public |
| POST | `/auth/login` | User login | Public |
| GET | `/auth/me` | Get current user | Private |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/reset-password` | Reset password | Public |
| POST | `/auth/verify-email` | Verify email address | Public |
| POST | `/auth/logout` | User logout | Private |

### User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users` | Get all users (paginated) | Admin |
| GET | `/users/:id` | Get user by ID | Private |
| PUT | `/users/:id` | Update user profile | Private |
| PATCH | `/users/:id/role` | Update user role | Admin |
| PATCH | `/users/:id/status` | Toggle user status | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/users/search` | Search users | Private |

### Course Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/courses` | Get all courses (paginated) | Public |
| GET | `/courses/:id` | Get course by ID | Public |
| POST | `/courses` | Create new course | Teacher/Admin |
| PUT | `/courses/:id` | Update course | Teacher/Admin |
| DELETE | `/courses/:id` | Delete course | Teacher/Admin |
| PATCH | `/courses/:id/publish` | Publish/unpublish course | Teacher/Admin |
| POST | `/courses/:id/materials` | Add course material | Teacher/Admin |
| POST | `/courses/:id/reviews` | Add course review | Private |
| GET | `/courses/featured` | Get featured courses | Public |
| GET | `/courses/category/:category` | Get courses by category | Public |
| GET | `/courses/search` | Search courses | Public |

### Class Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/classes` | Get all classes (paginated) | Private |
| GET | `/classes/:id` | Get class by ID | Private |
| POST | `/classes` | Create new class | Teacher/Admin |
| PUT | `/classes/:id` | Update class | Teacher/Admin |
| DELETE | `/classes/:id` | Delete class | Teacher/Admin |
| POST | `/classes/:id/enroll` | Enroll in class | Private |
| DELETE | `/classes/:id/enroll` | Unenroll from class | Private |
| POST | `/classes/:id/attendance` | Mark attendance | Teacher/Admin |
| PATCH | `/classes/:id/status` | Update class status | Teacher/Admin |
| GET | `/classes/upcoming` | Get upcoming classes | Private |
| GET | `/classes/:id/stats` | Get class statistics | Teacher/Admin |

### File Uploads

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/uploads/single` | Upload single file | Private |
| POST | `/uploads/multiple` | Upload multiple files | Private |
| POST | `/uploads/profile-image` | Upload profile image | Private |
| POST | `/uploads/course-materials` | Upload course materials | Teacher/Admin |
| POST | `/uploads/class-recording` | Upload class recording | Teacher/Admin |
| POST | `/uploads/fields` | Upload with specific fields | Private |
| DELETE | `/uploads/:filename` | Delete uploaded file | Private |
| GET | `/uploads/:filename` | Get file info | Private |

### Email Services

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/emails/welcome` | Send welcome email | Admin |
| POST | `/emails/class-reminder` | Send class reminder | Teacher/Admin |
| POST | `/emails/course-announcement` | Send course announcement | Teacher/Admin |
| POST | `/emails/custom` | Send custom email | Admin |
| POST | `/emails/bulk` | Send bulk emails | Admin |
| POST | `/emails/password-reset` | Send password reset email | Public |
| GET | `/emails/templates` | Get email templates | Admin |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 File Uploads

The system supports various file types:
- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, Word, Text files
- **Videos**: MP4, MPEG, QuickTime, AVI
- **Audio**: MP3, WAV, OGG, M4A

Files are automatically organized into subdirectories based on type and stored securely.

## 📧 Email Service

Configured to work with Gmail SMTP. Supports:
- Welcome emails for new users
- Password reset emails
- Class reminders
- Course announcements
- Custom email templates

## 🗄️ Database Models

### User Model
- Basic info (name, email, password)
- Role-based access (student, teacher, admin)
- Profile information and preferences
- Email verification and password reset

### Course Model
- Course details and metadata
- Instructor assignment
- Materials and lessons
- Reviews and ratings
- Enrollment tracking

### Class Model
- Class scheduling and timing
- Student enrollment
- Attendance tracking
- Materials and recordings
- Meeting information

## 🚀 Development

### Available Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/garud-classes

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Garud Classes <noreply@garudclasses.com>

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Protection against abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Password Hashing**: Bcrypt password encryption
- **Role-based Access**: Granular permission control

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set production environment variables
2. **Database**: Use production MongoDB instance
3. **File Storage**: Consider cloud storage for uploads
4. **Email Service**: Configure production email service
5. **SSL**: Enable HTTPS in production
6. **Monitoring**: Add logging and monitoring

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- User authentication and management
- Course and class management
- File upload system
- Email service integration
- Comprehensive API endpoints

---

**Built with ❤️ for Garud Classes**
