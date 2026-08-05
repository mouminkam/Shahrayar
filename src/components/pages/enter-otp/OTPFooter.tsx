"use client";
import { useState, useEffect } from "react";
import useAuthStore from "../../../store/authStore";
import useToastStore from "../../../store/toastStore";

interface OTPFooterProps {
  flowType: "registration" | "reset" | null;
  phone: string;
  email: string;
}

export default function OTPFooter({ flowType, phone, email }: OTPFooterProps) {
  const { registerPhone, resetPasswordRequest, isLoading } = useAuthStore();
  const { success: toastSuccess, error: toastError } = useToastStore();

  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleResend = async () => {
    if (!canResend || isLoading) return;

      if (flowType === "registration") {
      // Resend OTP for registration
      if (!phone) {
        toastError("Phone number not found");
        return;
      }

      // Get password from sessionStorage
      const password = sessionStorage.getItem("registrationPassword");
      if (!password) {
        toastError("Registration data not found. Please start again.");
          return;
        }

        const result = await registerPhone({
          phone: phone,
        password: password,
        password_confirmation: password,
        });

        if (result.success) {
          toastSuccess("OTP resent to your phone");
          setResendTimer(60);
          setCanResend(false);
        } else {
          toastError(result.error || "Failed to resend OTP");
        }
      } else if (flowType === "reset") {
      // Resend OTP for password reset
      if (!email) {
        toastError("Email not found");
        return;
      }

        const result = await resetPasswordRequest(email);

        if (result.success) {
          toastSuccess("OTP resent to your email");
          setResendTimer(60);
          setCanResend(false);
        } else {
          toastError(result.error || "Failed to resend OTP");
        }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mt-6 text-center space-y-2">
      <p className="text-theme3 text-sm font-medium">
        {flowType === "registration"
          ? "A code has been sent to your phone"
          : "A code has been sent to your email"}
      </p>
      {canResend ? (
        <button
          type="button"
          onClick={handleResend}
          className="text-theme3 hover:text-theme text-sm font-medium transition-colors underline"
        >
          Resend code
        </button>
      ) : (
        <p className="text-text text-sm">
          Resend in {formatTime(resendTimer)}
        </p>
      )}
    </div>
  );
}
