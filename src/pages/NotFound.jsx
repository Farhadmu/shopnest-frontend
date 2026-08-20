import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="max-w-md mx-auto px-4 py-24 text-center animate-fadeInUp">
    <div className="text-7xl mb-4">🧭</div>
    <h1 className="text-2xl font-bold gradient-text">404 — Page Not Found</h1>
    <p className="text-gray-500 mt-2">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/" className="btn-primary inline-block mt-6">Back to Home</Link>
  </div>
);

export default NotFound;
