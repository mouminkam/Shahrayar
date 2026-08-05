"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import OTPHeader from "./OTPHeader";
import OTPForm from "./OTPForm";
import OTPFooter from "./OTPFooter";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

type FlowType = "registration" | "reset" | null;

export default function OTPSection() {
  const { push } = useLocalizedRouter();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [flowType, setFlowType] = useState<FlowType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check for registration flow
      const registrationPhone = sessionStorage.getItem("registrationPhone");
      if (registrationPhone) {
        setPhone(registrationPhone);
        setFlowType("registration");
        setIsLoading(false);
      return;
    }

    // Check for reset password flow
    const resetEmail = sessionStorage.getItem("resetEmail");
    if (resetEmail) {
        setEmail(resetEmail);
        setFlowType("reset");
        setIsLoading(false);
      return;
    }

    // No flow data found - redirect to register
        push("/register");
  }, [push]);

  if (isLoading || !flowType) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-8 lg:p-10"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-theme3 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-8 lg:p-10"
    >
      <OTPHeader phone={phone} email={email} flowType={flowType} />
      <OTPForm flowType={flowType} phone={phone} email={email} />
      <OTPFooter flowType={flowType} phone={phone} email={email} />
    </motion.div>
  );
}
