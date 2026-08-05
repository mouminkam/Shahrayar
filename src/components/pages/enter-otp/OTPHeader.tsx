"use client";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";

interface OTPHeaderProps {
  phone: string;
  email: string;
  flowType: "registration" | "reset" | null;
}

export default function OTPHeader({ phone, email, flowType }: OTPHeaderProps) {
  return (
    <div className="text-center mb-8">
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-16 h-16 shadow-2xl rounded-xl bg-theme3 flex items-center justify-center mx-auto mb-4"
      >
        <KeyRound className="w-8 h-8 text-white fill-white" />
      </motion.div>
      <h2 className="text-theme3  text-3xl font-black uppercase mb-2">
        Verify OTP
      </h2>
      <p className="text-text text-base">
        {flowType === "registration"
          ? `Enter your OTP which has been sent to your phone ${phone ? `(${phone})` : ""} and complete verify your account.`
          : `Enter your OTP which has been sent to your email ${email ? `(${email})` : ""} and complete verify your account.`}
      </p>
    </div>
  );
}
