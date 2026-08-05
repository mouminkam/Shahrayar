"use client";
import { useState, useRef, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import OTPInput from "./OTPInput";
import useAuthStore from "../../../store/authStore";
import useToastStore from "../../../store/toastStore";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

interface OTPFormProps {
  flowType: "registration" | "reset" | null;
  phone: string;
  email: string;
}

export default function OTPForm({ flowType, phone, email }: OTPFormProps) {
  const { push } = useLocalizedRouter();
  // NOTE: `verifyOTP` is referenced here (pre-existing behavior from the JS
  // source) but is NOT defined on useAuthStore (see src/store/authStore.js) -
  // only `verifyPhoneOTP` exists. The "reset" flow branch below has always
  // called an undefined function at runtime; preserved as-is (bug, not fixed
  // per conversion scope) and flagged in the conversion report.
  const authStore = useAuthStore() as any;
  const { verifyPhoneOTP, verifyOTP, isLoading } = authStore as {
    verifyPhoneOTP: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>;
    verifyOTP?: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
    isLoading: boolean;
  };
  const { success: toastSuccess, error: toastError } = useToastStore();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpString = otp.join("");

    // Validate OTP format
    if (otpString.length !== 4) {
      toastError("Please enter the complete 4-digit OTP");
      return;
    }

    if (!/^\d{4}$/.test(otpString)) {
      toastError("OTP must contain only numbers");
      return;
    }

    if (flowType === "registration") {
      // Registration flow: verify phone OTP
      if (!phone) {
        toastError("Phone number not found. Please start registration again.");
        push("/register");
        return;
      }

        const result = await verifyPhoneOTP(phone, otpString);

        if (result.success) {
        toastSuccess("Phone verified successfully!");
        push("/add-information");
      } else {
        const resultWithErrors = result as { error?: string; errors?: { code?: string } };
        if (resultWithErrors.errors) {
          toastError(resultWithErrors.errors.code || result.error || "Invalid OTP code");
        } else {
          toastError(result.error || "Invalid OTP code. Please try again.");
        }
        // Clear OTP on error
          setOtp(["", "", "", ""]);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
        }
      } else if (flowType === "reset") {
      // Reset password flow: verify email OTP
      if (!email) {
        toastError("Email not found. Please start password reset again.");
        push("/reset-password");
        return;
      }

        const result = await verifyOTP?.(email, otpString);

        if (result?.success) {
        toastSuccess("OTP verified successfully!");
          push("/confirm-information");
        } else {
        toastError(result?.error || "Invalid OTP code. Please try again.");
        // Clear OTP on error
          setOtp(["", "", "", ""]);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OTPInput otp={otp} setOtp={setOtp} inputRefs={inputRefs} />

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={!isLoading ? { scale: 1.02 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        className="w-full bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white py-4 px-6 transition-all duration-300 text-base  font-semibold uppercase rounded-xl shadow-lg hover:shadow-xl hover:shadow-theme3/40 border border-theme3/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Verifying...
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>
    </form>
  );
}
