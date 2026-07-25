export function getNetworkErrorMessage(error: string): string {
  if (error.includes('localhost') || error.includes('127.0.0.1')) {
    return 'Network Error: Cannot use localhost on mobile device.\n\nTo fix:\n1. Find your computer IP: ifconfig (Mac/Linux) or ipconfig (Windows)\n2. Create .env file in ella folder\n3. Add: EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api\n4. Restart Expo';
  }
  
  if (error.includes('Network request failed') || error.includes('NETWORK_ERROR') || error.includes('Failed to fetch')) {
    return 'Cannot connect to server.\n\nPlease check:\n1. Backend is running (make docker-up)\n2. Correct IP address in EXPO_PUBLIC_API_URL\n3. Device and server are on the same network';
  }
  
  if (error.includes('user with this email already exists')) {
    return 'An account with this email already exists. Please log in instead.';
  }
  
  return error || 'An unexpected error occurred. Please try again.';
}
