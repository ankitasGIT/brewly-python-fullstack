import api from "./axios";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: "customer" | "manager";
  created_at: string;
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", data.username);
  formData.append("password", data.password);

  const response = await api.post<LoginResponse>("/auth/token", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
}

export async function signupUser(data: SignupRequest): Promise<UserResponse> {
  const response = await api.post<UserResponse>("/auth/signup", data);
  return response.data;
}
