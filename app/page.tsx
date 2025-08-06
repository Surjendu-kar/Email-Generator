import EmailComposer from "../components/EmailComposer";
import ErrorBoundary from "../components/ErrorBoundary";

function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <ErrorBoundary>
        <EmailComposer />
      </ErrorBoundary>
    </div>
  );
}

export default Home;
