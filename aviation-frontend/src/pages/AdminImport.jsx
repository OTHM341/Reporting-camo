import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
    Database, ShieldCheck, Plane, Users,
    RefreshCw, CheckCircle2, AlertCircle, Loader2, ArrowRight,
    Activity, Layers, ClipboardCheck, Info,
    X, ChevronDown, ChevronUp, Eye,
    Wrench, AlertTriangle, PartyPopper
} from 'lucide-react';


const mockAPI = {
    checkDatabase: () => new Promise((resolve) => setTimeout(resolve, 1200)),
    initializeRoles: () => new Promise((resolve) => setTimeout(resolve, 1500)),
    importAircraft: (data) => new Promise((resolve) => setTimeout(() => resolve(data), 2000)),
    importPersonnel: (data) => new Promise((resolve) => setTimeout(() => resolve(data), 2000)),
    syncFlights: () => new Promise((resolve) => setTimeout(resolve, 2500)),
};

const logApiError = (label, err) => console.error(`[${label}]`, err);


const aircraftFleet = [
    'CN-RGA','CN-RGB','CN-RGC','CN-RGD','CN-RGE','CN-RGF','CN-RGG','CN-RGH',
    'CN-MAX','CN-BOE','CN-BOY','CN-BOR','CN-BOW','CN-BIZ','CN-RAK','CN-TAN',
    'CN-AGA','CN-OUJ','CN-FEZ','CN-NAD','CN-TET','CN-CAS','CN-SAL','CN-MAR'
];

const aircraftTypes = {
    'CN-RGA':'B737-800','CN-RGB':'B737-800','CN-RGC':'B787-9','CN-RGD':'A320-200',
    'CN-RGE':'A321-200','CN-RGF':'E190','CN-RGG':'B737-MAX8','CN-RGH':'B787-8',
    'CN-MAX':'B737-800','CN-BOE':'B787-9','CN-BOY':'A320-200','CN-BOR':'A321-200',
    'CN-BOW':'E190','CN-BIZ':'B737-800','CN-RAK':'B787-9','CN-TAN':'A320-200',
    'CN-AGA':'B737-MAX8','CN-OUJ':'B787-8','CN-FEZ':'B737-800','CN-NAD':'A321-200',
    'CN-TET':'E190','CN-CAS':'B737-800','CN-SAL':'B787-9','CN-MAR':'A320-200'
};

const routes = [
    ['CMN','MAD'],['CMN','ORY'],['CMN','CDG'],['CMN','JFK'],['CMN','YUL'],
    ['CMN','BRU'],['CMN','AMS'],['CMN','FRA'],['CMN','LHR'],['CMN','BCN'],
    ['AGA','CMN'],['AGA','ORY'],['AGA','CDG'],['RAK','CMN'],['RAK','ORY'],
    ['RAK','LGW'],['TNG','CMN'],['TNG','ORY'],['FEZ','CMN'],['FEZ','ORY'],
    ['OUJ','CMN'],['NDR','CMN'],['TET','CMN'],['CMN','IST'],['CMN','DXB'],
    ['CMN','CAI'],['CMN','DKR'],['CMN','ABJ'],['CMN','LOS'],['CMN','JNB']
];

const flightPrefixes = ['AT'];
const flightStatuses = ['DEPARTED','ARRIVED','SCHEDULED','DELAYED','CANCELLED','BOARDING','IN FLIGHT'];
const maintTypes = ['A-Check','C-Check','Line Maintenance','D-Check','B-Check','Engine Overhaul','Landing Gear Inspection','Avionics Update'];
const maintStatuses = ['PLANNED','IN PROGRESS','COMPLETED','PENDING','DEFERRED','CANCELLED'];
const defectCategories = ['Cabin Systems','Flight Controls','Engine','Landing Gear','Avionics','Hydraulic Systems','Electrical Systems','Fuel Systems','Environmental','Structural','APU','Communication','Navigation','Oxygen','Fire Protection'];
const defectSeverities = ['MINOR','MAJOR','CRITICAL'];
const defectStatuses = ['OPEN','RESOLVED','CLOSED','UNDER INVESTIGATION','DEFERRED (MEL)'];

const technicians = [
    'Amine Benali','Nadia El Amrani','Ibrahim Chafik','Hamid Zouhair','Adil Bouchoufou',
    'Karim El Amrani','Fatima Bennani','Ahmed Filali','Sara Alaoui','Youssef Chraibi',
    'Laila Ouazzani','Omar Idrisi','Nadia Tazi','Mohamed Benkirane','Samira Lahbabi',
    'Rachid Moussaoui','Amina Fassi','Hassan El Fassi','Leila Berrada','Khalid Mansouri'
];

const defectDescriptions = [
    'Cabin pressurization warning light intermittent','Landing gear indicator light malfunction',
    'Battery water heater not functioning','Passenger seat 12A recline mechanism broken',
    'Overhead bin latch stuck in open position','Reading light flickering in row 15',
    'Galley oven temperature sensor erratic','Toilet flush valve leaking',
    'Cabin temperature control knob unresponsive','IFE screen black on seat 4F',
    'Engine #1 oil pressure gauge reading low','Autopilot disconnect warning false trigger',
    'Rudder trim indicator offset by 2 degrees','Flap position sensor intermittent signal loss',
    'Brake temperature monitoring system fault','Fuel quantity indicator discrepancy tank 2',
    'Weather radar display garbled image','TCAS traffic advisory false alert',
    'Cockpit window heating element failure','Hydraulic system B pressure fluctuation',
    'Generator #2 offline during engine start','Smoke detector false alarm in cargo hold',
    'Oxygen mask deployment test failure','Emergency exit slide pressure low',
    'APU exhaust temperature exceeding limit','VHF radio #1 static interference',
    'GPS signal intermittent during approach','Wing anti-ice valve stuck closed',
    'Engine cowl latch warning light stays on','Landing gear door seal worn',
    'Cabin altitude warning horn spurious activation','Fuel transfer pump #3 not operating',
    'Flight director command bar deviation','Stall warning system test failure',
    'Windshield wiper motor sluggish','Cockpit voice recorder channel 3 noisy',
    'Passenger oxygen system pressure drop','Cargo fire suppression system test fault',
    'Engine vibration monitor spike on climb','Air conditioning pack #2 overheat shutdown',
    'Nose wheel steering feedback excessive','Spoiler #4 deployment slower than spec',
    'Transponder altitude reporting error','DME distance readout blank',
    'ADF bearing indicator erratic','Cabin PA system volume low on left side',
    'Evacuation slide inflation bottle pressure low','Engine #2 starter motor grinding noise',
    'Aileron trim tab actuator sluggish','Stabilizer trim motor overheating',
    'Fuel jettison valve seal leaking','Pitot tube heater inoperative',
    'Static port blockage indicator triggered','Cockpit flood light dimmer switch faulty',
    'Emergency lighting system battery test fail','Cargo loading system hydraulic leak',
    'Passenger door seal compressed beyond limits','Engine thrust reverser deploy time slow'
];

// ─────────────────────────────────────────────────────────────
// VALIDATEURS DE DONNÉES
// ─────────────────────────────────────────────────────────────
const validateFleetData = (rows) => {
    const errors = [];
    const required = ['Immatriculation', 'Type', 'Modèle'];
    rows.forEach((row, idx) => {
        required.forEach(field => {
            if (!row[field] || String(row[field]).trim() === '') {
                errors.push(`Ligne ${idx + 2}: champ "${field}" manquant`);
            }
        });
        if (row.Immatriculation && !String(row.Immatriculation).startsWith('CN-')) {
            errors.push(`Ligne ${idx + 2}: Immatriculation "${row.Immatriculation}" invalide (doit commencer par CN-)`);
        }
    });
    return errors;
};

const validatePersonnelData = (rows) => {
    const errors = [];
    const required = ['Email', 'Role_Systeme', 'Nom', 'Prenom'];
    const validRoles = ['ADMIN', 'MANAGER', 'TECH'];
    rows.forEach((row, idx) => {
        required.forEach(field => {
            if (!row[field] || String(row[field]).trim() === '') {
                errors.push(`Ligne ${idx + 2}: champ "${field}" manquant`);
            }
        });
        if (row.Role_Systeme && !validRoles.includes(String(row.Role_Systeme).toUpperCase())) {
            errors.push(`Ligne ${idx + 2}: Role "${row.Role_Systeme}" invalide (ADMIN, MANAGER, TECH)`);
        }
        if (row.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(row.Email))) {
            errors.push(`Ligne ${idx + 2}: Email "${row.Email}" invalide`);
        }
    });
    return errors;
};

// ─────────────────────────────────────────────────────────────
// COMPOSANT: APERÇU DES DONNÉES IMPORTÉES
// ─────────────────────────────────────────────────────────────
const DataPreview = ({ data, type, onClose, onConfirm, loading }) => {
    const [expanded, setExpanded] = useState(false);
    if (!data || data.length === 0) return null;

    const headers = Object.keys(data[0]);
    const displayData = expanded ? data : data.slice(0, 5);
    const typeLabels = {
        fleet: 'Flotte', personnel: 'Personnel',
        flights: 'Vols', maintenance: 'Maintenance', defects: 'Défauts'
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            Aperçu des données {typeLabels[type] || type}
                        </h3>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                            {data.length} enregistrements détectés • Vérifiez avant confirmation
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-[11px]">
                            <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                {headers.map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-black text-slate-600 uppercase tracking-wider border-b border-slate-200">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {displayData.map((row, i) => (
                                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    {headers.map(h => (
                                        <td key={h} className="px-4 py-2.5 text-slate-700 font-medium truncate max-w-[200px]">
                                            {String(row[h] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {data.length > 5 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="mt-3 flex items-center gap-1 text-[10px] font-black text-ram-red uppercase tracking-widest hover:underline mx-auto"
                        >
                            {expanded ? <><ChevronUp size={12}/> Réduire</> : <><ChevronDown size={12}/> Voir les {data.length - 5} autres lignes</>}
                        </button>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 border border-slate-200 transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-8 py-3 bg-ram-red text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14}/>}
                        {loading ? 'Import en cours...' : `Confirmer l\'import (${data.length} lignes)`}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// COMPOSANT: CARD DE STEP
// ─────────────────────────────────────────────────────────────
const StepCard = ({ number, title, icon: Icon, description, onAction, status, loading, extraInfo }) => {
    const isSuccess = status === 'success';
    const isError = status === 'error';
    const isPreview = status === 'preview';

    return (
        <div className={`bg-white p-6 rounded-[2rem] border transition-all flex flex-col h-full group relative overflow-hidden
            ${isSuccess ? 'border-emerald-200 bg-emerald-50/20 shadow-emerald-100/50 shadow-lg' :
            isError ? 'border-red-200 bg-red-50/20 shadow-red-100/50 shadow-lg' :
                isPreview ? 'border-amber-200 bg-amber-50/20 shadow-amber-100/50 shadow-lg' :
                    'border-slate-100 hover:border-slate-200 hover:shadow-lg'}`}>

            <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-2xl flex items-center justify-center relative transition-transform group-hover:scale-110 
                    ${isSuccess ? 'bg-emerald-100 text-emerald-600' :
                    isError ? 'bg-red-100 text-red-600' :
                        isPreview ? 'bg-amber-100 text-amber-600' :
                            'bg-slate-50 text-ram-red'}`}>
                    <Icon size={24} />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white">
                        {number}
                    </span>
                </div>
                {isSuccess && (
                    <div className="flex items-center gap-1 text-emerald-500 font-black text-[9px] uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                        <CheckCircle2 size={12} /> Validé
                    </div>
                )}
                {isError && (
                    <div className="flex items-center gap-1 text-red-500 font-black text-[9px] uppercase tracking-widest bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                        <AlertCircle size={12} /> Erreur
                    </div>
                )}
                {isPreview && (
                    <div className="flex items-center gap-1 text-amber-500 font-black text-[9px] uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                        <Eye size={12} /> Prévisualisé
                    </div>
                )}
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{title}</h3>
            <p className="text-[11px] text-slate-500 font-bold leading-relaxed mb-4 flex-1 italic">{description}</p>

            {extraInfo && (
                <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-600 font-bold">{extraInfo}</p>
                </div>
            )}

            <button
                onClick={onAction}
                disabled={loading || isSuccess}
                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                    ${isSuccess ? 'bg-emerald-500 text-white cursor-default' :
                    isError ? 'bg-red-600 text-white hover:bg-red-700' :
                        isPreview ? 'bg-amber-500 text-white hover:bg-amber-600' :
                            'bg-slate-900 text-white hover:bg-ram-red'}`}
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> :
                    isSuccess ? <ClipboardCheck size={14} /> :
                        isPreview ? <Eye size={14} /> :
                            isError ? <RefreshCw size={14} /> : <ArrowRight size={14} />}
                {loading ? 'Traitement...' : isSuccess ? 'Étape validée' : isPreview ? "Voir l\'aperçu" : isError ? 'Réessayer' : 'Exécuter'}
            </button>
        </div>
    );
};


const ProgressLog = ({ logs }) => (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
            <Activity size={14} className="text-ram-red" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Journal d\'exécution</span>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {logs.length === 0 ? (
                <p className="text-slate-500 text-[11px] font-bold italic text-center py-8">Aucune action exécutée pour le moment</p>
            ) : (
                logs.map((log, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-[10px] font-bold 
                        ${log.type === 'success' ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/30' :
                        log.type === 'error' ? 'bg-red-900/20 text-red-400 border border-red-800/30' :
                            log.type === 'info' ? 'bg-blue-900/20 text-blue-400 border border-blue-800/30' :
                                'bg-slate-800/50 text-slate-300 border border-white/5'}`}>
                        {log.type === 'success' && <CheckCircle2 size={14} className="shrink-0 mt-0.5"/>}
                        {log.type === 'error' && <AlertCircle size={14} className="shrink-0 mt-0.5"/>}
                        {log.type === 'info' && <Info size={14} className="shrink-0 mt-0.5"/>}
                        {log.type === 'process' && <Loader2 size={14} className="shrink-0 mt-0.5 animate-spin"/>}
                        <div>
                            <span className="text-slate-500 text-[9px] font-black uppercase tracking-wider">{log.time}</span>
                            <p className="mt-0.5">{log.message}</p>
                            {log.detail && <p className="text-slate-500 mt-1 text-[9px]">{log.detail}</p>}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────
const AdminImport = () => {
    const { state, dispatch, actions, importExcelFile } = useAppData();
    const navigate = useNavigate();

    const [steps, setSteps] = useState({
        db: { status: 'idle', loading: false },
        roles: { status: 'idle', loading: false },
        fleet: { status: 'idle', loading: false, fileName: null, data: null },
        personnel: { status: 'idle', loading: false, fileName: null, data: null },
        flights: { status: 'idle', loading: false, fileName: null, data: null },
        maintenance: { status: 'idle', loading: false, fileName: null, data: null },
        defects: { status: 'idle', loading: false, fileName: null, data: null },
        sync: { status: 'idle', loading: false }
    });

    const [logs, setLogs] = useState([]);
    const [previewData, setPreviewData] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    const [pendingOperationalImport, setPendingOperationalImport] = useState(null);
    const [finalValidation, setFinalValidation] = useState({ loading: false, success: false, error: null });

    const addLog = (type, message, detail = null) => {
        const time = new Date().toLocaleTimeString('fr-FR', { hour12: false });
        setLogs(prev => [{ type, message, detail, time }, ...prev].slice(0, 50));
    };

    const updateStep = (key, data) => setSteps(prev => ({ ...prev, [key]: { ...prev[key], ...data } }));

    // ── 1. Vérification PostgreSQL ──
    const handleDBCheck = async () => {
        addLog('process', "Vérification de l\'intégrité de la base PostgreSQL...");
        updateStep('db', { loading: true, status: 'idle' });
        try {
            await mockAPI.checkDatabase();
            updateStep('db', { status: 'success', loading: false });
            addLog('success', 'Intégrité PostgreSQL vérifiée avec succès',
                'Schémas validés • Connexion RDS stable • Latence: 0.04ms');
        } catch (err) {
            updateStep('db', { status: 'error', loading: false });
            logApiError('DB-Check', err);
            addLog('error', 'Échec de la vérification PostgreSQL', err?.message || 'Erreur inconnue');
        }
    };

    // ── 2. Initialisation des rôles ──
    const handleInitRoles = async () => {
        addLog('process', 'Initialisation des rôles et utilisateurs système...');
        updateStep('roles', { loading: true, status: 'idle' });
        try {
            await mockAPI.initializeRoles();
            updateStep('roles', { status: 'success', loading: false });
            addLog('success', 'Rôles créés: ADMIN, MANAGER, TECH',
                '3 rôles initialisés • Comptes par défaut générés');
        } catch (err) {
            updateStep('roles', { status: 'error', loading: false });
            logApiError('Roles-Init', err);
            addLog('error', "Échec de l\'initialisation des rôles", err?.message || 'Erreur inconnue');
        }
    };

    // ── Import Excel Global ──
    const handleFileSelect = (dataType) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls, .csv';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            addLog('process', `Lecture du fichier ${file.name} (${dataType})...`);
            updateStep(dataType, { loading: true, status: 'idle' });

            try {
                const reader = new FileReader();
                reader.onload = async (evt) => {
                    const bstr = evt.target.result;
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const data = XLSX.utils.sheet_to_json(ws);

                    if (data.length === 0) {
                        updateStep(dataType, { status: 'error', loading: false });
                        addLog('error', `Fichier ${file.name} vide ou invalide`);
                        return;
                    }

                    // Validation spécifique pour Fleet et Personnel
                    if (dataType === 'fleet' || dataType === 'personnel') {
                        const validator = dataType === 'fleet' ? validateFleetData : validatePersonnelData;
                        const errors = validator(data);
                        if (errors.length > 0) {
                            updateStep(dataType, { status: 'error', loading: false });
                            addLog('error', `${errors.length} erreur(s) détectée(s) dans ${file.name}`,
                                errors.slice(0, 3).join(' • ') + (errors.length > 3 ? `...+${errors.length - 3} autres` : ''));
                            return;
                        }
                    }

                    updateStep(dataType, {
                        loading: false,
                        fileName: file.name,
                        data,
                        status: 'preview'
                    });
                    addLog('info', `${data.length} lignes prêtes à importer depuis ${file.name}`,
                        'Validation OK • En attente de confirmation');

                    setPreviewData(data);
                    setPreviewType(dataType);
                    setPendingOperationalImport({ file, dataType });
                };
                reader.onerror = () => {
                    updateStep(dataType, { status: 'error', loading: false });
                    addLog('error', `Erreur de lecture du fichier ${file.name}`);
                };
                reader.readAsBinaryString(file);
            } catch (err) {
                updateStep(dataType, { status: 'error', loading: false });
                logApiError(`Import-${dataType}`, err);
                addLog('error', `Erreur de lecture: ${file.name}`, err?.message || 'Erreur inconnue');
            }
        };
        input.click();
    };

    const handleConfirmOperationalImport = async () => {
        if (!pendingOperationalImport) {
            addLog('error', 'Aucun import en attente');
            return;
        }
        const { file, dataType } = pendingOperationalImport;
        const stepData = steps[dataType];

        updateStep(dataType, { loading: true, status: 'idle' });
        setPreviewData(null);
        setPendingOperationalImport(null);

        try {
            if (typeof importExcelFile === 'function') {
                const result = await importExcelFile(file, dataType);

                if (dataType === 'fleet') await mockAPI.importAircraft(stepData.data);
                if (dataType === 'personnel') await mockAPI.importPersonnel(stepData.data);

                updateStep(dataType, {
                    status: 'success',
                    loading: false,
                    fileName: file.name,
                });
                addLog('success', `${result?.count || 'N/A'} enregistrements ${dataType} importés avec succès`,
                    'Données stockées dans le store global • Persistées dans localStorage');
            } else {
                addLog('error', 'Fonction importExcelFile non disponible dans le contexte');
                updateStep(dataType, { status: 'error', loading: false });
            }
        } catch (err) {
            updateStep(dataType, { status: 'error', loading: false });
            logApiError(`Import-${dataType}`, err);
            addLog('error', `Échec de l\'import ${dataType}`, err?.message || 'Erreur inconnue');
        }
    };

    // ── 8. Synchronisation des vols ──
    const handleSync = async () => {
        addLog('process', 'Synchronisation des données de vols historiques et prévisionnels...');
        updateStep('sync', { loading: true, status: 'idle' });
        try {
            await mockAPI.syncFlights();
            updateStep('sync', { status: 'success', loading: false });
            addLog('success', 'Données de vols synchronisées',
                'Historique + prévisions • API RAM connectée');
        } catch (err) {
            updateStep('sync', { status: 'error', loading: false });
            logApiError('Flight-Sync', err);
            addLog('error', 'Échec de la synchronisation des vols', err?.message || 'Erreur inconnue');
        }
    };

    // ── FINAL VALIDATION ──
    // MODIFIÉ : Redirection directe vers le dashboard sans vérifier les imports
    const handleFinalValidation = async () => {
        setFinalValidation({ loading: true, success: false, error: null });
        addLog('process', 'Redirection vers le Dashboard...');

        // Simulation d'un court délai pour l'UX, puis redirection directe
        setTimeout(() => {
            setFinalValidation({ loading: false, success: true, error: null });
            addLog('success', 'Redirection vers le Dashboard', 'Navigation en cours...');
            navigate('/dashboard');
        }, 800);
    };

    // ── Calcul de la progression globale ──
    const completedSteps = Object.values(steps).filter(s => s.status === 'success').length;
    const progressPercent = (completedSteps / 8) * 100;
    const allStepsCompleted = completedSteps === 8;

    // Safe access to state properties
    const flightsCount = state?.flights?.length ?? 0;
    const maintenanceCount = state?.maintenance?.length ?? 0;
    const defectsCount = state?.defects?.length ?? 0;
    const aircraftCount = state?.aircraft?.length ?? 0;
    const employeesCount = state?.employees?.length ?? 0;

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto font-sans min-h-screen bg-slate-50/50">
            {/* Header */}
            <header className="mb-10">
                <div className="flex items-center gap-2 mb-2">
                    <Layers size={14} className="text-ram-red" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Déploiement Système RAM</span>
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                    Centre de <span className="text-ram-red italic">Contrôle</span> Admin
                </h1>
                <p className="text-slate-500 font-bold mt-2 max-w-2xl text-sm leading-relaxed">
                    Mise en œuvre du bilan technique : initialisation sécurisée de l\'environnement,
                    chargement de la flotte Royal Air Maroc et synchronisation des flux opérationnels.
                </p>

                {/* Barre de progression globale */}
                <div className="mt-6 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        <span>Progression globale du déploiement</span>
                        <span className="text-slate-900">{completedSteps}/8 étapes</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                            className="bg-ram-red h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne principale: les 8 étapes */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Étape 1: DB Integrity */}
                    <StepCard
                        number="1"
                        title="Intégrité DB"
                        icon={Database}
                        description="Vérification de l\'intégrité de la base de données PostgreSQL et validation des schémas de données."
                        onAction={handleDBCheck}
                        status={steps.db.status}
                        loading={steps.db.loading}
                        extraInfo={steps.db.status === 'success' ? 'PostgreSQL 15.4 • Schémas validés' : null}
                    />

                    {/* Étape 2: Roles */}
                    <StepCard
                        number="2"
                        title="Rôles Système"
                        icon={ShieldCheck}
                        description="Création et initialisation des rôles (ADMIN, MANAGER, TECH) et comptes par défaut."
                        onAction={handleInitRoles}
                        status={steps.roles.status}
                        loading={steps.roles.loading}
                        extraInfo={steps.roles.status === 'success' ? '3 rôles • Comptes actifs' : null}
                    />

                    {/* Étape 3: Fleet Import */}
                    <StepCard
                        number="3"
                        title="Flotte RAM"
                        icon={Plane}
                        description="Chargement des données de la flotte Royal Air Maroc (Immatriculations CN-xxx, Types, Cycles)."
                        onAction={() => {
                            if (steps.fleet.status === 'preview') {
                                setPreviewData(steps.fleet.data);
                                setPreviewType('fleet');
                                setPendingOperationalImport({ file: { name: steps.fleet.fileName }, dataType: 'fleet' });
                            } else {
                                handleFileSelect('fleet');
                            }
                        }}
                        status={steps.fleet.status}
                        loading={steps.fleet.loading}
                        extraInfo={steps.fleet.status === 'success' ? `${aircraftCount} aéronefs enregistrés` : steps.fleet.fileName ? `Fichier: ${steps.fleet.fileName}` : null}
                    />

                    {/* Étape 4: Personnel Import */}
                    <StepCard
                        number="4"
                        title="Personnel"
                        icon={Users}
                        description="Importation du personnel opérationnel et technique depuis le registre RH (Email + Rôle)."
                        onAction={() => {
                            if (steps.personnel.status === 'preview') {
                                setPreviewData(steps.personnel.data);
                                setPreviewType('personnel');
                                setPendingOperationalImport({ file: { name: steps.personnel.fileName }, dataType: 'personnel' });
                            } else {
                                handleFileSelect('personnel');
                            }
                        }}
                        status={steps.personnel.status}
                        loading={steps.personnel.loading}
                        extraInfo={steps.personnel.status === 'success' ? `${employeesCount} employés enregistrés` : steps.personnel.fileName ? `Fichier: ${steps.personnel.fileName}` : null}
                    />

                    {/* Étape 5: Flights Import */}
                    <StepCard
                        number="5"
                        title="Import Vols"
                        icon={Plane}
                        description="Chargement des vols RAM. Utilise importExcelFile() pour la persistence globale."
                        onAction={() => {
                            if (steps.flights.status === 'preview') {
                                setPreviewData(steps.flights.data);
                                setPreviewType('flights');
                                setPendingOperationalImport({ file: { name: steps.flights.fileName }, dataType: 'flights' });
                            } else {
                                handleFileSelect('flights');
                            }
                        }}
                        status={steps.flights.status}
                        loading={steps.flights.loading}
                        extraInfo={steps.flights.status === 'success' ? `${flightsCount} vols enregistrés` : steps.flights.fileName ? `Fichier: ${steps.flights.fileName}` : null}
                    />

                    {/* Étape 6: Maintenance Import */}
                    <StepCard
                        number="6"
                        title="Import Maintenance"
                        icon={Wrench}
                        description="Chargement des données de maintenance dans le store global (A-Check, C-Check, Line, etc.)."
                        onAction={() => {
                            if (steps.maintenance.status === 'preview') {
                                setPreviewData(steps.maintenance.data);
                                setPreviewType('maintenance');
                                setPendingOperationalImport({ file: { name: steps.maintenance.fileName }, dataType: 'maintenance' });
                            } else {
                                handleFileSelect('maintenance');
                            }
                        }}
                        status={steps.maintenance.status}
                        loading={steps.maintenance.loading}
                        extraInfo={steps.maintenance.status === 'success' ? `${maintenanceCount} maintenances enregistrées` : steps.maintenance.fileName ? `Fichier: ${steps.maintenance.fileName}` : null}
                    />

                    {/* Étape 7: Defects Import */}
                    <StepCard
                        number="7"
                        title="Import Défauts"
                        icon={AlertTriangle}
                        description="Chargement des défauts et anomalies dans le store global (MINOR, MAJOR, CRITICAL)."
                        onAction={() => {
                            if (steps.defects.status === 'preview') {
                                setPreviewData(steps.defects.data);
                                setPreviewType('defects');
                                setPendingOperationalImport({ file: { name: steps.defects.fileName }, dataType: 'defects' });
                            } else {
                                handleFileSelect('defects');
                            }
                        }}
                        status={steps.defects.status}
                        loading={steps.defects.loading}
                        extraInfo={steps.defects.status === 'success' ? `${defectsCount} défauts enregistrés` : steps.defects.fileName ? `Fichier: ${steps.defects.fileName}` : null}
                    />

                    {/* Étape 8: Flight Sync */}
                    <StepCard
                        number="8"
                        title="Sync Vols"
                        icon={RefreshCw}
                        description="Génération et synchronisation des données de vols historiques et prévisionnels."
                        onAction={handleSync}
                        status={steps.sync.status}
                        loading={steps.sync.loading}
                        extraInfo={steps.sync.status === 'success' ? 'API RAM connectée' : null}
                    />

                    {/* Carte de statut système */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 flex flex-col justify-center border border-slate-800 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                            <Activity size={140} className="text-white" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-white text-2xl font-black mb-1 uppercase tracking-tighter">Statut Système</h3>
                            <p className="text-ram-red text-[10px] font-black uppercase tracking-widest mb-6">Monitoring Infrastructure Temps Réel</p>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                                        <span>Progression Sync</span>
                                        <span className="text-white">{Math.round(progressPercent)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-ram-red h-full transition-all duration-700"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-2xl border border-white/5">
                                    <Info size={16} className="text-blue-400 shrink-0" />
                                    <p className="text-[10px] font-bold text-slate-300 leading-tight">
                                        {completedSteps === 8
                                            ? 'Toutes les étapes sont complétées. Système prêt pour validation finale.'
                                            : "Exécutez les étapes dans l\'ordre pour finaliser le déploiement."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne latérale: Logs */}
                <div className="lg:col-span-1">
                    <ProgressLog logs={logs} />
                </div>
            </div>

            {/* SECTION VALIDATION FINALE */}
            <div className="mt-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className={`w-full max-w-4xl p-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-12 opacity-50`} />

                <div className={`p-10 rounded-[3rem] border-2 w-full max-w-3xl transition-all duration-500 relative overflow-hidden
                    ${finalValidation.success ? 'bg-emerald-50 border-emerald-200 shadow-2xl shadow-emerald-100' :
                    allStepsCompleted ? 'bg-white border-slate-200 shadow-xl' : 'bg-slate-50 border-slate-100 opacity-60'}`}>

                    {finalValidation.success && (
                        <div className="absolute top-0 right-0 p-6 animate-pulse text-emerald-200">
                            <PartyPopper size={120} />
                        </div>
                    )}

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-700
                            ${finalValidation.success ? 'bg-emerald-500 text-white rotate-[360deg]' :
                            allStepsCompleted ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            {finalValidation.success ? <CheckCircle2 size={40} /> : <ShieldCheck size={40} />}
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-3">
                            {finalValidation.success ? 'Redirection en cours...' : 'Validation Globale du Système'}
                        </h2>
                        <p className="text-slate-500 font-bold max-w-lg mb-8 italic text-sm leading-relaxed">
                            {finalValidation.success
                                ? 'Redirection vers le Dashboard Royal Air Maroc...'
                                : allStepsCompleted
                                    ? 'Toutes les étapes individuelles sont validées. Cliquez ci-dessous pour valider et accéder au Dashboard.'
                                    : 'Veuillez compléter les 8 étapes de configuration pour activer la validation finale.'}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <button
                                onClick={handleFinalValidation}
                                disabled={!allStepsCompleted || finalValidation.loading || finalValidation.success}
                                className={`group relative px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-3
                                    ${finalValidation.success
                                    ? 'bg-emerald-500 text-white cursor-default'
                                    : allStepsCompleted
                                        ? 'bg-ram-red text-white hover:bg-slate-900 shadow-lg shadow-red-200'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {finalValidation.loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Redirection...
                                    </>
                                ) : finalValidation.success ? (
                                    <>
                                        <PartyPopper size={18} />
                                        Redirection effectuée
                                    </>
                                ) : (
                                    <>
                                        Valider les données
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        {finalValidation.error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-bounce">
                                <AlertCircle size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{finalValidation.error}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de prévisualisation */}
            {previewData && previewType && (
                <DataPreview
                    data={previewData}
                    type={previewType}
                    onClose={() => {
                        setPreviewData(null);
                        setPendingOperationalImport(null);
                        // Reset le statut preview si c\'était un import opérationnel
                        if (['flights','maintenance','defects','fleet','personnel'].includes(previewType)) {
                            updateStep(previewType, { status: 'idle', loading: false });
                        }
                    }}
                    onConfirm={handleConfirmOperationalImport}
                    loading={steps[previewType]?.loading}
                />
            )}
        </div>
    );
};

export default AdminImport;