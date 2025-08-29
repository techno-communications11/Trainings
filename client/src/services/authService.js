// services/authService.js
export async function loginUser(credentials) {
  const response = await fetch(`${process.env.REACT_APP_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");

  return data;
}


export async function registerUser(userData) {
  const response = await fetch(`${process.env.REACT_APP_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return data;
}
