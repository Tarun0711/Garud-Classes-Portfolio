# Troubleshooting Guide - Enrollment System

## Common Issues and Solutions

### 1. 404 Error - Endpoint Not Found

**Problem**: `POST http://localhost:8080/api/emails/enrollment 404 (Not Found)`

**Solution**: 
- The frontend is trying to connect to the wrong port
- Backend runs on port 5000, not 8080
- Make sure backend server is running

**Steps to fix**:
```bash
# 1. Check if backend is running
cd Backend
node test-backend-connection.js

# 2. If not running, start it
npm run dev

# 3. Verify the correct URL in frontend
# Should be: http://localhost:5000/api/emails/enrollment
```

### 2. Backend Server Not Running

**Problem**: Connection refused or timeout errors

**Solution**: Start the backend server

```bash
cd Backend
npm install  # If not done already
npm run dev
```

**Expected output**:
```
Server running on port 5000
MongoDB connected successfully
```

### 3. Email Configuration Missing

**Problem**: Emails not being sent

**Solution**: Set up environment variables

Create `.env` file in Backend folder:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Garud Classes <noreply@garudclasses.com>
```

### 4. CORS Issues

**Problem**: Frontend can't access backend

**Solution**: Check CORS configuration in server.js

The backend should have:
```javascript
app.use(cors(corsOptions));
app.use('/api/emails', emailRoutes);
```

### 5. Port Conflicts

**Problem**: Port 5000 already in use

**Solution**: Change port or kill existing process

```bash
# Option 1: Kill process on port 5000
npx kill-port 5000

# Option 2: Change port in .env
PORT=5001
```

### 6. Database Connection Issues

**Problem**: MongoDB connection failed

**Solution**: Check MongoDB and connection string

```bash
# Make sure MongoDB is running
mongod

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/garudclasses
```

## Testing Steps

### 1. Test Backend Connection
```bash
cd Backend
node test-backend-connection.js
```

### 2. Test Enrollment Endpoint
```bash
cd Backend
node test-enrollment.js
```

### 3. Test Frontend
1. Open enrollment modal
2. Fill out form
3. Submit
4. Check browser console for errors
5. Check backend console for requests

## Debug Information

### Frontend Console
- Check Network tab for API calls
- Look for CORS errors
- Verify request URL and payload

### Backend Console
- Check for incoming requests
- Look for validation errors
- Check email sending status

### Common Error Messages

**"Backend server not found"**
- Backend not running
- Wrong port number
- Firewall blocking connection

**"Invalid response from server"**
- Backend error
- JSON parsing issue
- Network timeout

**"Validation failed"**
- Required fields missing
- Invalid email format
- Invalid mobile number

## Quick Fix Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend using correct API URL
- [ ] Environment variables set
- [ ] MongoDB running
- [ ] CORS configured
- [ ] Email credentials valid
- [ ] Network accessible

## Still Having Issues?

1. Check the browser console for detailed errors
2. Check the backend console for server errors
3. Verify all environment variables are set
4. Test with the provided test scripts
5. Check if any antivirus/firewall is blocking connections
