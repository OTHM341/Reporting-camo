import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import { AlertTriangle, Plane, Clipboard, CheckCircle, Loader2, Send } from 'lucide-react';

const TechnicianReportDefect = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchingAircraft, setFetchingAircraft] = useState(true);
    const [aircraftList, setAircraftList] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        aircraftId: '',
        description: '',
        severity: 'MINOR',
        category: 'Avionics',
        reportedByEmail: user?.email || '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchAircraft = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/aircraft');
                setAircraftList(response.data);
            } catch (err) {
                console.error("Error fetching aircraft:", err);
                setError("Impossible de charger la liste des avions.");
            } finally {
                setFetchingAircraft(false);
            }
        };

        fetchAircraft();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.aircraftId) {
            newErrors.aircraftId = 'Veuillez sélectionner un aéronef';
        }
        
        if (!formData.description || formData.description.trim().length < 10) {
            newErrors.description = 'La description doit contenir au moins 10 caractères';
        }
        
        if (formData.description && formData.description.length > 2000) {
            newErrors.description = 'La description ne peut pas dépasser 2000 caractères';
        }
        
        if (!formData.reportedByEmail || !formData.reportedByEmail.includes('@')) {
            newErrors.reportedByEmail = 'Email invalide';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await axios.post('http://localhost:8080/api/defects', {
                aircraftId: parseInt(formData.aircraftId),
                description: formData.description,
                severity: formData.severity,
                category: formData.category,
                status: 'OPEN',
                reportedByEmail: formData.reportedByEmail
            });
            
            setSuccess(true);
            setFormData({
                aircraftId: '',
                description: '',
                severity: 'MINOR',
                category: 'Avionics',
                reportedByEmail: user?.email || '',
            });
            setErrors({});
        } catch (err) {
            console.error("Error reporting defect:", err);
            if (err.response?.data?.errors) {
                // Handle validation errors from backend
                const backendErrors = err.response.data.errors;
                setErrors(backendErrors);
                setError("Veuillez corriger les erreurs dans le formulaire.");
            } else {
                setError(err.response?.data?.error || "Une erreur est survenue lors de l'enregistrement du défaut.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto min-h-screen bg-slate-50/50">
            <header className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={18} className="text-ram-red" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Maintenance RAM</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Signaler un <span className="text-ram-red italic">Défaut</span> Technique</h1>
                <p className="text-slate-500 font-medium mt-2">Enregistrez une anomalie détectée sur un aéronef pour déclencher le protocole de maintenance.</p>
            </header>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-ram-red rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/20">
                            <Clipboard size={24} />
                        </div>
                        <div>
                            <h2 className="text-white font-black uppercase tracking-tight">Formulaire de Rapport</h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Technicien: {user?.firstName} {user?.lastName}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Aircraft Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Aéronef (Immatriculation)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-ram-red transition-colors">
                                    <Plane size={18} />
                                </div>
                                <select
                                    required
                                    name="aircraftId"
                                    value={formData.aircraftId}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-ram-red focus:ring-4 focus:ring-ram-red/5 transition-all appearance-none"
                                >
                                    <option value="">Sélectionner un avion...</option>
                                    {aircraftList.map(ac => (
                                        <option key={ac.id} value={ac.id}>{ac.registration} — {ac.model}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sévérité du défaut</label>
                            <select
                                name="severity"
                                value={formData.severity}
                                onChange={handleChange}
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-ram-red focus:ring-4 focus:ring-ram-red/5 transition-all"
                            >
                                <option value="MINOR">MINOR (Nuisance / Non-essentiel)</option>
                                <option value="MAJOR">MAJOR (Limitation opérationnelle)</option>
                                <option value="CRITICAL">CRITICAL (AOG / Immobilisation)</option>
                            </select>
                        </div>
                    </div>

                    {/* Category & Reported By */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Catégorie ATA</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-ram-red focus:ring-4 focus:ring-ram-red/5 transition-all"
                            >
                                <option value="Avionics">Avionics</option>
                                <option value="Engine">Engine</option>
                                <option value="Hydraulics">Hydraulics</option>
                                <option value="Structure">Structure</option>
                                <option value="Interior">Interior</option>
                                <option value="Electrical">Electrical</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Détecté par</label>
                            <input
                                readOnly
                                value={user?.email || 'N/A'}
                                className="w-full px-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-400 outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description détaillée de l'anomalie</label>
                        <textarea
                            required
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Décrivez précisément le problème observé (ex: Fuite hydraulique train principal gauche, alerte transpondeur intermittente...)"
                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-ram-red focus:ring-4 focus:ring-ram-red/5 transition-all resize-none"
                        />
                    </div>

                    {/* Feedback messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertTriangle size={18} />
                            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in fade-in slide-in-from-top-2 duration-300">
                            <CheckCircle size={18} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Défaut enregistré avec succès dans le système CAMO.</p>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading || fetchingAircraft}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-ram-red transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                ENREGISTREMENT...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                SOUMETTRE LE RAPPORT
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TechnicianReportDefect;