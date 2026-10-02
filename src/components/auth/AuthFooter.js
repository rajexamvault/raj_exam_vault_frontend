"use client";

export default function AuthFooter() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 shrink-0 z-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        {/* Left - Support Info */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
                />
              </svg>
            </div>
            <span className="text-slate-900 font-bold text-xs">Need Help?</span>
          </div>
          <a
            href="mailto:support@rajexamvault.in"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            support@rajexamvault.in
          </a>
          <a
            href="tel:+911234567890"
            className="text-slate-800 font-medium hover:text-blue-600 transition-colors"
          >
            +91 12345 67890
          </a>
        </div>

        {/* Right - Legal */}
        <div className="flex items-center gap-1 text-slate-500 flex-wrap justify-center text-[11px] sm:text-xs">
          <span>By continuing, you agree to our</span>
          <a href="#" className="text-blue-600 hover:underline font-medium">
            Terms & Conditions
          </a>
          <span>and</span>
          <a href="#" className="text-blue-600 hover:underline font-medium">
            Privacy Policy.
          </a>
        </div>
      </div>
    </footer>
  );
}
