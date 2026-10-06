import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import EmailVerificationModal from "@/components/auth/EmailVerificationModal";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined') {
                    if (!window.ethereum) {
                      window.ethereum = { isMetaMask: false, selectedAddress: undefined };
                    }
                    window.addEventListener('error', function(event) {
                      if (event && event.message && (event.message.includes('ethereum') || event.message.includes('selectedAddress'))) {
                        event.stopImmediatePropagation();
                        event.preventDefault();
                      }
                    }, true);
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        <AuthProvider>
          {children}
          <EmailVerificationModal />
        </AuthProvider>
      </body>
    </html>
  );
}
