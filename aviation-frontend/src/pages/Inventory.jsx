import { Package, Search, Filter, Box, ArrowDownLeft, Tag } from 'lucide-react';

const Inventory = () => {
    const parts = [
        { pn: '066-50007-0402', sn: '88219-X', desc: 'VOR/ILS Receiver', category: 'Avionics', location: 'CMN-H1', condition: 'Serviceable', qty: 3 },
        { pn: '4951000-45', sn: 'WA-0092', desc: 'Main Landing Gear Wheel', category: 'Undercarriage', location: 'RAK-W2', condition: 'Unserviceable', qty: 1 },
        { pn: '980-6005-076', sn: '3441', desc: 'Flight Data Recorder (FDR)', category: 'Safety', location: 'CMN-H1', condition: 'New', qty: 2 },
        { pn: '10-60601-12', sn: 'N/A', desc: 'Seal - Door Access', category: 'Consumable', location: 'CMN-S4', condition: 'Serviceable', qty: 45 },
    ];

    return (
        <div className="p-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Inventory & Logistics</h1>
                    <p className="text-slate-500 text-sm font-medium">Tracking rotables, consumables, and high-value technical assets.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-ram-red transition-all shadow-lg">
                        <Package className="w-4 h-4" /> ADD STOCK
                    </button>
                </div>
            </div>

            {/* Search and Quick Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-6 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by Part Number (PN), Serial (SN), or Description..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-ram-red/20" 
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold text-xs hover:bg-slate-50 rounded-xl">
                    <Filter className="w-4 h-4" /> Category
                </button>
            </div>

            {/* Parts Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Part Identification</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category / Location</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Level</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {parts.map((part) => (
                            <tr key={part.pn + part.sn} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="text-xs font-black text-slate-900">{part.pn}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-slate-400 font-mono">SN: {part.sn}</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className="text-[10px] text-slate-500 font-bold">{part.desc}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                                        <Tag className="w-3 h-3 text-slate-400" /> {part.category}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-ram-red font-black uppercase mt-0.5">
                                        <Box className="w-3 h-3" /> {part.location}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-black text-slate-900">{part.qty} Units</div>
                                    <div className="w-16 h-1 bg-slate-100 rounded-full mt-1.5">
                                        <div className="h-full bg-ram-red w-2/3" />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                        part.condition === 'Serviceable' ? 'bg-emerald-50 text-emerald-600' : 
                                        part.condition === 'New' ? 'bg-blue-50 text-blue-600' : 'bg-ram-red/10 text-ram-red'
                                    }`}>
                                        {part.condition}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                        <ArrowDownLeft className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;