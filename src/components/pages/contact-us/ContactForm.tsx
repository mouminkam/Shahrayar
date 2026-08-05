"use client";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "../../../lib/validations/contactSchemas";
import useToastStore from "../../../store/toastStore";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import LegalModal from "../../ui/LegalModal";
import type { Branch } from "../../../lib/fetchDefaultBranch";
import type { Locale } from "../../../locales/i18n/config";

interface ContactFormProps {
  branchDetails?: Branch | null;
  lang?: Locale | null;
}

export default function ContactForm({ branchDetails = null, lang: serverLang = null }: ContactFormProps) {
  const { success: toastSuccess, error: toastError } = useToastStore();
  const { lang: clientLang } = useLanguage();
  // Use server lang for SSR to match server render, then use client lang after hydration
  const [lang, setLang] = useState<Locale | string>(serverLang || clientLang || "bg");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // After hydration, always use client language when it changes
    if (isHydrated && clientLang) {
      setLang(clientLang);
    }
  }, [clientLang, isHydrated]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "subject" as ContactFormData["subject"],
      message: "",
      agree: false,
    },
  });

  // Get branch email from branchDetails with fallback
  const branchEmail = useMemo(() => {
    return (branchDetails?.email as string) || "info@example.com";
  }, [branchDetails]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Format subject for email
      const subjectLabels: Record<string, string> = {
        complain: t(lang, "complain"),
        greetings: t(lang, "greetings"),
        date: t(lang, "expire_date"),
        price: t(lang, "about_price"),
        order: t(lang, "about_order"),
      };
      const emailSubject = subjectLabels[data.subject] || data.subject;

      // Create email body with all form data
      const emailBody = `${t(lang, "email_greeting")}

${t(lang, "email_contact_reason")} ${emailSubject}

${t(lang, "name_label")} ${data.fullName}
${t(lang, "email_label")} ${data.email}
${t(lang, "phone_label")} ${data.phone}
${t(lang, "subject_label")} ${emailSubject}

${t(lang, "message_label")}
${data.message}

---
${t(lang, "email_footer")}`;

      // Create mailto link
      const mailtoLink = `mailto:${branchEmail}?subject=${encodeURIComponent(`Contact Form: ${emailSubject}`)}&body=${encodeURIComponent(emailBody)}`;

      // Open email client
      window.location.href = mailtoLink;

      toastSuccess(t(lang, "opening_email_client"));

      // Reset form after a short delay
      setTimeout(() => {
        reset();
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Contact form error:", error);
      toastError(t(lang, "failed_open_email_client"));
      setIsSubmitting(false);
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
    <section className="contact-form-section py-12 sm:py-16 md:py-20 lg:py-24 pt-0 relative">
      <div className="contact-form-wrapper style2">
        <div className="container mx-auto ">
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-8 lg:gap-12 xl:gap-16">
            {/* Image Section */}
            <div className="w-full lg:w-1/2 xl:w-[55%] lg:-ml-[30px]">
              <div className="contact-form-thumb  relative border-r-2 border-y-2 border-theme3 rounded-r-full">
                <Image
                  src="/img/contact/contactThumb2_1.png"
                  alt="Contact form illustration"
                  width={600}
                  height={600}
                  className="w-full h-full object-contain object-left rounded-lg"
                  quality={85}
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 600px"
                />
              </div>
            </div>

            {/* Form Section */}
            <div className="w-full lg:w-1/2 xl:w-[45%] flex border-2">
              <div className="contact-form style2 bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-lg w-full">
                <h2 className="text-title  text-2xl sm:text-3xl lg:text-4xl font-black mb-6 capitalize">
                  {t(lang, "get_in_touch")}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Full Name - col-md-6 */}
                    <div className="col-md-6">
                      <input
                        type="text"
                        {...register("fullName")}
                        placeholder={t(lang, "full_name")}
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg border ${
                          errors.fullName ? "border-red-500" : "border-gray-200"
                        } text-text  text-sm sm:text-base focus:outline-none focus:border-theme3 transition-colors duration-300`}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-red-500 text-xs">{errors.fullName.message}</p>
                      )}
                    </div>

                    {/* Email - col-md-6 */}
                    <div className="col-md-6">
                      <input
                        type="email"
                        {...register("email")}
                        placeholder={t(lang, "email_address")}
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg border ${
                          errors.email ? "border-red-500" : "border-gray-200"
                        } text-text  text-sm sm:text-base focus:outline-none focus:border-theme3 transition-colors duration-300`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-red-500 text-xs">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Phone - col-md-6 */}
                    <div className="col-md-6">
                      <input
                        type="tel"
                        {...register("phone")}
                        placeholder={t(lang, "phone_number")}
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg border ${
                          errors.phone ? "border-red-500" : "border-gray-200"
                        } text-text  text-sm sm:text-base focus:outline-none focus:border-theme3 transition-colors duration-300`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-red-500 text-xs">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Subject - col-md-6 */}
                    <div className="col-md-6">
                      <select
                        {...register("subject")}
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg border ${
                          errors.subject ? "border-red-500" : "border-gray-200"
                        } text-text  text-sm sm:text-base bg-white focus:outline-none focus:border-theme3 transition-colors duration-300 cursor-pointer`}
                      >
                        <option value="subject">{t(lang, "subject")}</option>
                        <option value="complain">{t(lang, "complain")}</option>
                        <option value="greetings">{t(lang, "greetings")}</option>
                        <option value="date">{t(lang, "expire_date")}</option>
                        <option value="price">{t(lang, "about_price")}</option>
                        <option value="order">{t(lang, "about_order")}</option>
                      </select>
                      {errors.subject && (
                        <p className="mt-1 text-red-500 text-xs">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Message - col-12 */}
                  <div className="col-12">
                    <textarea
                      id="message"
                      {...register("message")}
                      placeholder={t(lang, "write_your_message_here")}
                      rows={5}
                      className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg border ${
                        errors.message ? "border-red-500" : "border-gray-200"
                      } text-text  text-sm sm:text-base resize-y focus:outline-none focus:border-theme3 transition-colors duration-300`}
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1 text-red-500 text-xs">{errors.message.message}</p>
                    )}
                  </div>

                  {/* Checkbox - col-12 form-group */}
                  <div className="col-12 form-group flex items-start gap-3">
                    <input
                      id="reviewcheck"
                      type="checkbox"
                      {...register("agree")}
                      className="mt-1.5 w-5 h-5 rounded border-gray-300 text-theme3 focus:ring-theme3 cursor-pointer"
                    />
                    <label
                      htmlFor="reviewcheck"
                      className="text-text  text-sm sm:text-base leading-relaxed cursor-pointer"
                    >
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
                      <span className="checkmark"></span>
                    </label>
                  </div>
                  {errors.agree && (
                    <p className="text-red-500 text-xs -mt-2">{errors.agree.message}</p>
                  )}

                  {/* Submit Button - col-12 form-group mb-0 */}
                  <div className="col-12 form-group mb-0">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="theme-btn w-full bg-theme3 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-sm  text-sm sm:text-base font-medium hover:bg-theme transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t(lang, "sending")}
                        </>
                      ) : (
                        <>
                          {t(lang, "submit_now")}
                          <ArrowRight className="w-4 h-4 bg-transparent text-white" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </section>
  );
}
