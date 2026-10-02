import AuthHero from "@/components/auth/AuthHero";
import AuthFooter from "@/components/auth/AuthFooter";

export const metadata = {
  title: "Raj Exam Vault - Login & Register",
  description:
    "Login or create your Raj Exam Vault account to access Previous Year Question Papers, Study Material & Free PDFs for Rajasthan Government Exams.",
};

export default function AuthLayout({ children }) {
  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden flex flex-col bg-[#070c1e] text-slate-900 select-none">
      {/* Main Container - Split Hero & Form Card */}
      <div className="flex-1 flex min-h-0 overflow-hidden px-4 py-3 sm:px-8 md:px-12 lg:px-16 xl:px-20 gap-8 items-center justify-between w-full">
        {/* Left Hero Section */}
        <div className="hidden lg:flex lg:w-[56%] xl:w-[58%] h-full min-h-0">
          <AuthHero />
        </div>

        {/* Right Form Card Section */}
        <div className="flex-1 w-full max-w-[480px] xl:max-w-[520px] h-full max-h-[660px] flex items-center justify-center mx-auto min-h-0">
          <div className="w-full h-full bg-white rounded-[28px] shadow-2xl p-6 sm:p-7 xl:p-8 flex flex-col justify-between border border-white/20">
            {children}
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <AuthFooter />
    </div>
  );
}
