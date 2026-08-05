"use client";
import { motion } from "framer-motion";
import ConfirmPasswordHeader from "./ConfirmPasswordHeader";
import ConfirmPasswordForm from "./ConfirmPasswordForm";

export default function ConfirmPasswordSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-8 lg:p-10"
    >
      <ConfirmPasswordHeader />
      <ConfirmPasswordForm />
    </motion.div>
  );
}
