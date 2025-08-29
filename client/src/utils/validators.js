// utils/validators.js
export function validateLoginForm({ email, password }) {
  if (!email || !password) return "Both email and password are required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
}
