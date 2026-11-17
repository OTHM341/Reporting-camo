import { useState, useEffect, useCallback } from 'react';
import { authAPI, logApiError } from '../services/api';
import { 
    Users, UserPlus, Shield, Mail, Trash2, Edit2, 
    Search, Loader2, CheckCircle, XCircle, ShieldAlert,
    Key, Fingerprint, UserCheck, ShieldCheck
} from 'lucide-react';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';

const ROLE_CONFIG = {
    'ADMIN': { color: 'bg-slate-900 text-white', icon: ShieldCheck, label: 'Administrator' },
    'MANAGER': { color: 'bg-ram-red text-white', icon: Shield, label: 'Manager' },
    'TECHNICIAN': { color: 'bg-blue-600 text-white', icon: Fingerprint, label: 'Technician' },
    'USER': { color: 'bg-slate-200 text-slate-700', icon: Users, label: 'Standard User' }
};

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const [formData, setFormData] = useState({
        username: '', email: '', password: '', role: 'TECHNICIAN', firstName: '', lastName: ''
    });

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await authAPI.getAllUsers();
            // Ensure response.data is an array and filter out nulls
            const data = Array.isArray(response.data) ? response.data : [];
            setUsers(data);
        } catch (err) {
            logApiError('AdminUsers-Fetch', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            // Handle potentially missing roles array
            const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'TECHNICIAN';
            setFormData({
                username: user.username || '',
                email: user.email || '',
                role: userRole,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                password: '' 
            });
        } else {
            setEditingUser(null);
            setFormData({ username: '', email: '', password: '', role: 'TECHNICIAN', firstName: '', lastName: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingUser) {
                // For update, the backend usually expects the specific DTO
                await authAPI.updateUser(editingUser.id, {
                    ...formData,
                    roles: [formData.role]
                });
            } else {
                await authAPI.register(formData);
            }
            await fetchUsers();
            setShowModal(false);
        } catch (err) {
            logApiError('AdminUsers-Submit', err);
            alert(err.response?.data?.message || 'Operation failed. Check console for details.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await authAPI.toggleUserStatus(userId);
            await fetchUsers();
        } catch (err) {
            logApiError('AdminUsers-ToggleStatus', err);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await authAPI.deleteUser(userToDelete.id);
            await fetchUsers();
            setShowDeleteConfirm(false);
            setUserToDelete(null);
        } catch (err) {
            logApiError('AdminUsers-Delete', err);
            alert('Could not delete user. They might be linked to other records.');
            setShowDeleteConfirm(false);
        }
    };

    const filteredUsers = users.filter(user => {
        if (!user) return false;
        const term = searchTerm.toLowerCase();
        return (
            (user.username?.toLowerCase() || '').includes(term) ||
            (user.email?.toLowerCase() || '').includes(term) ||
            (user.firstName?.toLowerCase() || '').includes(term) ||
            (user.lastName?.toLowerCase() || '').includes(term)
        );
    });

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto font-sans">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert size={12} className="text-ram-red" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Access Control</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                        Application <span className="text-ram-red italic">Users</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage system authentication and privileges</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-ram-red text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:shadow-lg hover:shadow-ram-red/20 transition-all active:scale-95"
                >
                    <UserPlus size={16} /> Create System Account
                </button>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search accounts..." 
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-ram-red/5 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                            <UserCheck size={14} className="text-emerald-500" />
                            <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{users.length} Total Accounts</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Privileges</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6"><div className="h-12 bg-slate-100 rounded-2xl" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-600 border border-slate-200 shadow-sm group-hover:scale-110 transition-transform uppercase">
                                                    {user.username?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 uppercase tracking-tight">{user.firstName} {user.lastName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-slate-600 italic">
                                            <div className="flex items-center gap-2">
                                                <Mail size={12} className="text-slate-300" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles?.map(role => {
                                                    const config = ROLE_CONFIG[role] || ROLE_CONFIG.USER;
                                                    const Icon = config.icon;
                                                    return (
                                                        <span key={role} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${config.color} shadow-sm`}>
                                                            <Icon size={10} />
                                                            {role}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button 
                                                onClick={() => handleToggleStatus(user.id)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.enabled ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'}`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                {user.enabled ? 'Active' : 'Locked'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                <button onClick={() => handleOpenModal(user)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-blue-100 rounded-xl transition-all shadow-sm">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => { setUserToDelete(user); setShowDeleteConfirm(true); }}
                                                    className="p-2.5 text-slate-400 hover:text-ram-red hover:bg-white border border-transparent hover:border-red-100 rounded-xl transition-all shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                                                <Users size={32} />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No matching accounts found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE/EDIT MODAL */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'Update Security Profile' : 'New System Registration'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                            <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-ram-red/5 outline-none transition-all" required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                            <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-ram-red/5 outline-none transition-all" required />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                        <div className="relative">
                            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-ram-red/5 outline-none transition-all" placeholder="john.doe" required />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-ram-red/5 outline-none transition-all" placeholder="name@royalairmaroc.com" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role</label>
                            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-ram-red/5 outline-none transition-all appearance-none cursor-pointer">
                                <option value="TECHNICIAN">Technician</option>
                                <option value="MANAGER">Manager</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                {editingUser ? 'New Password (Optional)' : 'Initial Password'}
                            </label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-ram-red/5 outline-none transition-all" required={!editingUser} />
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-200 transition-all">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 px-6 py-4 bg-ram-red text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:shadow-xl hover:shadow-ram-red/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : editingUser ? 'Update Account' : 'Initialize Account'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog 
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Irreversible Deletion"
                message={`You are about to permanently delete user "${userToDelete?.username}". This will remove all associated logs and permissions. Continue?`}
                confirmText="Terminate Account"
                isDangerous={true}
            />
        </div>
    );
};

export default AdminUsers;