import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tumaro - Mobile Detailing Marketplace",
  description: "Book professional mobile detailing services. Connect with top-rated detailers near you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsPlacement: 'top',
          logoImageUrl: '/tumaro-logo.png',
          showOptionalFields: true,
        },
        variables: {
          colorPrimary: '#0ea5e9',
          colorBackground: '#0a1628',
          colorInputBackground: '#050e1d',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: '#7c8ea6',
          colorNeutral: '#ffffff',
          borderRadius: '0.75rem',
        },
        elements: {
          footer: 'hidden',
          card: 'bg-[#0a1628] border border-[#1a2d4a] shadow-2xl',
          headerTitle: 'text-white',
          headerSubtitle: 'text-[#7c8ea6]',
          socialButtonsBlockButton: 'bg-[#0f1d32] border-[#1a2d4a] text-white hover:bg-[#162640]',
          socialButtonsBlockButtonText: 'text-white',
          formFieldLabel: 'text-[#94a3b8]',
          formFieldInput: 'bg-[#050e1d] border-[#1a2d4a] text-white',
          formButtonPrimary: 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white',
          footerActionLink: 'text-[#0ea5e9] hover:text-[#38bdf8]',
          identityPreviewEditButtonIcon: 'text-[#0ea5e9]',
          formFieldAction: 'text-[#0ea5e9]',
          dividerLine: 'bg-[#1a2d4a]',
          dividerText: 'text-[#4a5e7a]',
          otpCodeFieldInput: 'bg-[#050e1d] border-[#1a2d4a] text-white',
          formHeaderTitle: 'text-white',
          formHeaderSubtitle: 'text-[#7c8ea6]',
          alertText: 'text-white',
          badge: 'bg-[#0ea5e9]/20 text-[#0ea5e9]',
          userButtonPopoverCard: 'bg-[#0a1628] border border-[#1a2d4a]',
          userButtonPopoverActionButton: 'text-white hover:bg-[#0f1d32]',
          userButtonPopoverActionButtonText: 'text-white',
          userButtonPopoverFooter: 'hidden',
        },
      }}
    >
      <html lang="en">
        <body className="antialiased">
          <AuthProvider>{children}</AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
