import EmailComposer from "../components/EmailComposer";
import ErrorBoundary from "../components/ErrorBoundary";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <ErrorBoundary>
          <div className="flex-1 flex flex-col">
            {/* Page Header */}
            <header className="text-center mb-4">
              <div className="flex justify-center gap-2 items-center">
                <div className="inline-flex items-center justify-center relative top-1 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  AI Email Composer
                </h1>
              </div>
              <p className="text-lg max-w-2xl mx-auto text-slate-600 leading-relaxed">
                Transform your ideas into professional emails with AI. Generate
                and edit content, then open directly in Gmail to add recipients
                and send.
              </p>
            </header>

            {/* Main Application */}
            <div className="flex-1">
              <EmailComposer />
            </div>

            {/* Footer */}
            <footer className="text-center mt-8  text-slate-500">
              <p className="text-sm">
                • Made
                by Surjendu
              </p>
            </footer>
          </div>
        </ErrorBoundary>
      </div>
    </main>
  );
}
