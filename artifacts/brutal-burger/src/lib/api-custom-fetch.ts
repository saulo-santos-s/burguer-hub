// Patch the custom-fetch to attach Authorization header from localStorage
// This is called by the generated hooks via the custom mutator

export function getAuthToken(): string | null {
  return localStorage.getItem("brutal_burger_token");
}

export function clearAuthToken(): void {
  localStorage.removeItem("brutal_burger_token");
}
