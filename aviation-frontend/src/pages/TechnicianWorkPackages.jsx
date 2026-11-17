// src/pages/TechnicianWorkPackages.jsx
import { useState, useEffect } from 'react';
import {
    Package,
    FileText,
    Plane,
    ChevronRight,
    ClipboardCheck,
    Loader2
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { workPackageAPI, workOrderAPI, logApiError } from '../services/api';
import { filterWorkPackagesByUser } from '../utils/roleUtils';
import Logo from '../components/UI/Logo';

const TechnicianWorkPackages = () => {
    const { user } = useAuth();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkPackages();
    }, []);

    const fetchWorkPackages = async () => {
        try {
            setLoading(true);
            const [packagesRes, workOrdersRes] = await Promise.all([
                workPackageAPI.getAll(),
                workOrderAPI.getAll()
            ]);
            
            const allPackages = packagesRes.data || [];
            const allWorkOrders = workOrdersRes.data || [];
            
            // Enrich packages with work orders
            const enrichedPackages = allPackages.map(pkg => ({
                ...pkg,
                workOrders: allWorkOrders.filter(wo => 
                    wo.workPackageId === pkg.id || 
                    pkg.workOrders?.some(pwo => pwo.id === wo.id)
                )
            }));
            
            const myPackages = filterWorkPackagesByUser(enrichedPackages, user);
            setPackages(myPackages);
        } catch (err) {
            logApiError('Technician Work Packages Load', err);
        } finally {
            setLoading(false);
        }
    };

    // ─── HANDLERS ─────────────────────────────
    const handleViewDocuments = (packageId) => {
        alert(`Opening documents for ${packageId}`);
    };

    const handleOpenDeck = (packageId) => {
        alert(`Opening work deck for ${packageId}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'IN_PROGRESS': return 'bg-green-100 text-green-700';
            case 'COMPLETED': return 'bg-gray-100 text-gray-700';
            case 'CLOSED': return 'bg-gray-100 text-gray-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const calculateProgress = (workPackage) => {
        if (!workPackage.workOrders || workPackage.workOrders.length === 0) return 0;
        const completed = workPackage.workOrders.filter(wo => wo.status === 'COMPLETED').length;
        return Math.round((completed / workPackage.workOrders.length) * 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-ram-red mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Loading Work Packages...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
                <div className="flex items-center gap-6">
                    <div className="transition-transform hover:scale-105">
                        <Logo className="h-12" />
                    </div>
                    <div className="h-10 w-px bg-slate-200 hidden md:block" />
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-2 py-0.5 bg-ram-red text-white text-[8px] font-black uppercase tracking-widest rounded border border-ram-red flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                Technician View
                            </span>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Work Package Management</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                            My Assigned <span className="text-ram-red italic">Packages</span>
                        </h1>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(pkg.status)}`}>
                                    {pkg.status.replace('_', ' ')}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{pkg.packageNumber || `WP-${pkg.id}`}</h3>
                            <div className="flex items-center gap-2 text-ram-green font-bold text-sm mb-4">
                                <Plane className="w-4 h-4" />
                                {pkg.aircraft} â€¢ {pkg.type}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <span className="text-gray-500">Overall Progress</span>
                                        <span className="text-slate-900">{calculateProgress(pkg)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-ram-green h-full transition-all duration-500" 
                                            style={{ width: `${calculateProgress(pkg)}%` }} 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Tasks</p>
                                        <p className="text-sm font-bold text-slate-900">{pkg.workOrders?.filter(wo => wo.status === 'COMPLETED').length || 0} / {pkg.workOrders?.length || 0}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Due Date</p>
                                        <p className="text-sm font-bold text-slate-900">{pkg.endDate ? new Date(pkg.endDate).toLocaleDateString() : 'TBD'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                            <button 
                                onClick={() => handleViewDocuments(pkg.id)}
                                className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
                                <FileText className="w-3.5 h-3.5" /> Documents
                            </button>
                            <button 
                                onClick={() => handleOpenDeck(pkg.id)}
                                className="flex-1 py-2 bg-ram-red text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-ram-darkRed transition-all shadow-sm">
                                Open Deck <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}

                {packages.length === 0 && (
                    <div className="col-span-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className="text-slate-900 font-black mb-1">No Work Packages Assigned</h4>
                        <p className="text-sm text-slate-500 px-4">Work packages assigned to you will appear here once released by the Planning Manager.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicianWorkPackages;
