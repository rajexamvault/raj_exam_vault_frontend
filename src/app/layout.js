import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Raj Exam Vault - Your PYQ Vault for Rajasthan Exams",
  description:
    "Access Previous Year Question Papers, Study Material & Free PDFs for Rajasthan Government Exams. Smart Preparation Starts with Right Resources.",
  keywords:
    "Rajasthan exams, PYQ, previous year questions, RPSC, RSMSSB, Rajasthan police, study material",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
