import {
    Activity,
    Plane,
    Wrench,
    AlertTriangle,
    Clock,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useState } from 'react';

// Mock KPI Data - In production, this would come from an API
const INITIAL_KPIS = [
    { label: 'On-Time Performance', value: '94.2%', change: '+2.1%', trend: 'up', icon: Activity, color: 'text-ram-green' },
    { label: 'Aircraft Availability', value: '18/22', change: '-1', trend: 'down', icon: Plane, color: 'text-ram-green' },
    { label: 'Active Work Orders', value: '42', change: '+5', trend: 'up', icon: Wrench, color: 'text-ram-green' },
    { label: 'Critical Defects', value: '3', change: '0', trend: 'neutral', icon: AlertTriangle, color: 'text-ram-red' },
];

const ManagerDashboard = () => {
    const kpis = INITIAL_KPIS;

    // ─── HANDLERS ─────────────────────────────
    const handleExportReport = () => {
        alert('Exporting operational report...');
    };

    const handleGenerateDailySummary = () => {
        alert('Generating daily summary report...');
    };

    const handleDetailedFleetView = () => {
        alert('Opening detailed fleet view...');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manager Operations Center</h1>
                    <p className="text-gray-500">Real-time operational overview and performance KPIs</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportReport}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Export Report
                    </button>
                    <button
                        onClick={handleGenerateDailySummary}
                        className="px-4 py-2 bg-ram-red text-white rounded-lg text-sm font-medium hover:bg-ram-darkRed">
                        Generate Daily Summary
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg ${kpi.color === 'text-ram-red' ? 'bg-red-50' : 'bg-green-50'}`}>
                                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                                </div>
                                <div className={`flex items-center text-xs font-medium ${
                                    kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                    {kpi.change}
                                    {kpi.trend === 'up' && <ArrowUpRight className="w-3 h-3 ml-0.5" />}
                                    {kpi.trend === 'down' && <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">{kpi.label}</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area - Charts Placeholder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Flight Punctuality Trend</h2>
                            <select className="text-sm border-gray-200 rounded-lg">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <p className="text-gray-400">Punctuality Chart Integration Area</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Operational Alerts</h2>
                        <div className="space-y-4">
                            {[
                                { type: 'Maintenance', msg: 'CN-RGN: A-Check overdue by 12 hours', priority: 'High', time: '2h ago' },
                                { type: 'Flight', msg: 'RAM321: Departure delayed due to technical issue', priority: 'Medium', time: '3h ago' },
                                { type: 'Personnel', msg: 'Shift 3: Two technicians reported absent', priority: 'Medium', time: '5h ago' }
                            ].map((alert, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${alert.priority === 'High' ? 'bg-ram-red' : 'bg-orange-400'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{alert.msg}</p>
                                            <p className="text-xs text-gray-500">{alert.type} â€¢ {alert.time}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                        alert.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {alert.priority.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Content Area */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Fleet Status</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Active</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="bg-ram-green h-full" style={{ width: '82%' }} />
                                    </div>
                                    <span className="text-xs font-bold w-8 text-right">18</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">In Maintenance</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="bg-ram-red h-full" style={{ width: '14%' }} />
                                    </div>
                                    <span className="text-xs font-bold w-8 text-right">3</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">AOG</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="bg-orange-400 h-full" style={{ width: '4%' }} />
                                    </div>
                                    <span className="text-xs font-bold w-8 text-right">1</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={handleDetailedFleetView}
                            className="w-full mt-6 py-2 text-sm text-ram-green font-medium border border-ram-green rounded-lg hover:bg-green-50">
                            Detailed Fleet View
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Workforce Availability</h2>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Technicians On-Duty</span>
                            <span className="text-sm font-bold">14/18</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
                            <div className="bg-ram-green h-full" style={{ width: '77%' }} />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Next Shift Starts</p>
                                    <p className="text-[10px] text-gray-500">22:00 (Night Crew)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
