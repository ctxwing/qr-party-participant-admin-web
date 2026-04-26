import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "QR Party | 실시간 파티 상호작용",
  description: "QR 코드로 접속하여 파티원들과 실시간으로 소통하고 호감도를 나누세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" expand={true} richColors />
      </body>
    </html>
  );
}
