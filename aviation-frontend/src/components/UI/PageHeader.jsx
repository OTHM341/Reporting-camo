import { ChevronRight } from 'lucide-react';

const PageHeader = ({ title, subtitle, breadcrumbs = [], actions }) => {
    return (
        <div className="mb-8 animate-slide-up">
            {breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 mb-3 text-xs font-bold text-slate-400">
                    {breadcrumbs.map((crumb, i) => (
                        <span key={i} className="flex items-center gap-1.5">
                            {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
                            <span className={i === breadcrumbs.length - 1 ? 'text-slate-900' : 'hover:text-slate-600 transition-colors cursor-pointer'}>
                                {crumb}
                            </span>
                        </span>
                    ))}
                </nav>
            )}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight font-heading">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-slate-500 text-sm font-medium mt-1 max-w-xl">
                            {subtitle}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-3 shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
