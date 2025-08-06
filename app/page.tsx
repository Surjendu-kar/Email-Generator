import EmailComposer from "../components/EmailComposer";
import ErrorBoundary from "../components/ErrorBoundary";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-8">
      <ErrorBoundary>
        <EmailComposer />
      </ErrorBoundary>
    </div>
  );
}

export default Home;
