"use client";
// Added "use client" - This component uses framer-motion animations which require client-side rendering
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

export default function LoginHeader() {
  return (
    <div className="text-center mb-8">
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-16 h-16 shadow-2xl rounded-xl bg-theme3 flex items-center justify-center mx-auto mb-4"
      >
        <LogIn className="w-8 h-8 text-white fill-white" />
      </motion.div>
      <h2 className="text-theme3  text-3xl font-black uppercase mb-2">
        Welcome Back
      </h2>
      <p className="text-text text-base">
        Welcome back! Please enter your details.
      </p>
    </div>
  );
}
