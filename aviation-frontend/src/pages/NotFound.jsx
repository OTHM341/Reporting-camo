import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Plane } from 'lucide-react';

function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden text-center">
                {/* Header */}
                <div className="bg-white p-8 border-b border-gray-100">
                    <div className="w-20 h-20 bg-ram-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Plane className="w-10 h-10 text-ram-green" />
                    </div>
                    <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
                    <p className="text-gray-600">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">What happened?</h3>
                        <p className="text-gray-600 text-sm">
                            This could be due to a broken link, a mistyped URL, or the page may have been removed.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/"
                            className="flex-1 bg-ram-green hover:bg-ram-darkGreen text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Go to Dashboard
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
                    <p className="text-gray-600 text-sm">
                        Need help? Contact our{' '}
                        <Link to="/support" className="text-ram-green hover:text-ram-darkGreen font-medium">
                            support team
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
