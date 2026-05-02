// Frontend API helper functions for token management and base URL configuration
// This is used in conjunction with @workspace/api-client-react

// SECURITY: Tokens are now stored in HttpOnly cookies by the backend
// Removed localStorage usage to prevent XSS attacks
// Cookies are automatically sent with requests

/**
 * Retrieve the authentication token - DEPRECATED
 * Tokens are now handled via HttpOnly cookies
 */
export function getAuthToken(): string | null {
  // No longer using localStorage for security
  return null;
}

/**
 * Store the authentication token - DEPRECATED
 * Tokens are now set by the backend in HttpOnly cookies
 */
export function setAuthToken(_token: string): void {
  // No longer using localStorage for security
  // Backend sets HttpOnly cookie on login
}

/**
 * Clear the authentication token - DEPRECATED
 * Tokens are cleared by the backend on logout
 */
export function clearAuthToken(): void {
  // No longer using localStorage for security
  // Backend clears HttpOnly cookie on logout
}

/**
 * Check if user is currently authenticated
 * Since we use HttpOnly cookies, we can't check directly from frontend
 * This will be determined by API responses (401 status)
 */
export function isAuthenticated(): boolean {
  // Cannot reliably check from frontend with HttpOnly cookies
  // Authentication status is determined by API call results
  return true; // Assume authenticated, let API handle auth checks
}

