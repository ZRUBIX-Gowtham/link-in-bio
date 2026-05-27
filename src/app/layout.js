import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "LinkNest | Your Entire Online Presence in One Beautiful Link",
  description: "Create your own smart bio page with social links, portfolio, payments, live analytics, and premium customization.",
  openGraph: {
    title: "LinkNest | Smart Bio Links",
    description: "Your entire online presence in one beautiful link.",
    url: "https://linknest.vercel.app",
    siteName: "LinkNest",
    images: [
      {
        url: "https://linknest.vercel.app/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkNest | Smart Bio Links",
    description: "Your entire online presence in one beautiful link.",
    images: ["https://linknest.vercel.app/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
