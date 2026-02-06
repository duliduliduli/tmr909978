import type { Metadata } from "next";
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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
