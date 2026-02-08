"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "customer";
  const isBusiness = role === "business";

  const [businessName, setBusinessName] = useState("");

  // Set role cookie on mount / when role changes
  useEffect(() => {
    document.cookie = `tumaro_signup_role=${role}; path=/; max-age=3600; SameSite=Lax`;
  }, [role]);

  // Store business name in cookie as user types
  useEffect(() => {
    if (isBusiness && businessName) {
      document.cookie = `tumaro_business_name=${encodeURIComponent(businessName)}; path=/; max-age=3600; SameSite=Lax`;
    }
  }, [businessName, isBusiness]);

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/tumaro-logo.png"
            alt="Tumaro"
            className="h-10 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">
            {isBusiness ? "Register your business" : "Create your account"}
          </h1>
          <p className="text-brand-400 mt-1">
            {isBusiness
              ? "Join Tumaro as a detailing professional"
              : "Join Tumaro to book mobile detailing"}
          </p>
        </div>

        {isBusiness && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-brand-300 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Premium Auto Spa"
              className="w-full px-4 py-3 bg-brand-950 border border-brand-700 rounded-xl text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT focus:border-transparent"
            />
            {!businessName && (
              <p className="text-xs text-brand-500 mt-1">
                Required — you can change this later
              </p>
            )}
          </div>
        )}

        <div className={isBusiness && !businessName ? "opacity-50 pointer-events-none" : ""}>
          <SignUp
            forceRedirectUrl={isBusiness ? "/detailer/home" : "/customer/home"}
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-brand-900 border border-brand-800 shadow-2xl",
                headerTitle: "text-white",
                headerSubtitle: "text-brand-400",
                socialButtonsBlockButton:
                  "bg-brand-800 border-brand-700 text-white hover:bg-brand-700",
                socialButtonsBlockButtonText: "text-white",
                formFieldLabel: "text-brand-300",
                formFieldInput: "bg-brand-950 border-brand-700 text-white",
                formButtonPrimary: "bg-accent-DEFAULT hover:bg-accent-hover",
                footerActionLink: "text-accent-DEFAULT hover:text-accent-hover",
                identityPreview: "bg-brand-800 border-brand-700",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-accent-DEFAULT",
                formFieldAction: "text-accent-DEFAULT",
                dividerLine: "bg-brand-700",
                dividerText: "text-brand-500",
                footer: "hidden",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
