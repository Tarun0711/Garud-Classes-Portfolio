# Toppers API Documentation

This document describes the Toppers API endpoints for managing student achievements and results.

## Base URL
```
http://localhost:5000/api/toppers
```

## Endpoints

### 1. Get All Active Toppers (Public)
**GET** `/api/toppers`

Returns all active toppers with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by category (JEE Advanced, JEE Main, NEET, Other)
- `year` (optional): Filter by year
- `featured` (optional): Filter by featured status (true/false)
- `limit` (optional): Limit number of results (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "toppers": [
      {
        "_id": "topper_id",
        "name": "Student Name",
        "exam": "JEE Advanced 2024",
        "rank": "AIR 1",
        "score": "354/360",
        "imageUrl": "/api/images/filename.jpg",
        "course": "2-Year JEE Program",
        "achievement": "IIT Bombay - Computer Science",
        "year": 2024,
        "category": "JEE Advanced",
        "featured": true
      }
    ],
    "count": 1
  }
}
```

### 2. Get All Toppers (Admin)
**GET** `/api/toppers/manage`

Returns all toppers for admin management (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

### 3. Create New Topper (Admin)
**POST** `/api/toppers`

Creates a new topper entry.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `name` (required): Student name
- `exam` (required): Exam name
- `rank` (required): Rank achieved
- `score` (required): Score achieved
- `course` (required): Course taken
- `achievement` (required): Achievement description
- `year` (required): Year of achievement
- `category` (optional): Category (JEE Advanced, JEE Main, NEET, Other)
- `isActive` (optional): Active status (default: true)
- `order` (optional): Display order (default: 0)
- `featured` (optional): Featured status (default: false)
- `file` (required): Student image file

### 4. Update Topper (Admin)
**PUT** `/api/toppers/:id`

Updates an existing topper entry.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:** Same as create, but all fields are optional.

### 5. Toggle Topper Status (Admin)
**PATCH** `/api/toppers/:id/toggle`

Toggles the active status of a topper.

**Headers:**
```
Authorization: Bearer <token>
```

### 6. Toggle Topper Featured Status (Admin)
**PATCH** `/api/toppers/:id/featured`

Toggles the featured status of a topper.

**Headers:**
```
Authorization: Bearer <token>
```

### 7. Delete Topper (Admin)
**DELETE** `/api/toppers/:id`

Deletes a topper entry and associated image file.

**Headers:**
```
Authorization: Bearer <token>
```

### 8. Get Topper Statistics (Public)
**GET** `/api/toppers/stats`

Returns statistics about toppers.

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalToppers": 50,
      "top10Ranks": 15,
      "top100Ranks": 200,
      "jeeAdvanced": 20,
      "jeeMain": 15,
      "neet": 15
    },
    "yearStats": [
      {
        "_id": 2024,
        "count": 25
      },
      {
        "_id": 2023,
        "count": 15
      }
    ]
  }
}
```

## Data Model

### Topper Schema
```javascript
{
  name: String (required, max 100 chars),
  exam: String (required, max 100 chars),
  rank: String (required, max 50 chars),
  score: String (required, max 50 chars),
  image: {
    filename: String (required),
    originalName: String (required),
    mimetype: String (required),
    size: Number (required),
    path: String (required)
  },
  course: String (required, max 100 chars),
  achievement: String (required, max 200 chars),
  year: Number (required, 2000-2030),
  category: String (enum: ['JEE Advanced', 'JEE Main', 'NEET', 'Other']),
  isActive: Boolean (default: true),
  order: Number (default: 0),
  featured: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Examples

### Frontend Integration

```typescript
import { fetchToppers, createTopper, updateTopper, deleteTopper } from '../lib/api';

// Fetch featured toppers
const toppers = await fetchToppers({ featured: true, limit: 8 });

// Create new topper
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('exam', 'JEE Advanced 2024');
formData.append('rank', 'AIR 1');
formData.append('score', '354/360');
formData.append('course', '2-Year JEE Program');
formData.append('achievement', 'IIT Bombay - Computer Science');
formData.append('year', '2024');
formData.append('category', 'JEE Advanced');
formData.append('file', imageFile);

const newTopper = await createTopper(formData);
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

Error responses include:
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Image Handling

- Images are stored in the `uploads/images/` directory
- Supported formats: JPG, PNG, GIF, WebP
- Maximum file size: 5MB
- Images are automatically resized and optimized
- Old images are deleted when updating or deleting toppers
