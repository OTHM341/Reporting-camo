import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDangerous = false,
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4">
                {/* Header with Icon */}
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDangerous ? 'bg-red-100' : 'bg-blue-100'}`}>
                            {isDangerous ? (
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-blue-600" />
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-auto p-1 hover:bg-slate-100 rounded-lg"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3 justify-end border-t border-slate-100 pt-4">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 ${isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                    >
                        {isLoading && <span className="w-4 h-4 border-2 border-white border-l-transparent rounded-full animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
