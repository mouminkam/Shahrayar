"use client";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import LocalizedLink from "../../components/ui/LocalizedLink";

export default function NotFound() {
  return (
    <div className="bg-bg3 min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-linear-to-br from-bgimg/50 via-bgimg/30 to-bgimg/50 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_50%)]" />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-9xl sm:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-theme via-theme3 to-theme mb-4"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              404
            </motion.h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-white  text-3xl sm:text-4xl lg:text-5xl font-black uppercase mb-4">
              Page Not Found
            </h2>
            <p className="text-text text-lg sm:text-xl mb-2">
              Oops! The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <p className="text-text/70 text-base">
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LocalizedLink
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white  text-base font-semibold uppercase rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-theme3/40 border border-theme3/30"
              >
                <Home className="w-5 h-5" />
                Go Home
              </LocalizedLink>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/20 hover:border-theme text-white  text-base font-medium rounded-xl hover:bg-theme/10 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LocalizedLink
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/20 hover:border-theme text-white  text-base font-medium rounded-xl hover:bg-theme/10 transition-all duration-300"
              >
                <Search className="w-5 h-5" />
                Browse Shop
              </LocalizedLink>
            </motion.div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 0.1, rotate: 0 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-theme3 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, rotate: 180 }}
            animate={{ opacity: 0.1, rotate: 0 }}
            transition={{ duration: 2, delay: 0.7 }}
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-theme rounded-full blur-3xl"
          />
        </div>
      </div>
    </div>
  );
}
