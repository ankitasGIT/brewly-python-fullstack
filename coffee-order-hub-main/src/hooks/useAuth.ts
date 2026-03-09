import { useMutation } from "@tanstack/react-query";
import { loginUser, signupUser, type LoginRequest, type SignupRequest } from "@/api/authApi";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginUser(data),
    onSuccess: (response) => {
      login(response.access_token);
      const role = useAuthStore.getState().role;
      toast({ title: "Welcome back!", description: "You've been logged in successfully." });
      navigate(role === "manager" ? "/manager/dashboard" : "/menu");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      const detail = error?.response?.data?.detail || "Invalid email or password.";
      toast({ title: "Login failed", description: detail, variant: "destructive" });
    },
  });
}

export function useSignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: SignupRequest) => signupUser(data),
    onSuccess: () => {
      toast({ title: "Account created!", description: "You can now log in with your credentials." });
      navigate("/login");
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      const detail = error?.response?.data?.detail || "Could not create account.";
      toast({ title: "Signup failed", description: detail, variant: "destructive" });
    },
  });
}
