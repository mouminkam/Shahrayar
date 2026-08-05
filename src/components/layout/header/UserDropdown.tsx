"use client";
import LocalizedLink from "../../ui/LocalizedLink";
import { useRef, type Dispatch, type SetStateAction } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { User, LogOut, Package } from "lucide-react";
import useAuthStore from "../../../store/authStore";
import useToastStore from "../../../store/toastStore";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { useLocalizedRouter } from "../../../hooks/useLocalizedRouter";

interface UserDropdownProps {
  userOpen: boolean;
  setUserOpen: Dispatch<SetStateAction<boolean>>;
}

export default function UserDropdown({
  userOpen,
  setUserOpen,
}: UserDropdownProps) {
  const { push } = useLocalizedRouter();
  const userTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { success: toastSuccess } = useToastStore();
  const { lang } = useLanguage();

  const handleMouseEnter = () => {
    if (userTimeoutRef.current) {
      clearTimeout(userTimeoutRef.current);
      userTimeoutRef.current = null;
    }
    setUserOpen(true);
  };

  const handleMouseLeave = () => {
    if (userTimeoutRef.current) {
      clearTimeout(userTimeoutRef.current);
    }
    userTimeoutRef.current = setTimeout(() => {
      setUserOpen(false);
      userTimeoutRef.current = null;
    }, 300);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserOpen(false);
      toastSuccess(t(lang, "logged_out_successfully"));
      push("/");
    } catch (error) {
      // Logout will still clear local state even if API call fails
      setUserOpen(false);
      push("/");
    }
  };

  // Animation variants
  const dropdownVariants: Variants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.15,
      },
    },
  };

  if (!isAuthenticated) {
    return (
      <AnimatePresence>
        {userOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full right-0 z-9999 w-64 bg-white shadow-2xl border border-gray-200 mt-4 p-4 rounded-lg"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              variants={itemVariants}
              className="text-center py-4 mb-4 border-b border-gray-200"
            >
              <p className="text-gray-600 text-sm mb-4">{t(lang, "welcome_sign_in")}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setUserOpen(false);
                    push("/login");
                  }}
                  className="w-full bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white py-3 px-4 transition-all duration-300 text-sm font-semibold block text-center rounded-lg shadow-lg"
                >
                  {t(lang, "sign_in")}
                </button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setUserOpen(false);
                    push("/register");
                  }}
                  className="w-full border-2 border-theme text-theme py-2 px-4 hover:bg-theme hover:text-white transition-all duration-300 text-sm font-medium block text-center rounded-lg"
                >
                  {t(lang, "create_account")}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {userOpen && (
        <motion.div
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute top-full right-0 z-9999 w-72 bg-white shadow-2xl border border-gray-200 mt-4 p-4 rounded-lg"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* User Info Header */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-200"
          >
            <div className="w-12 h-12 rounded-full bg-theme3 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </motion.div>

          {/* Menu Items */}
          <motion.div variants={itemVariants} className="space-y-1 mb-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <LocalizedLink
                href="/profile"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                onClick={() => setUserOpen(false)}
              >
                <User className="w-5 h-5 text-theme3" />
                <span className="text-sm font-medium">{t(lang, "my_profile")}</span>
              </LocalizedLink>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <LocalizedLink
                href="/profile"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                onClick={() => setUserOpen(false)}
              >
                <Package className="w-5 h-5 text-theme3" />
                <span className="text-sm font-medium">
                  {t(lang, "my_orders")}
                  {Array.isArray((user as { orders?: unknown[] } | null)?.orders) &&
                    ((user as { orders?: unknown[] }).orders?.length || 0) > 0 && (
                    <span className="ml-2 text-xs bg-theme3 text-white px-2 py-0.5 rounded-full">
                      {(user as { orders?: unknown[] }).orders?.length}
                    </span>
                  )}
                </span>
              </LocalizedLink>
            </motion.div>
          </motion.div>

          {/* Logout Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-red-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">{t(lang, "sign_out")}</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
