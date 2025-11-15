export const handleApiError = (error: any): string => {
  // Network error (backend not running or CORS issue)
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Cannot connect to server. Make sure the backend is running on http://localhost:5001';
  }
  
  // Backend returned an error response
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Axios error message
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

