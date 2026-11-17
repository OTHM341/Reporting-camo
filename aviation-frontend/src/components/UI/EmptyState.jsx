import { SearchX, FolderOpen } from 'lucide-react';

const EmptyState = ({ title = 'No data found', subtitle = 'There are no items to display at the moment.', icon: Icon = FolderOpen, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                <Icon className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-1">{title}</h3>
            <p className="text-sm text-slate-400 max-w-xs">{subtitle}</p>
            {action && (
                <div className="mt-5">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
