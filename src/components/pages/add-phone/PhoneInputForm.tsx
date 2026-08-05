"use client";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Phone, ArrowRight } from "lucide-react";

interface PhoneFormData {
  phone: string;
}

interface PhoneFormErrors {
  phone?: string;
}

export default function PhoneInputForm() {
  const [formData, setFormData] = useState<PhoneFormData>({
    phone: "",
  });
  const [errors, setErrors] = useState<PhoneFormErrors>({});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof PhoneFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: PhoneFormErrors = {};

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Pure frontend - basic UI validation only
    validateForm();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Phone */}
      <div>
        <label className="block text-text  text-sm font-medium mb-2">
          <Phone className="w-4 h-4 inline mr-1" />
          Enter your phone number
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-white/10 border ${
            errors.phone ? "border-red-500" : "border-white/20"
          } rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300`}
          placeholder="+963933310888"
        />
        {errors.phone && (
          <p className="mt-1 text-red-400 text-sm">{errors.phone}</p>
        )}
        <p className="mt-2 text-text text-xs">
          We&apos;ll send you a verification code via SMS
        </p>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white py-4 px-6 transition-all duration-300 text-base  font-semibold uppercase rounded-xl shadow-lg hover:shadow-xl hover:shadow-theme3/40 border border-theme3/30 flex items-center justify-center gap-2"
      >
            Continue
            <ArrowRight className="w-5 h-5" />
      </motion.button>
    </form>
  );
}
