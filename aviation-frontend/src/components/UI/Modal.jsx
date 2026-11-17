import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md', actions }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative bg-white rounded-3xl shadow-2xl ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white rounded-t-3xl">
                    <h2 className="text-lg font-black text-slate-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                    {children}
                </div>

                {/* Footer with Actions */}
                {actions && (
                    <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50 rounded-b-3xl">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
