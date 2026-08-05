"use client";
import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Upload, X, Camera } from "lucide-react";
import useAuthStore from "../../../store/authStore";
import useToastStore from "../../../store/toastStore";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import OptimizedImage from "../../ui/OptimizedImage";
import { getFullImageUrl } from "../../../lib/utils/imageUtils";

interface ProfileEditFormData {
  name: string;
  email: string;
  phone: string;
}

interface ProfileEditFormErrors {
  name?: string;
}

interface ProfileEditFormProps {
  onClose?: () => void;
}

export default function ProfileEditForm({ onClose }: ProfileEditFormProps) {
  const { user, updateProfile, uploadProfileImage, isLoading } = useAuthStore();
  const { success: toastSuccess, error: toastError } = useToastStore();
  const { lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileEditFormData>({
    name: "",
    email: "",
    phone: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<ProfileEditFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      // Set image preview if user has an image
      const imagePath = (user.image || user.image_url || user.avatar) as string | undefined;
      if (imagePath) {
        // Convert relative path to full URL for Next.js Image component
        setImagePreview(getFullImageUrl(imagePath));
      }
    }
  }, [user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof ProfileEditFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toastError(t(lang, "invalid_image_format"));
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toastError(t(lang, "image_too_large"));
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    const imagePath = (user?.image || user?.image_url || user?.avatar) as string | undefined;
    setImagePreview(imagePath ? getFullImageUrl(imagePath) : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors: ProfileEditFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t(lang, "name_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Update name if changed
      if (formData.name !== user.name) {
        const updateResult = await updateProfile({ name: formData.name });

        if (!updateResult.success) {
          toastError(updateResult.error || t(lang, "failed_to_place_order"));
          setIsSubmitting(false);
          return;
        }
      }

      // Upload image if selected
      if (selectedImage) {
        const uploadResult = await uploadProfileImage(selectedImage);

        if (!uploadResult.success) {
          toastError(uploadResult.error || t(lang, "failed_to_upload_image"));
          setIsSubmitting(false);
          return;
        }

        toastSuccess(t(lang, "image_uploaded_successfully"));
        setSelectedImage(null);
      }

      // Show success message
      if (formData.name !== user.name || selectedImage) {
        toastSuccess(t(lang, "profile_updated_successfully"));
        // Close modal after successful update
        if (onClose) {
          setTimeout(() => {
            onClose();
          }, 500);
        }
      }
    } catch (error) {
      const err = error as { message?: string };
      console.error("Error updating profile:", error);
      toastError(err.message || t(lang, "failed_to_place_order"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div
              onClick={handleImageClick}
              className="w-32 h-32 rounded-full bg-theme3 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shadow-xl relative overflow-hidden group"
            >
              {imagePreview ? (
                <OptimizedImage
                  src={imagePreview}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="w-16 h-16 text-white" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            {imagePreview && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveImage();
                }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleImageClick}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm font-medium transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {imagePreview ? t(lang, "change_image") : t(lang, "upload_profile_image")}
          </button>
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-text text-sm font-medium mb-2">
            <User className="w-4 h-4 inline mr-1" />
            {t(lang, "name_label")}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-white/10 border ${
              errors.name ? "border-red-500" : "border-white/20"
            } rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300`}
            placeholder={t(lang, "your_name")}
          />
          {errors.name && (
            <p className="mt-1 text-red-400 text-sm">{errors.name}</p>
          )}
        </div>

        {/* Email Field (Readonly) */}
        <div>
          <label className="block text-text text-sm font-medium mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            {t(lang, "email_label")}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text/70 cursor-not-allowed"
            readOnly
          />
          <p className="mt-1 text-text/50 text-xs">
            {t(lang, "email_label")} {t(lang, "cannot_be_changed") || "cannot be changed"}
          </p>
        </div>

        {/* Phone Field (Readonly) */}
        {formData.phone && (
          <div>
            <label className="block text-text text-sm font-medium mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              {t(lang, "phone_label")}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text/70 cursor-not-allowed"
              readOnly
            />
            <p className="mt-1 text-text/50 text-xs">
              {t(lang, "phone_label")} {t(lang, "cannot_be_changed") || "cannot be changed"}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || isLoading}
          whileHover={{ scale: isSubmitting || isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting || isLoading ? 1 : 0.98 }}
          className="w-full bg-theme3 text-white py-3 px-6 rounded-xl font-semibold hover:bg-theme3/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting || isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {t(lang, "updating_profile")}
            </>
          ) : (
            t(lang, "update_profile")
          )}
        </motion.button>
      </form>
  );
}
