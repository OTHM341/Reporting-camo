const Header = ({ title, subtitle, actions }) => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8 animate-slide-up">
            <div>
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight font-heading uppercase">
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
    );
};

export default Header;