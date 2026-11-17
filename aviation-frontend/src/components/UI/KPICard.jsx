// src/components/UI/KPICard.jsx
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'green' }) => {
    const colorClasses = {
        green: 'bg-ram-green/10 text-ram-green',
        red: 'bg-ram-red/10 text-ram-red',
        blue: 'bg-blue-50 text-blue-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="kpi-card">
            <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                        trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div>
                <p className="kpi-value">{value}</p>
                <p className="kpi-label">{title}</p>
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
};

export default KPICard;