import { Loader } from 'lucide-react';

const LoadingSpinner = ({ fullPage = false, message = 'Loading...', size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader className={`${sizeClasses[size]} animate-spin text-ram-red`} />
            {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {spinner}
        </div>
    );
};

export default LoadingSpinner;
