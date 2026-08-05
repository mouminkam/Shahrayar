"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Lock, UserPlus, Eye, EyeOff } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../../lib/validations/authSchemas";
import useAuthStore from "../../../store/authStore";
import useToastStore from "../../../store/toastStore";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import LegalModal from "../../ui/LegalModal";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

// The zod schema types `agreeToTerms` as the literal `true` (via z.literal(true))
// so that validation fails until checked. The form itself needs to hold a plain
// boolean (starts false), so we widen just that field for the RHF form type
// while zodResolver still enforces the literal-true check at runtime.
interface RegisterFormData {
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export default function RegisterForm() {
  const { push } = useLocalizedRouter();
  const { registerPhone, isLoading } = useAuthStore();
  const { success: toastSuccess, error: toastError } = useToastStore();
  const { lang } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as Resolver<RegisterFormData>,
    mode: "onChange",
    defaultValues: {
      phone: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const agreeToTerms = watch("agreeToTerms");

  const onSubmit = async (data: RegisterFormData) => {
    const result = await registerPhone({
      phone: data.phone,
      password: data.password,
      password_confirmation: data.confirmPassword,
    });

    if (result.success) {
      // Save phone and password in sessionStorage for OTP verification and resend
      if (typeof window !== "undefined") {
        sessionStorage.setItem("registrationPhone", data.phone);
        sessionStorage.setItem("registrationPassword", data.password);
      }

      toastSuccess("OTP sent to your phone. Please verify your number.");
      push("/enter-otp");
    } else {
      // Handle errors
      if (result.errors) {
        // Server-side errors will be shown via toast
        const errorMessages = Object.values(result.errors).flat();
        if (errorMessages.length > 0) {
          toastError(errorMessages.join(", "));
        }
      } else {
        toastError(result.error || "Registration failed. Please try again.");
      }
    }
  };

  const handleTermsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsTermsOpen(true);
  };

  const handlePrivacyClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsPrivacyOpen(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Phone */}
        <div>
          <label className="block text-text  text-sm font-medium mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone number
          </label>
          <input
            type="tel"
            {...register("phone")}
            className={`w-full px-4 py-3 bg-white/10 border ${
              errors.phone ? "border-red-500" : "border-white/20"
            } rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300`}
            placeholder="Enter your phone number"
          />
          {errors.phone && (
            <p className="mt-1 text-red-400 text-sm">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-text  text-sm font-medium mb-2">
            <Lock className="w-4 h-4 inline mr-1" />
            Create Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`w-full px-4 py-3 pr-12 bg-white/10 border ${
                errors.password ? "border-red-500" : "border-white/20"
              } rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300`}
              placeholder="Enter your password"
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
          {errors.password && (
            <p className="mt-1 text-red-400 text-sm">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-text  text-sm font-medium mb-2">
            <Lock className="w-4 h-4 inline mr-1" />
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className={`w-full px-4 py-3 pr-12 bg-white/10 border ${
                errors.confirmPassword ? "border-red-500" : "border-white/20"
              } rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300`}
              placeholder="Confirm your password"
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
            <p className="mt-1 text-red-400 text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms & Privacy Checkbox */}
        <div className="flex items-start">
          <input
            type="checkbox"
            {...register("agreeToTerms")}
            className="w-4 h-4 rounded border-white/20 bg-white/10 text-theme3 focus:ring-theme3 mt-1"
          />
          <span className="ml-2 text-text text-sm">
            {t(lang, "agree_to_terms")}{" "}
            <button
              type="button"
              onClick={handleTermsClick}
              className="text-theme3 hover:text-theme underline font-medium"
            >
              {t(lang, "terms_and_conditions_link")}
            </button>{" "}
            {t(lang, "and_privacy_policy_link")}{" "}
            <button
              type="button"
              onClick={handlePrivacyClick}
              className="text-theme3 hover:text-theme underline font-medium"
            >
              {t(lang, "privacy_policy_link")}
            </button>
          </span>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-400 text-sm -mt-2">{errors.agreeToTerms.message}</p>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!agreeToTerms || isLoading}
          whileHover={agreeToTerms && !isLoading ? { scale: 1.02 } : {}}
          whileTap={agreeToTerms && !isLoading ? { scale: 0.98 } : {}}
          className="w-full bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white py-4 px-6 transition-all duration-300 text-base  font-semibold uppercase rounded-xl shadow-lg hover:shadow-xl hover:shadow-theme3/40 border border-theme3/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Sending...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Register
            </>
          )}
        </motion.button>
      </form>

      {/* Legal Modals */}
      <LegalModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        type="terms-conditions"
      />
      <LegalModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        type="privacy-policy"
      />
    </>
  );
}
