// Configuration file for the application
export const config = {
  // Backend API configuration
  api: {
    baseURL: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-domain.com/api' 
      : 'http://localhost:5000/api',
    timeout: 10000, // 10 seconds
  },
  
  // Email configuration
  email: {
    adminEmail: 'tarunchoudhary0711@gmail.com',
  },
  
  // App configuration
  app: {
    name: 'Garud Classes',
    version: '1.0.0',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${config.api.baseURL}${endpoint}`;
};
