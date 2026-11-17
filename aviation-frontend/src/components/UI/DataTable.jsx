// src/components/UI/DataTable.jsx
import { ChevronLeft, ChevronRight, Edit2, Trash2, Eye, Search } from 'lucide-react';
import { useState } from 'react';
import EmptyState from './EmptyState';

const DataTable = ({
                       columns,
                       data,
                       onEdit,
                       onDelete,
                       onView,
                       keyExtractor = (item) => item.id,
                       pageSize = 10
                   }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-ram-red/15 focus:border-ram-red/30 transition-all"
                    />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Showing <span className="text-slate-700">{paginatedData.length}</span> of <span className="text-slate-700">{filteredData.length}</span> entries
                </span>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className={col.className || ''}>{col.header}</th>
                        ))}
                        {(onEdit || onDelete || onView) && <th>Actions</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)}>
                                <EmptyState title="No records found" subtitle="Try adjusting your search or filters." />
                            </td>
                        </tr>
                    ) : (
                        paginatedData.map((item) => (
                            <tr key={keyExtractor(item)}>
                                {columns.map((col) => (
                                    <td key={col.key}>
                                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                                    </td>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <td>
                                        <div className="flex items-center gap-1">
                                            {onView && (
                                                <button
                                                    onClick={() => onView(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(item)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-50">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                    currentPage === page
                                        ? 'bg-ram-red text-white shadow-sm shadow-ram-red/20'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataTable;