"use client";
import type { Dispatch, KeyboardEvent, MutableRefObject, SetStateAction } from "react";

interface OTPInputProps {
  otp: string[];
  setOtp: Dispatch<SetStateAction<string[]>>;
  inputRefs: MutableRefObject<(HTMLInputElement | null)[]>;
}

export default function OTPInput({ otp, setOtp, inputRefs }: OTPInputProps) {
  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 4).split("");
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 4) {
            newOtp[i] = digit;
          }
        });
        setOtp(newOtp);
        const nextIndex = Math.min(digits.length, 3);
        inputRefs.current[nextIndex]?.focus();
      });
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300"
        />
      ))}
    </div>
  );
}
