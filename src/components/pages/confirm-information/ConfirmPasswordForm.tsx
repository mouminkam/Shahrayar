"use client";
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import useAuthStore from "../../../store/authStore";
import useToastStore from "../../../store/toastStore";
import {
  confirmPasswordSchema,
  zodToFieldErrors,
} from "../../../lib/validations/authSchemas";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

interface ConfirmPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ConfirmPasswordFormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

export default function ConfirmPasswordForm() {
  const { push } = useLocalizedRouter();
  const { resetPassword, isLoading } = useAuthStore();
  const { success: toastSuccess, error: toastError } = useToastStore();

  const [formData, setFormData] = useState<ConfirmPasswordFormData>({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ConfirmPasswordFormErrors>({});
  const [resetToken, setResetToken] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  // Load reset token and email from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

      const token = sessionStorage.getItem("resetToken");
    const email = sessionStorage.getItem("resetEmail");

    if (!token || !email) {
      toastError("Reset session expired. Please start again.");
          push("/reset-password");
      return;
    }

    setResetToken(token);
    setResetEmail(email);
  }, [push, toastError]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof ConfirmPasswordFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const result = confirmPasswordSchema.safeParse(formData);
    if (!result.success) {
      setErrors(zodToFieldErrors(result.error.issues));
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!resetToken || !resetEmail) {
      toastError("Reset session expired. Please start again.");
      push("/reset-password");
      return;
    }

    const result = await resetPassword({
      token: resetToken,
      email: resetEmail,
      password: formData.newPassword,
      password_confirmation: formData.confirmPassword,
    });

      if (result.success) {
      // Cleanup sessionStorage
        if (typeof window !== "undefined") {
        sessionStorage.removeItem("resetToken");
          sessionStorage.removeItem("resetEmail");
        }

      toastSuccess("Password reset successfully! Please login with your new password.");
          push("/login");
    } else {
      // Handle errors
      if (result.errors) {
        setErrors(result.errors);
      } else {
        toastError(result.error || "Failed to reset password. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* New Password */}
      <div>
        <label className="block text-text  text-sm font-medium mb-2">
          <Lock className="w-4 h-4 inline mr-1" />
          Create new password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 pr-12 bg-white/10 border ${
              errors.newPassword ? "border-red-500" : "border-white/20"
            } rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300`}
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text hover:text-theme3 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-red-400 text-sm">{errors.newPassword}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-text  text-sm font-medium mb-2">
          <Lock className="w-4 h-4 inline mr-1" />
          Confirm password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 pr-12 bg-white/10 border ${
              errors.confirmPassword ? "border-red-500" : "border-white/20"
            } rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300`}
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text hover:text-theme3 transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-red-400 text-sm">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading || !resetToken || !resetEmail}
        whileHover={!isLoading && resetToken && resetEmail ? { scale: 1.02 } : {}}
        whileTap={!isLoading && resetToken && resetEmail ? { scale: 0.98 } : {}}
        className="w-full bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white py-4 px-6 transition-all duration-300 text-base  font-semibold uppercase rounded-xl shadow-lg hover:shadow-xl hover:shadow-theme3/40 border border-theme3/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Resetting...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Reset Password
          </>
        )}
      </motion.button>
    </form>
  );
}
