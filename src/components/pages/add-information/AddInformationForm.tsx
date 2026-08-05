"use client";
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { User, Mail, MapPin, ArrowRight } from "lucide-react";
import useAuthStore from "../../../store/authStore";
import useBranchStore from "../../../store/branchStore";
import useToastStore from "../../../store/toastStore";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

interface AddInformationFormData {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  branch_id: string;
}

interface AddInformationFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  branch_id?: string;
}

interface Branch {
  id: string | number;
  name?: string;
  title?: string;
}

export default function AddInformationForm() {
  const { push } = useLocalizedRouter();
  const { completeRegistration, isLoading } = useAuthStore();
  const { branches, fetchBranches, isLoading: isLoadingBranches } = useBranchStore();
  const { success: toastSuccess, error: toastError } = useToastStore();

  const [formData, setFormData] = useState<AddInformationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    branch_id: "",
  });
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [errors, setErrors] = useState<AddInformationFormErrors>({});

  // Load branches and check for registration token
  useEffect(() => {
    const loadBranches = async () => {
      if (typeof window === "undefined") return;

      // Check for registration token
      const registrationToken = sessionStorage.getItem("registrationToken");
      if (!registrationToken) {
        toastError("Registration session expired. Please start again.");
        push("/register");
        return;
      }

      // Load branches using branchStore
      setLoadingBranches(true);
      const result = await fetchBranches();
      if (result.success) {
        // branches will be updated automatically in branchStore
        setLoadingBranches(false);
      } else {
        toastError(result.error || "Failed to load branches");
        setLoadingBranches(false);
      }
    };

    loadBranches();
  }, [push, fetchBranches, toastError]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof AddInformationFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: AddInformationFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.branch_id) {
      newErrors.branch_id = "Please select a branch";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Get registration token from sessionStorage
    const registrationToken = sessionStorage.getItem("registrationToken");
    if (!registrationToken) {
      toastError("Registration session expired. Please start again.");
        push("/register");
      return;
    }

      // Combine first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const result = await completeRegistration({
        name: fullName,
        email: formData.email,
      branch_id: formData.branch_id,
      });

      if (result.success) {
      // Cleanup sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("registrationToken");
          sessionStorage.removeItem("registrationPhone");
          sessionStorage.removeItem("registrationPassword");
        }

      toastSuccess("Registration completed successfully! Welcome!");
          push("/");
    } else {
      // Handle errors
      if (result.errors) {
        setErrors(result.errors);
      } else {
        toastError(result.error || "Failed to complete registration. Please try again.");
      }
    }
  };

  const handleLocationClick = () => {
    // Location picker logic will be added later
    console.log("Location picker will be implemented soon");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* First Name */}
      <div>
        <label className="block text-text  text-sm font-medium mb-2">
          <User className="w-4 h-4 inline mr-1" />
          First name
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-white/10 border ${
            errors.firstName ? "border-red-500" : "border-white/20"
          } rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300`}
          placeholder="Enter your first name"
        />
        {errors.firstName && (
          <p className="mt-1 text-red-400 text-sm">{errors.firstName}</p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label className="block text-text  text-sm font-medium mb-2">
          <User className="w-4 h-4 inline mr-1" />
          Last name
        </label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-white/10 border ${
            errors.lastName ? "border-red-500" : "border-white/20"
          } rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300`}
          placeholder="Enter your last name"
        />
        {errors.lastName && (
          <p className="mt-1 text-red-400 text-sm">{errors.lastName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-text  text-sm font-medium mb-2">
          <Mail className="w-4 h-4 inline mr-1" />
          E-mail address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-white/10 border ${
            errors.email ? "border-red-500" : "border-white/20"
          } rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300`}
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-red-400 text-sm">{errors.email}</p>
        )}
      </div>

      {/* Branch Selection */}
      <div>
        <label className="block text-text  text-sm font-medium mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Branch <span className="text-red-400">*</span>
        </label>
          <select
            name="branch_id"
            value={formData.branch_id}
            onChange={handleInputChange}
          disabled={loadingBranches}
            className={`w-full px-4 py-3 bg-white/10 border ${
              errors.branch_id ? "border-red-500" : "border-white/20"
          } rounded-xl text-white focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{
              color: formData.branch_id ? '#fff' : 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <option value="" disabled className="bg-bg3 text-white/50">
            {loadingBranches ? "Loading branches..." : "Select a branch"}
          </option>
          {((branches || []) as Branch[]).map((branch) => (
            <option key={branch.id} value={branch.id} className="bg-bg3 text-white">
              {branch.name || branch.title || `Branch ${branch.id}`}
            </option>
          ))}
          </select>
        {errors.branch_id && (
          <p className="mt-1 text-red-400 text-sm">{errors.branch_id}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-text  text-sm font-medium mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Location
        </label>
        <div className="relative">
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300"
            placeholder="Enter your location (optional)"
          />
          <button
            type="button"
            onClick={handleLocationClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text hover:text-theme3 transition-colors"
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading || loadingBranches || isLoadingBranches}
        whileHover={!isLoading && !loadingBranches ? { scale: 1.02 } : {}}
        whileTap={!isLoading && !loadingBranches ? { scale: 0.98 } : {}}
        className="w-full bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white py-4 px-6 transition-all duration-300 text-base  font-semibold uppercase rounded-xl shadow-lg hover:shadow-xl hover:shadow-theme3/40 border border-theme3/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Completing...
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
