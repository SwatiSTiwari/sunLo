import type { Metadata } from "next";
import { Poppins, Noto_Sans_Devanagari } from "next/font/google";
import { AuthProvider } from "@/lib/authContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const noto = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SunLo - Someone is listening, always",
  description:
    "SunLo is a safe space to talk with verified companions. Someone is listening, always.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${noto.variable} font-sans antialiased bg-sunlo-background text-sunlo-text`}
      >
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: "16px",
                background: "#FFF7ED",
                color: "#1C1917",
                border: "1px solid #FDE68A",
                boxShadow: "0 8px 30px rgba(61, 37, 23, 0.08)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
