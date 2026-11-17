// src/pages/ManagerDefects.jsx
import { useState } from 'react';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    FileWarning
} from 'lucide-react';

// Mock Data
const MOCK_DEFECTS = [
    { id: 'DF-001', aircraft: 'CN-RGN', description: 'Left engine oil pressure low alert', severity: 'Critical', status: 'Open', reportedDate: '2023-10-25 14:30', reportedBy: 'Ahmed Khan', flight: 'RAM101' },
    { id: 'DF-002', aircraft: 'CN-ROB', description: 'Cabin light row 12 flickering', severity: 'Minor', status: 'Resolved', reportedDate: '2023-10-24 09:15', reportedBy: 'Fatima Zahra', flight: 'RAM202' },
    { id: 'DF-003', aircraft: 'CN-RGO', description: 'Weather radar signal degradation', severity: 'Major', status: 'In Progress', reportedDate: '2023-10-26 08:00', reportedBy: 'Youssef El Amrani', flight: 'RAM303' },
    { id: 'DF-004', aircraft: 'CN-RGP', description: 'Passenger seat 4B adjustment faulty', severity: 'Minor', status: 'Open', reportedDate: '2023-10-26 10:45', reportedBy: 'Omar Cherkaoui', flight: 'RAM404' },
];

const ManagerDefects = () => {
    const defects = MOCK_DEFECTS;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const filteredDefects = defects.filter(defect => {
        const matchesSearch = defect.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              defect.aircraft.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              defect.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = filterSeverity === 'All' || defect.severity === filterSeverity;
        const matchesStatus = filterStatus === 'All' || defect.status === filterStatus;
        return matchesSearch && matchesSeverity && matchesStatus;
    });

    const kpis = [
        { label: 'Total Open Defects', value: defects.filter(d => d.status === 'Open' || d.status === 'In Progress').length, icon: FileWarning, color: 'text-orange-600' },
        { label: 'Critical Issues', value: defects.filter(d => d.severity === 'Critical' && d.status !== 'Resolved').length, icon: AlertTriangle, color: 'text-ram-red' },
        { label: 'Avg. Resolution Time', value: '14.2 hrs', change: '-15%', trend: 'up', icon: Clock, color: 'text-ram-green' },
        { label: 'Resolved (Last 7d)', value: 28, change: '+5', trend: 'up', icon: CheckCircle, color: 'text-ram-green' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Defect & Reliability Monitoring</h1>
                    <p className="text-gray-500">Analyze operational defects, track resolution progress, and monitor fleet reliability</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Export Log
                    </button>
                    <button className="px-4 py-2 bg-ram-red text-white rounded-lg text-sm font-medium hover:bg-ram-darkRed">
                        <AlertTriangle className="w-4 h-4 inline-block mr-2" />
                        Analyze Critical Backlog
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
                                <div className={`p-2 rounded-lg ${kpi.color === 'text-ram-red' ? 'bg-red-50' : kpi.color === 'text-ram-green' ? 'bg-green-50' : kpi.color === 'text-blue-600' ? 'bg-blue-50' : 'bg-orange-50'}`}>
                                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                                </div>
                                {kpi.change && (
                                    <div className={`flex items-center text-xs font-medium ${
                                        kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                        {kpi.change}
                                        {kpi.trend === 'up' && <ArrowUpRight className="w-3 h-3 ml-0.5" />}
                                        {kpi.trend === 'down' && <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                                    </div>
                                )}
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
                            <h2 className="text-lg font-bold text-gray-900">Defect Severity Distribution</h2>
                            <select className="text-sm border-gray-200 rounded-lg">
                                <option>Current Backlog</option>
                                <option>Historical</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <p className="text-gray-400">Bar Chart: Open defects grouped by severity (Critical, Major, Minor)</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[400px]">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Resolution Trend (Burn-down)</h2>
                        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <p className="text-gray-400">Line Chart: Number of open defects over time</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Content Area */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Defect Filters</h2>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                <select
                                    id="severity"
                                    className="w-full border-gray-200 rounded-lg text-sm focus:ring-ram-red focus:border-ram-red"
                                    value={filterSeverity}
                                    onChange={(e) => setFilterSeverity(e.target.value)}
                                >
                                    <option>All</option>
                                    <option>Critical</option>
                                    <option>Major</option>
                                    <option>Minor</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    id="status"
                                    className="w-full border-gray-200 rounded-lg text-sm focus:ring-ram-red focus:border-ram-red"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option>All</option>
                                    <option>Open</option>
                                    <option>In Progress</option>
                                    <option>Resolved</option>
                                    <option>Deferred</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Critical Reports</h2>
                        <div className="space-y-3">
                            {defects.filter(d => d.severity === 'Critical').slice(0, 2).map((defect, idx) => (
                                <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-bold text-gray-900">{defect.aircraft}</p>
                                        <span className="text-[10px] font-bold text-ram-red uppercase">Critical</span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">{defect.description}</p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Flight: {defect.flight} â€¢ {defect.reportedDate.split(' ')[1]}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Defect List Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Operational Defect Log</h3>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Aircraft, Description, Flight..." 
                            className="pl-9 pr-4 py-1.5 text-sm border-gray-200 rounded-lg focus:ring-ram-green focus:border-ram-green"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Defect ID</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Aircraft</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Severity</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Reported At</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Flight</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredDefects.map((defect) => (
                            <tr key={defect.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{defect.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-bold text-ram-green">{defect.aircraft}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        defect.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                        defect.severity === 'Major' ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {defect.severity.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{defect.description}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                        defect.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                        defect.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                        {defect.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">{defect.reportedDate}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{defect.flight}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredDefects.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No defects found matching your criteria.</div>
                )}
            </div>
        </div>
    );
};

export default ManagerDefects;
