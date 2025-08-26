# Enrollment Modal for Garud Classes

## Overview
This enrollment modal provides a comprehensive form for student enrollment with all the required fields organized into logical sections.

## Features

### Basic Details
- **Full Name** (Required) - Text input with validation
- **Date of Birth** (Optional) - Date picker
- **Gender** (Optional) - Dropdown with Male/Female/Other options

### Contact Information
- **Email Address** (Required) - Email input with format validation
- **Mobile Number** (Required) - 10-digit numeric input with validation
- **Alternate Contact Number** (Optional) - 10-digit numeric input
- **Address** - Complete address fields:
  - Street Address
  - City
  - State
  - Pincode

### Academic Details
- **Class Currently Studying** (Required) - Dropdown: 8th, 9th, 10th, 11th, 12th, Dropper
- **Target Exam** (Required) - Dropdown: JEE Main, JEE Advanced, NEET, Foundation
- **School/College Name** (Optional) - Text input
- **Preferred Batch Timing** (Required) - Dropdown: Morning, Afternoon, Evening

### Additional Information
- **How did you hear about us?** (Optional) - Dropdown: Friends, Social Media, Website, Seminar, Other
- **Message/Query** (Optional) - Textarea for additional information

## Technical Implementation

### Components Used
- **EnrollmentModal** - Main modal component (`src/components/ui/enrollment-modal.tsx`)
- **Button** - For submit and cancel actions
- **Input** - For text and date inputs
- **Select** - For dropdown selections
- **Textarea** - For message input
- **Label** - For form field labels

### State Management
- Form data is managed using React useState
- Form validation with error handling
- Loading state during submission

### Validation Rules
- Full Name: Required, non-empty
- Email: Required, valid email format
- Mobile Number: Required, exactly 10 digits
- Current Class: Required selection
- Target Exam: Required selection
- Preferred Batch: Required selection

### Styling
- Uses Tailwind CSS for responsive design
- Framer Motion for smooth animations
- Custom CSS classes for hero buttons
- Responsive grid layout for form fields

## Usage

### Opening the Modal
The modal is triggered by clicking the "Enroll Now" button in the Navigation component:

```tsx
<button 
  className="btn-hero"
  onClick={() => setIsEnrollmentModalOpen(true)}
>
  Enroll Now
</button>
```

### Modal State
```tsx
const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
```

### Modal Component
```tsx
<EnrollmentModal 
  isOpen={isEnrollmentModalOpen}
  onClose={() => setIsEnrollmentModalOpen(false)}
/>
```

## Form Submission

### Current Implementation
- Simulates API call with 2-second delay
- Shows loading state during submission
- Displays success/error messages
- Resets form and closes modal on success

### Customization
To integrate with your actual API:

1. Replace the simulated API call in `handleSubmit`:
```tsx
// Replace this:
await new Promise(resolve => setTimeout(resolve, 2000));

// With your actual API call:
const response = await fetch('/api/enroll', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

2. Handle the response appropriately:
```tsx
if (response.ok) {
  // Success handling
  setFormData(initialFormData);
  setErrors({});
  onClose();
  // Show success toast
} else {
  // Error handling
  const errorData = await response.json();
  // Handle specific errors
}
```

## Styling Customization

### Button Styles
The hero button styles are defined in `src/App.css`:

```css
.btn-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  /* ... more styles */
}
```

### Modal Styling
The modal uses Tailwind CSS classes and can be customized by modifying the className props in the EnrollmentModal component.

## Dependencies
- React 18+
- Framer Motion (for animations)
- Lucide React (for icons)
- Radix UI components (Select, Dialog, etc.)
- Tailwind CSS (for styling)

## Browser Support
- Modern browsers with ES6+ support
- Responsive design for mobile and desktop
- Touch-friendly interface for mobile devices

## Accessibility
- Proper form labels and IDs
- ARIA attributes for screen readers
- Keyboard navigation support
- Focus management
- Error messages for validation failures
