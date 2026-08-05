"use client";
import { Phone } from "lucide-react";

export default function PhoneInputHeader() {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-theme3 rounded-full flex items-center justify-center mx-auto mb-4">
        <Phone className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-white  text-2xl font-black uppercase mb-2">
        Enter Your Phone Number
      </h2>
      <p className="text-text text-sm">
        We need your phone number to send you a verification code
      </p>
    </div>
  );
}
