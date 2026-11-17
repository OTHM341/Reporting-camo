import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';


const ACTIONS = {
    SET_FLIGHTS: 'SET_FLIGHTS',
    ADD_FLIGHT: 'ADD_FLIGHT',
    UPDATE_FLIGHT: 'UPDATE_FLIGHT',
    DELETE_FLIGHT: 'DELETE_FLIGHT',

    SET_MAINTENANCE: 'SET_MAINTENANCE',
    ADD_MAINTENANCE: 'ADD_MAINTENANCE',
    UPDATE_MAINTENANCE: 'UPDATE_MAINTENANCE',
    DELETE_MAINTENANCE: 'DELETE_MAINTENANCE',

    SET_DEFECTS: 'SET_DEFECTS',
    ADD_DEFECT: 'ADD_DEFECT',
    UPDATE_DEFECT: 'UPDATE_DEFECT',
    DELETE_DEFECT: 'DELETE_DEFECT',

    SET_AIRCRAFT: 'SET_AIRCRAFT',
    SET_EMPLOYEES: 'SET_EMPLOYEES',

    IMPORT_EXCEL: 'IMPORT_EXCEL',
    CLEAR_ALL: 'CLEAR_ALL',
};

const loadFromStorage = (key, defaultValue) => {
    try {
        const stored = localStorage.getItem(`ram_camo_${key}`);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const initialState = {
    flights: loadFromStorage('flights', []),
    maintenance: loadFromStorage('maintenance', []),
    defects: loadFromStorage('defects', []),
    aircraft: loadFromStorage('aircraft', []),
    employees: loadFromStorage('employees', []),
    lastImport: loadFromStorage('lastImport', null),
};

// ─────────────────────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────────────────────
const appDataReducer = (state, action) => {
    switch (action.type) {
        // ── FLIGHTS ──
        case ACTIONS.SET_FLIGHTS:
            return { ...state, flights: action.payload };
        case ACTIONS.ADD_FLIGHT:
            return { ...state, flights: [...state.flights, action.payload] };
        case ACTIONS.UPDATE_FLIGHT:
            return {
                ...state,
                flights: state.flights.map(f =>
                    f.Flight_Number === action.payload.Flight_Number ? action.payload : f
                ),
            };
        case ACTIONS.DELETE_FLIGHT:
            return {
                ...state,
                flights: state.flights.filter(f => f.Flight_Number !== action.payload),
            };

        // ── MAINTENANCE ──
        case ACTIONS.SET_MAINTENANCE:
            return { ...state, maintenance: action.payload };
        case ACTIONS.ADD_MAINTENANCE:
            return { ...state, maintenance: [...state.maintenance, action.payload] };
        case ACTIONS.UPDATE_MAINTENANCE:
            return {
                ...state,
                maintenance: state.maintenance.map(m =>
                    m.ID === action.payload.ID ? action.payload : m
                ),
            };
        case ACTIONS.DELETE_MAINTENANCE:
            return {
                ...state,
                maintenance: state.maintenance.filter(m => m.ID !== action.payload),
            };

        // ── DEFECTS ──
        case ACTIONS.SET_DEFECTS:
            return { ...state, defects: action.payload };
        case ACTIONS.ADD_DEFECT:
            return { ...state, defects: [...state.defects, action.payload] };
        case ACTIONS.UPDATE_DEFECT:
            return {
                ...state,
                defects: state.defects.map(d =>
                    d.Defect_ID === action.payload.Defect_ID ? action.payload : d
                ),
            };
        case ACTIONS.DELETE_DEFECT:
            return {
                ...state,
                defects: state.defects.filter(d => d.Defect_ID !== action.payload),
            };

        // ── AIRCRAFT & EMPLOYEES SETTERS ──
        case ACTIONS.SET_AIRCRAFT:
            return { ...state, aircraft: action.payload };
        case ACTIONS.SET_EMPLOYEES:
            return { ...state, employees: action.payload };

        // ── IMPORT EXCEL GLOBAL ──
        case ACTIONS.IMPORT_EXCEL:
            const { dataType, data } = action.payload;
            const existingData = state[dataType] || [];
            
            const getId = (item, type) => {
                if (type === 'flights') return item.Flight_Number || item.id;
                if (type === 'maintenance') return item.ID || item.id;
                if (type === 'defects') return item.Defect_ID || item.id;
                if (type === 'aircraft' || type === 'fleet') return item.Immatriculation || item.id;
                if (type === 'employees' || type === 'personnel') return item.Matricule || item.Email || item.id;
                return item.id;
            };

            const existingIds = new Set(existingData.map(item => getId(item, dataType)));
            
            const newData = data.filter(item => {
                const id = getId(item, dataType);
                return !existingIds.has(id);
            });

            // Map internal keys if necessary
            const targetKey = dataType === 'fleet' ? 'aircraft' : 
                             dataType === 'personnel' ? 'employees' : 
                             dataType;

            return {
                ...state,
                [targetKey]: [...(state[targetKey] || []), ...newData],
                lastImport: {
                    dataType,
                    timestamp: new Date().toISOString(),
                    count: data.length,
                },
            };

        // ── CLEAR ALL ──
        case ACTIONS.CLEAR_ALL:
            return { flights: [], maintenance: [], defects: [], aircraft: [], employees: [], lastImport: null };

        default:
            return state;
    }
};

// ─────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────
const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appDataReducer, initialState);

    // Persistance automatique dans localStorage
    useEffect(() => {
        localStorage.setItem('ram_camo_flights', JSON.stringify(state.flights));
        localStorage.setItem('ram_camo_maintenance', JSON.stringify(state.maintenance));
        localStorage.setItem('ram_camo_defects', JSON.stringify(state.defects));
        localStorage.setItem('ram_camo_aircraft', JSON.stringify(state.aircraft));
        localStorage.setItem('ram_camo_employees', JSON.stringify(state.employees));
        if (state.lastImport) {
            localStorage.setItem('ram_camo_lastImport', JSON.stringify(state.lastImport));
        }
    }, [state.flights, state.maintenance, state.defects, state.aircraft, state.employees, state.lastImport]);

    // ── Helpers d'import Excel ──
    const importExcelFile = useCallback((file, dataType) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const bstr = evt.target.result;
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const data = XLSX.utils.sheet_to_json(ws);

                    if (data.length === 0) {
                        reject(new Error('Fichier vide ou invalide'));
                        return;
                    }

                    dispatch({
                        type: ACTIONS.IMPORT_EXCEL,
                        payload: { dataType, data },
                    });

                    resolve({ count: data.length, dataType });
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsBinaryString(file);
        });
    }, [dispatch]);

    // ── Helpers de statistiques ──
    const getStats = useCallback(() => ({
        flights: {
            total: state.flights.length,
            inFlight: state.flights.filter(f => f.Status === 'IN FLIGHT').length,
            arrived: state.flights.filter(f => f.Status === 'ARRIVED').length,
            delayed: state.flights.filter(f => f.Status === 'DELAYED').length,
            cancelled: state.flights.filter(f => f.Status === 'CANCELLED').length,
            departed: state.flights.filter(f => f.Status === 'DEPARTED').length,
        },
        maintenance: {
            total: state.maintenance.length,
            planned: state.maintenance.filter(m => m.Status === 'PLANNED').length,
            inProgress: state.maintenance.filter(m => m.Status === 'IN PROGRESS').length,
            completed: state.maintenance.filter(m => m.Status === 'COMPLETED').length,
            pending: state.maintenance.filter(m => m.Status === 'PENDING').length,
        },
        defects: {
            total: state.defects.length,
            open: state.defects.filter(d => d.Status === 'OPEN').length,
            resolved: state.defects.filter(d => d.Status === 'RESOLVED').length,
            closed: state.defects.filter(d => d.Status === 'CLOSED').length,
            critical: state.defects.filter(d => d.Severity === 'CRITICAL').length,
            major: state.defects.filter(d => d.Severity === 'MAJOR').length,
            minor: state.defects.filter(d => d.Severity === 'MINOR').length,
        },
        aircraft: {
            total: state.aircraft.length,
            active: state.aircraft.filter(a => a.Statut === 'Actif' || a.Statut === 'ACTIVE').length,
        },
        employees: {
            total: state.employees.length,
            admins: state.employees.filter(e => e.Role_Systeme === 'ADMIN').length,
            managers: state.employees.filter(e => e.Role_Systeme === 'MANAGER').length,
            techs: state.employees.filter(e => e.Role_Systeme === 'TECH').length,
        }
    }), [state.flights, state.maintenance, state.defects, state.aircraft, state.employees]);

    const value = {
        state,
        dispatch,
        actions: ACTIONS,
        importExcelFile,
        getStats,
    };

    return (
        <AppDataContext.Provider value={value}>
            {children}
        </AppDataContext.Provider>
    );
};

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────
export const useAppData = () => {
    const context = useContext(AppDataContext);
    if (!context) {
        throw new Error('useAppData doit être utilisé dans un AppDataProvider');
    }
    return context;
};