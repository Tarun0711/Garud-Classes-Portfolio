import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, MapPin, GraduationCap, Clock, MessageSquare } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Textarea } from "./textarea";
import { getApiUrl } from "../../lib/config";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EnrollmentFormData {
  // Basic Details
  fullName: string;
  dateOfBirth: string;
  gender: string;
  
  // Contact Information
  email: string;
  mobileNumber: string;
  alternateContact: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  
  // Academic Details
  currentClass: string;
  targetExam: string;
  schoolCollege: string;
  preferredBatch: string;
  
  // Additional Information
  sourceOfInformation: string;
  message: string;
}

const initialFormData: EnrollmentFormData = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  mobileNumber: "",
  alternateContact: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  currentClass: "",
  targetExam: "",
  schoolCollege: "",
  preferredBatch: "",
  sourceOfInformation: "",
  message: "",
};

export function EnrollmentModal({ isOpen, onClose }: EnrollmentModalProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<EnrollmentFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof EnrollmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EnrollmentFormData> = {};

    // Required field validations
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    }

    if (!formData.currentClass) {
      newErrors.currentClass = "Current class is required";
    }

    if (!formData.targetExam) {
      newErrors.targetExam = "Target exam is required";
    }

    if (!formData.preferredBatch) {
      newErrors.preferredBatch = "Preferred batch timing is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Call the actual backend enrollment endpoint using config
      const response = await fetch(getApiUrl('/emails/enrollment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Backend server not found. Please make sure the backend is running on port 5000.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Request failed with status: ${response.status}`);
        }
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response from server. Please try again.');
      }
      
      if (result.success) {
        // Success - reset form and close modal
        setFormData(initialFormData);
        setErrors({});
        onClose();
        
        // Show success message
        alert("Enrollment form submitted successfully! We'll get back to you soon.");
      } else {
        // Handle error response
        const errorMessage = result.message || result.error || 'There was an error submitting the form.';
        alert(`Error: ${errorMessage}`);
      }
      
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error instanceof Error ? error.message : 'There was an error submitting the form. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData(initialFormData);
      setErrors({});
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Student Enrollment</h2>
                    <p className="text-sm text-gray-600">Join Garud Classes for excellence in education</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Details Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Basic Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">
                      Gender
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Phone className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email address"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber" className="text-sm font-medium">
                      Mobile Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      className={errors.mobileNumber ? "border-red-500" : ""}
                    />
                    {errors.mobileNumber && (
                      <p className="text-sm text-red-500">{errors.mobileNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alternateContact" className="text-sm font-medium">
                      Alternate Contact Number
                    </Label>
                    <Input
                      id="alternateContact"
                      value={formData.alternateContact}
                      onChange={(e) => handleInputChange("alternateContact", e.target.value)}
                      placeholder="Enter alternate contact number"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Address Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-sm font-medium">
                      Street Address
                    </Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => handleInputChange("street", e.target.value)}
                      placeholder="Enter street address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">
                        City
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium">
                        State
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-sm font-medium">
                        Pincode
                      </Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                        placeholder="Enter pincode"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Details Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Academic Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentClass" className="text-sm font-medium">
                      Class Currently Studying <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.currentClass} onValueChange={(value) => handleInputChange("currentClass", value)}>
                      <SelectTrigger className={errors.currentClass ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select current class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8th">8th</SelectItem>
                        <SelectItem value="9th">9th</SelectItem>
                        <SelectItem value="10th">10th</SelectItem>
                        <SelectItem value="11th">11th</SelectItem>
                        <SelectItem value="12th">12th</SelectItem>
                        <SelectItem value="dropper">Dropper</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.currentClass && (
                      <p className="text-sm text-red-500">{errors.currentClass}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetExam" className="text-sm font-medium">
                      Target Exam <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.targetExam} onValueChange={(value) => handleInputChange("targetExam", value)}>
                      <SelectTrigger className={errors.targetExam ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select target exam" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jee-main">JEE Main</SelectItem>
                        <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
                        <SelectItem value="neet">NEET</SelectItem>
                        <SelectItem value="foundation">Foundation</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.targetExam && (
                      <p className="text-sm text-red-500">{errors.targetExam}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolCollege" className="text-sm font-medium">
                      School/College Name
                    </Label>
                    <Input
                      id="schoolCollege"
                      value={formData.schoolCollege}
                      onChange={(e) => handleInputChange("schoolCollege", e.target.value)}
                      placeholder="Enter school/college name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredBatch" className="text-sm font-medium">
                      Preferred Batch Timing <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.preferredBatch} onValueChange={(value) => handleInputChange("preferredBatch", value)}>
                      <SelectTrigger className={errors.preferredBatch ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select batch timing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.preferredBatch && (
                      <p className="text-sm text-red-500">{errors.preferredBatch}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceOfInformation" className="text-sm font-medium">
                      How did you hear about us?
                    </Label>
                    <Select value={formData.sourceOfInformation} onValueChange={(value) => handleInputChange("sourceOfInformation", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source of information" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friends">Friends</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Message / Query
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us about your goals, questions, or any specific requirements..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Enrollment"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
