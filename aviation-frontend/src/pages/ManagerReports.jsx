// ============================================================================
// MANAGER REPORTS - PROFESSIONAL DASHBOARD
// Royal Air Maroc CAMO - Operational Intelligence
// ============================================================================
// Pure JavaScript (JSX) - No TypeScript
// Architecture: Modular monolith with strict constants
// State: useReducer with async action handling
// Performance: memoized computations, lazy loading, RAF animations
// Accessibility: WCAG 2.1 AA compliant
// ============================================================================

import React, {
    useEffect, useState, useMemo, useCallback, useRef, useReducer,
    Suspense, memo, Component
} from 'react';
import {
    Activity, BarChart3, Clock, Wrench, AlertCircle, Loader2, PieChart, History,
    Filter, Search, Users, TrendingUp, TrendingDown, Minus,
    RefreshCw, ChevronRight, MoreHorizontal, Maximize2, Share2,
    ShieldCheck, Download, Bell, Settings, Eye, Plane, Layers,
    Calendar, FileBarChart, MapPin, Wifi, Lock, Gauge,
    AlertTriangle
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart as RePieChart, Pie, Cell, ReferenceLine
} from 'recharts';

// Lazy imports for code splitting
const Logo = React.lazy(() => import('../components/UI/Logo'));
import { flightAPI, defectAPI, maintenanceAPI, logApiError } from '../services/api';

// ============================================================================
// SECTION 1: DESIGN TOKENS & THEME SYSTEM
// ============================================================================

const THEME = {
    brand: {
        primary: '#DC2626',
        primaryLight: '#FEE2E2',
        primaryDark: '#991B1B',
        secondary: '#1E293B',
        accent: '#3B82F6',
    },
    semantic: {
        success: '#10B981', successLight: '#D1FAE5',
        warning: '#F59E0B', warningLight: '#FEF3C7',
        danger: '#DC2626', dangerLight: '#FEE2E2',
        info: '#3B82F6', infoLight: '#DBEAFE',
    },
    chart: {
        primary: ['#DC2626', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'],
        severity: { critical: '#DC2626', major: '#F59E0B', minor: '#3B82F6' }
    },
    neutral: {
        50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1',
        400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155',
        800: '#1E293B', 900: '#0F172A',
    },
    radius: {
        sm: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem',
        '2xl': '1.5rem', '3xl': '2rem', '4xl': '2.5rem', full: '9999px',
    },
    shadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    },
    transition: {
        fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
        base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
        slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
        slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    }
};

// ============================================================================
// SECTION 2: CONSTANTS & ENUMS (as plain objects for JS)
// ============================================================================

const FlightStatus = {
    SCHEDULED: 'SCHEDULED', DEPARTED: 'DEPARTED', ARRIVED: 'ARRIVED',
    DELAYED: 'DELAYED', CANCELLED: 'CANCELLED',
};

const DefectSeverity = {
    CRITICAL: 'CRITICAL', MAJOR: 'MAJOR', MINOR: 'MINOR',
};

const DefectStatus = {
    OPEN: 'OPEN', IN_PROGRESS: 'IN_PROGRESS', RESOLVED: 'RESOLVED', CLOSED: 'CLOSED',
};

const MaintenanceStatus = {
    SCHEDULED: 'SCHEDULED', IN_PROGRESS: 'IN_PROGRESS', COMPLETED: 'COMPLETED', DEFERRED: 'DEFERRED',
};

const ReportStatus = {
    VERIFIED: 'VERIFIED', AUDITED: 'AUDITED', CRITICAL: 'CRITICAL', PENDING: 'PENDING',
};

const ReportType = {
    OPERATIONAL: 'OPERATIONAL', STRATEGIC: 'STRATEGIC', PERSONNEL: 'PERSONNEL', REGULATORY: 'REGULATORY',
};

const Priority = {
    LOW: 'low', MEDIUM: 'medium', HIGH: 'high', CRITICAL: 'critical',
};

const TrendDirection = {
    UP: 'up', DOWN: 'down', NEUTRAL: 'neutral',
};

const ConnectionStatus = {
    ONLINE: 'ONLINE', SYNCING: 'SYNCING', OFFLINE: 'OFFLINE', ERROR: 'ERROR',
};

const API_CONFIG = {
    refreshInterval: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    timeout: 10000,
};

const THRESHOLDS = {
    otp: { target: 85, warning: 80, critical: 75 },
    delay: { target: 15, warning: 30, critical: 60 },
    maintenance: { target: 95, warning: 90, critical: 85 },
    backlog: { target: 5, warning: 10, critical: 20 },
};

const CHART_CONFIG = {
    reliability: { targetLine: 85, animationDuration: 2000, gradientStartOpacity: 0.3, gradientEndOpacity: 0 },
    severity: { innerRadius: 70, outerRadius: 110, paddingAngle: 5, animationDuration: 1500, minLabelPercentage: 5 },
};

const MOCK_REPORTS = [
    { id: '1', title: 'Fleet Technical Reliability (FTR)', type: 'OPERATIONAL', date: '2024-05-15', status: 'VERIFIED', iconName: 'Activity', size: '2.4 MB', author: 'Capt. Ahmed Benani', department: 'Flight Operations', priority: 'high' },
    { id: '2', title: 'Delay Analysis Matrix - Q1', type: 'STRATEGIC', date: '2024-04-30', status: 'AUDITED', iconName: 'Clock', size: '4.1 MB', author: 'M. Karim El Fassi', department: 'Performance', priority: 'medium' },
    { id: '3', title: 'Workforce Efficiency Summary', type: 'PERSONNEL', date: '2024-04-15', status: 'VERIFIED', iconName: 'Users', size: '1.8 MB', author: 'Mme. Fatima Zahra', department: 'HR', priority: 'low' },
    { id: '4', title: 'Service Bulletin Compliance Log', type: 'REGULATORY', date: '2024-03-28', status: 'CRITICAL', iconName: 'ShieldCheck', size: '5.2 MB', author: 'Ing. Youssef Alaoui', department: 'Engineering', priority: 'critical' },
    { id: '5', title: 'Fuel Efficiency Analysis', type: 'OPERATIONAL', date: '2024-03-15', status: 'VERIFIED', iconName: 'Gauge', size: '3.1 MB', author: 'Capt. Samir Moussaoui', department: 'Operations', priority: 'high' },
];

const STATUS_STYLES = {
    CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', indicator: 'bg-red-500' },
    AUDITED: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', indicator: 'bg-blue-500' },
    VERIFIED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', indicator: 'bg-emerald-500' },
    PENDING: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', indicator: 'bg-slate-500' },
};

const PRIORITY_STYLES = {
    critical: { indicator: 'bg-red-500', border: 'border-red-500' },
    high: { indicator: 'bg-amber-500', border: 'border-amber-500' },
    medium: { indicator: 'bg-blue-500', border: 'border-blue-500' },
    low: { indicator: 'bg-emerald-500', border: 'border-emerald-500' },
};

const ICON_REGISTRY = {
    Activity, BarChart3, Clock, Wrench, AlertCircle, Users, ShieldCheck, Gauge, FileBarChart, TrendingUp,
};

const SEVERITY_COLORS = {
    CRITICAL: THEME.chart.primary[0],
    MAJOR: THEME.chart.primary[1],
    MINOR: THEME.chart.primary[2],
};

// ============================================================================
// SECTION 3: UTILITY FUNCTIONS (Pure Functions)
// ============================================================================

const formatNumber = (value, decimals = 0) => {
    if (isNaN(value)) return '0';
    return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatDate = (date, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', options);
};

const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

const getWeekKey = (date) => {
    const weekNum = Math.ceil(date.getDate() / 7);
    const month = date.toLocaleString('default', { month: 'short' });
    return `W${weekNum} ${month}`;
};

const calculateOTP = (flights) => {
    if (flights.length === 0) return 0;
    const arrived = flights.filter(f => f.status === 'ARRIVED');
    const onTime = arrived.filter(f => !f.delayMinutes || f.delayMinutes < 15);
    return Math.round((onTime.length / flights.length) * 100);
};

const calculateAverageDelay = (flights) => {
    const arrived = flights.filter(f => f.status === 'ARRIVED');
    if (arrived.length === 0) return 0;
    return Math.round(arrived.reduce((acc, f) => acc + (f.delayMinutes || 0), 0) / arrived.length);
};

const calculateMaintenanceCompletion = (maintenance) => {
    if (maintenance.length === 0) return 0;
    return Math.round((maintenance.filter(m => m.status === 'COMPLETED').length / maintenance.length) * 100);
};

const calculateOpenDefects = (defects) => defects.filter(d => d.status === 'OPEN' || d.status === 'IN_PROGRESS').length;

const calculateSeverityDistribution = (defects) => {
    const severityCount = new Map();
    defects.forEach(d => severityCount.set(d.severity, (severityCount.get(d.severity) || 0) + 1));
    const total = defects.length;
    return ['CRITICAL', 'MAJOR', 'MINOR']
        .filter(s => severityCount.has(s))
        .map(severity => ({
            severity,
            count: severityCount.get(severity) || 0,
            percentage: total > 0 ? Math.round(((severityCount.get(severity) || 0) / total) * 100) : 0,
            color: SEVERITY_COLORS[severity] || THEME.neutral[400],
        }));
};

const aggregateReliabilityByWeek = (flights) => {
    const weeklyData = new Map();
    flights.forEach(flight => {
        const date = new Date(flight.scheduledDeparture || flight.scheduledArrival);
        if (isNaN(date.getTime())) return;
        const weekKey = getWeekKey(date);
        const current = weeklyData.get(weekKey) || { total: 0, onTime: 0 };
        current.total++;
        if (flight.status === 'ARRIVED' && (!flight.delayMinutes || flight.delayMinutes < 15)) current.onTime++;
        weeklyData.set(weekKey, current);
    });
    return Array.from(weeklyData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, data]) => ({
            period,
            onTimePercentage: data.total > 0 ? Math.round((data.onTime / data.total) * 100) : 0,
            totalFlights: data.total,
            onTimeFlights: data.onTime,
        }));
};

const calculateProgress = (kpiId, value) => {
    const configs = {
        otp: { target: THRESHOLDS.otp.target },
        delay: { target: THRESHOLDS.delay.target, invert: true },
        maintenance: { target: THRESHOLDS.maintenance.target },
        backlog: { target: THRESHOLDS.backlog.target, invert: true },
    };
    const config = configs[kpiId];
    if (!config) return 0;
    if (config.invert) return Math.max(0, 100 - (value / config.target) * 100);
    return Math.min(100, (value / config.target) * 100);
};

const generateKPIs = (flights, defects, maintenance) => {
    const otp = calculateOTP(flights);
    const avgDelay = calculateAverageDelay(flights);
    const maintComp = calculateMaintenanceCompletion(maintenance);
    const openDefects = calculateOpenDefects(defects);
    return [
        { id: 'otp', label: 'Network OTP', displayValue: `${otp}%`, numericValue: otp, suffix: '%', subtitle: 'Target: 85%', iconName: 'Activity', color: 'text-blue-600', backgroundColor: 'bg-blue-50', trend: { value: '+1.2%', direction: 'up', isPositive: true }, progress: calculateProgress('otp', otp), target: 85 },
        { id: 'delay', label: 'Avg Ground Delay', displayValue: `${avgDelay}m`, numericValue: avgDelay, suffix: 'm', subtitle: 'Per Movement', iconName: 'Clock', color: 'text-red-600', backgroundColor: 'bg-red-50', trend: { value: '-4m', direction: 'down', isPositive: true }, progress: calculateProgress('delay', avgDelay), target: 15 },
        { id: 'maintenance', label: 'Check Efficiency', displayValue: `${maintComp}%`, numericValue: maintComp, suffix: '%', subtitle: 'Release Rate', iconName: 'Wrench', color: 'text-amber-600', backgroundColor: 'bg-amber-50', trend: { value: 'Stable', direction: 'neutral', isPositive: true }, progress: calculateProgress('maintenance', maintComp), target: 95 },
        { id: 'backlog', label: 'Registry Backlog', displayValue: String(openDefects), numericValue: openDefects, suffix: '', subtitle: 'Unresolved', iconName: 'AlertCircle', color: 'text-emerald-600', backgroundColor: 'bg-emerald-50', trend: { value: '-2', direction: 'down', isPositive: true }, progress: calculateProgress('backlog', openDefects), target: 5 },
    ];
};

// ============================================================================
// SECTION 4: SHARED HOOKS
// ============================================================================

const useIntersectionObserver = (options = {}) => {
    const { threshold = 0.5, triggerOnce = true } = options;
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const elementRef = useRef(null);
    const observerRef = useRef(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || (triggerOnce && hasTriggered)) return;
        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    if (triggerOnce) { setHasTriggered(true); observerRef.current?.disconnect(); }
                }
            },
            { threshold }
        );
        observerRef.current.observe(element);
        return () => observerRef.current?.disconnect();
    }, [threshold, triggerOnce, hasTriggered]);

    return { ref: elementRef, isIntersecting, hasTriggered };
};

const useContainerSize = () => {
    const ref = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const rafRef = useRef(null);

    const updateSize = useCallback(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setSize({ width: Math.max(rect.width, 0), height: Math.max(rect.height, 0) });
    }, []);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        updateSize();
        const handleResize = () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(updateSize); };
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setSize({ width: Math.max(width, 0), height: Math.max(height, 0) });
            }
        });
        observer.observe(element);
        window.addEventListener('resize', handleResize);
        document.fonts?.ready?.then(updateSize);
        return () => { observer.disconnect(); window.removeEventListener('resize', handleResize); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [updateSize]);

    return { ref, ...size };
};

// ============================================================================
// SECTION 5: SHARED COMPONENTS
// ============================================================================

const Skeleton = memo(({ width = '100%', height = '1rem', className = '', radius = '0.75rem' }) => {
    const w = typeof width === 'number' ? `${width}px` : width;
    const h = typeof height === 'number' ? `${height}px` : height;
    return <div className={`bg-slate-200 animate-pulse ${className}`} style={{ width: w, height: h, borderRadius: radius }} aria-hidden="true" role="presentation" />;
});
Skeleton.displayName = 'Skeleton';

const AnimatedCounter = memo(({ value, duration = 2000, prefix = '', suffix = '', decimals = 0 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const rafRef = useRef(null);
    const startTimeRef = useRef(0);
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0 : value;
    const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.3, triggerOnce: true });

    const animate = useCallback(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(numericValue * easeOut);
        if (progress < 1) { rafRef.current = requestAnimationFrame(animate); }
        else { setDisplayValue(numericValue); setHasAnimated(true); }
    }, [numericValue, duration]);

    useEffect(() => {
        if (isIntersecting && !hasAnimated) {
            startTimeRef.current = Date.now();
            rafRef.current = requestAnimationFrame(animate);
        }
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [isIntersecting, hasAnimated, animate]);

    useEffect(() => {
        if (hasAnimated && Math.abs(displayValue - numericValue) > 0.01) {
            setHasAnimated(false); startTimeRef.current = Date.now(); rafRef.current = requestAnimationFrame(animate);
        }
    }, [numericValue]);

    return <span ref={ref}>{prefix}{formatNumber(displayValue, decimals)}{suffix}</span>;
});
AnimatedCounter.displayName = 'AnimatedCounter';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error('ErrorBoundary:', error, errorInfo); }
    handleReset = () => this.setState({ hasError: false, error: null });
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Something Went Wrong</h3>
                    <p className="text-sm text-slate-500 mb-6 text-center max-w-md">{this.state.error?.message || 'An unexpected error occurred.'}</p>
                    <button onClick={this.handleReset} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-red-600 transition-colors">
                        <RefreshCw size={16} /> Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ============================================================================
// SECTION 6: STATE MANAGEMENT (useReducer)
// ============================================================================

const initialState = {
    flights: [], defects: [], maintenance: [],
    isLoading: true, isRefreshing: false, error: null,
    lastUpdated: null, connectionStatus: 'ONLINE',
};

const dashboardReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_START': return { ...state, isLoading: true, error: null };
        case 'FETCH_SUCCESS': return { ...state, flights: action.payload.flights, defects: action.payload.defects, maintenance: action.payload.maintenance, isLoading: false, isRefreshing: false, lastUpdated: new Date(), connectionStatus: 'ONLINE' };
        case 'FETCH_ERROR': return { ...state, isLoading: false, isRefreshing: false, error: action.payload, connectionStatus: 'ERROR' };
        case 'REFRESH_START': return { ...state, isRefreshing: true };
        case 'REFRESH_SUCCESS': return { ...state, flights: action.payload.flights, defects: action.payload.defects, maintenance: action.payload.maintenance, isRefreshing: false, lastUpdated: new Date(), connectionStatus: 'ONLINE' };
        case 'CLEAR_ERROR': return { ...state, error: null };
        case 'SET_CONNECTION_STATUS': return { ...state, connectionStatus: action.payload };
        default: return state;
    }
};

const useDashboardData = () => {
    const [state, dispatch] = useReducer(dashboardReducer, initialState);
    const intervalRef = useRef(null);

    const fetchData = useCallback(async (isRefresh = false) => {
        dispatch({ type: isRefresh ? 'REFRESH_START' : 'FETCH_START' });
        try {
            const [flightsRes, defectsRes, maintRes] = await Promise.all([
                flightAPI.getAll(), defectAPI.getAll(), maintenanceAPI.getAll(),
            ]);
            const payload = { flights: flightsRes.data || [], defects: defectsRes.data || [], maintenance: maintRes.data || [] };
            dispatch({ type: isRefresh ? 'REFRESH_SUCCESS' : 'FETCH_SUCCESS', payload });
        } catch (err) {
            const error = { code: 'FETCH_ERROR', message: err instanceof Error ? err.message : 'Unknown error', timestamp: new Date(), context: 'Dashboard data fetch' };
            logApiError('ManagerReports Data Fetch', err);
            dispatch({ type: 'FETCH_ERROR', payload: error });
        }
    }, []);

    const refresh = useCallback(() => fetchData(true), [fetchData]);
    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

    useEffect(() => {
        fetchData();
        intervalRef.current = setInterval(() => fetchData(true), API_CONFIG.refreshInterval);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [fetchData]);

    return { ...state, refresh, clearError };
};

// ============================================================================
// SECTION 7: MODULE COMPONENTS
// ============================================================================

const StatusBar = memo(({ connectionStatus, lastUpdated, isRefreshing, onRefresh }) => {
    const statusConfig = {
        ONLINE: { color: 'bg-emerald-500', label: 'Online', textColor: 'text-emerald-600' },
        SYNCING: { color: 'bg-amber-400', label: 'Syncing...', textColor: 'text-amber-600' },
        OFFLINE: { color: 'bg-slate-400', label: 'Offline', textColor: 'text-slate-500' },
        ERROR: { color: 'bg-red-500', label: 'Error', textColor: 'text-red-600' },
    };
    const current = statusConfig[connectionStatus];
    return (
        <div className="flex items-center justify-between mb-8 p-4 bg-white/60 backdrop-blur rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${current.color} ${connectionStatus === 'SYNCING' ? 'animate-pulse' : ''}`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${current.textColor}`}>{current.label}</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lastUpdated ? `Updated: ${formatTime(lastUpdated)}` : 'Never updated'}</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onRefresh} disabled={isRefreshing} className={`p-2.5 rounded-xl border transition-all ${isRefreshing ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-400 hover:text-red-600'}`} aria-label="Refresh data"><RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} /></button>
                <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 transition-all" aria-label="Notifications"><Bell size={16} /></button>
                <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 transition-all" aria-label="Settings"><Settings size={16} /></button>
            </div>
        </div>
    );
});
StatusBar.displayName = 'StatusBar';

const KPICard = memo(({ kpi, isLoading, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    if (isLoading) return (
        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
            <div className="flex justify-between items-start mb-4"><Skeleton width="50%" height={12} /><Skeleton width={48} height={48} radius="1rem" /></div>
            <Skeleton width="60%" height={40} className="mb-2" /><Skeleton width="80%" height={10} />
        </div>
    );
    const Icon = ICON_REGISTRY[kpi.iconName] || Activity;
    const TrendIcon = kpi.trend.direction === 'up' ? TrendingUp : kpi.trend.direction === 'down' ? TrendingDown : Minus;
    const trendColor = kpi.trend.isPositive ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200';
    const progressColor = kpi.color.replace('text-', 'bg-').replace('600', '500');
    return (
        <div className="relative bg-white border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden group"
             onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={() => onClick?.(kpi)}
             role="button" tabIndex={0} aria-label={`${kpi.label}: ${kpi.displayValue}`}>
            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-red-500/5 rounded-full blur-3xl transition-all duration-700 ${isHovered ? 'opacity-100 scale-150' : 'opacity-0'}`} />
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${kpi.id === 'otp' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{kpi.label}</p>
                    </div>
                    <div className={`p-3 rounded-2xl transition-all duration-500 ${kpi.backgroundColor} ${kpi.color} group-hover:scale-110`}><Icon size={24} strokeWidth={2} /></div>
                </div>
                <p className="text-5xl font-black text-slate-900 tabular-nums tracking-tighter mb-2">
                    <AnimatedCounter value={kpi.numericValue} suffix={kpi.suffix} />
                </p>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.subtitle}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black border ${trendColor}`}><TrendIcon size={12} /> {kpi.trend.value}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor}`} style={{ width: `${kpi.progress}%` }} role="progressbar" aria-valuenow={kpi.progress} aria-valuemin={0} aria-valuemax={100} />
                </div>
            </div>
        </div>
    );
});
KPICard.displayName = 'KPICard';

const ReliabilityChart = memo(({ data, isLoading }) => {
    const { ref, width, height } = useContainerSize();
    const [activeIndex, setActiveIndex] = useState(null);
    if (isLoading) return <div className="h-[400px] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-red-600" /></div>;
    if (data.length === 0) return (
        <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Plane className="w-16 h-16 text-slate-300 mb-4" /><p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Flight Data</p>
        </div>
    );
    const avgValue = Math.round(data.reduce((a, b) => a + b.onTimePercentage, 0) / data.length);
    const minValue = Math.min(...data.map(d => d.onTimePercentage));
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100"><TrendingUp size={14} className="text-emerald-600" /><span className="text-xs font-bold text-emerald-700">Avg: {avgValue}%</span></div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-100"><Activity size={14} className="text-blue-600" /><span className="text-xs font-bold text-blue-700">Live</span></div>
            </div>
            <div ref={ref} className="w-full" style={{ height: '400px' }}>
                {width > 0 && height > 0 ? (
                    <ResponsiveContainer width={width} height={height}>
                        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} onMouseMove={(e) => setActiveIndex(e?.activeTooltipIndex ?? null)} onMouseLeave={() => setActiveIndex(null)}>
                            <defs>
                                <linearGradient id="colorOtp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} /><stop offset="95%" stopColor="#DC2626" stopOpacity={0} /></linearGradient>
                                <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }} domain={[Math.max(0, minValue - 10), 100]} tickFormatter={(v) => `${v}%`} dx={-10} />
                            <ReferenceLine y={85} stroke="#10B981" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'Target 85%', position: 'right', fill: '#10B981', fontSize: 10, fontWeight: 700 }} />
                            <Tooltip cursor={{ stroke: '#DC2626', strokeWidth: 2, strokeDasharray: '5 5' }} content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const item = payload[0].payload;
                                return <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[180px]"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.period}</p><p className="text-3xl font-black text-slate-900 mb-1">{item.onTimePercentage}%</p><p className="text-xs text-slate-500">{item.onTimeFlights} / {item.totalFlights} flights</p></div>;
                            }} />
                            <Area type="monotone" dataKey="onTimePercentage" stroke="#DC2626" strokeWidth={3} fill="url(#colorOtp)" animationDuration={2000} dot={(props) => {
                                const { cx, cy, index } = props; const isActive = activeIndex === index;
                                return <g key={`dot-${index}`}>{isActive && <circle cx={cx} cy={cy} r={10} fill="#DC2626" opacity={0.2}><animate attributeName="r" from="8" to="14" dur="1s" repeatCount="indefinite" /><animate attributeName="opacity" from="0.2" to="0" dur="1s" repeatCount="indefinite" /></circle>}<circle cx={cx} cy={cy} r={isActive ? 6 : 4} fill="#DC2626" stroke="white" strokeWidth={2} style={{ filter: isActive ? 'url(#glow)' : 'none' }} /></g>;
                            }} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>}
            </div>
        </div>
    );
});
ReliabilityChart.displayName = 'ReliabilityChart';

const SeverityChart = memo(({ data, isLoading }) => {
    const { ref, width, height } = useContainerSize();
    const [activeIndex, setActiveIndex] = useState(null);
    if (isLoading) return <div className="h-[350px] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-white/50" /></div>;
    if (data.length === 0) return <div className="h-[350px] flex items-center justify-center bg-white/5 rounded-3xl border-2 border-dashed border-white/10"><p className="text-sm font-bold text-white/30 uppercase tracking-widest">No Defect Data</p></div>;
    const total = data.reduce((a, b) => a + b.count, 0);
    return (
        <div className="space-y-6">
            <div ref={ref} className="w-full" style={{ height: '300px' }}>
                {width > 0 && height > 0 ? (
                    <ResponsiveContainer width={width} height={height}>
                        <RePieChart>
                            <Pie data={data} innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="count" nameKey="severity" labelLine={false} label={({ percentage, x, y }) => percentage > 5 ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-black">{percentage}%</text> : null} animationDuration={1500} onMouseEnter={(_, index) => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)}>
                                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" opacity={activeIndex === null || activeIndex === index ? 1 : 0.3} style={{ transition: 'all 0.3s ease', transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'center' }} />)}
                            </Pie>
                            <Tooltip content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const item = payload[0].payload;
                                return <div className="bg-slate-900 p-4 rounded-xl shadow-xl border border-slate-700"><p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">{item.severity}</p><p className="text-xl font-black text-white">{item.count} ({item.percentage}%)</p></div>;
                            }} />
                        </RePieChart>
                    </ResponsiveContainer>
                ) : <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white/30" /></div>}
            </div>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={item.severity} className="group cursor-pointer" onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}40` }} /><span className="text-xs font-bold text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">{item.severity}</span></div>
                            <div className="flex items-center gap-3"><span className="text-lg font-black text-white">{item.count}</span><span className="text-xs text-white/30">{item.percentage}%</span></div>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.percentage}%`, backgroundColor: item.color, opacity: activeIndex === null || activeIndex === index ? 1 : 0.3 }} /></div>
                    </div>
                ))}
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between"><span className="text-xs text-white/40 uppercase tracking-widest font-bold">Total Defects</span><span className="text-2xl font-black text-white">{total}</span></div>
        </div>
    );
});
SeverityChart.displayName = 'SeverityChart';

const ReportsArchive = memo(({ reports = MOCK_REPORTS, isLoading, onReportSelect }) => {
    const [expandedId, setExpandedId] = useState(null);
    const handleToggle = useCallback((id) => {
        setExpandedId(prev => { const next = prev === id ? null : id; if (next) onReportSelect?.(reports.find(r => r.id === next)); return next; });
    }, [reports, onReportSelect]);

    if (isLoading) return (
        <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl"><div className="flex items-center gap-6"><Skeleton width={56} height={56} radius="1rem" /><div className="flex-1 space-y-3"><Skeleton width="40%" height={20} /><Skeleton width="25%" height={12} /></div><Skeleton width={100} height={32} radius="0.75rem" /></div></div>)}
        </div>
    );

    return (
        <div className="divide-y divide-slate-100/50">
            {reports.map(report => {
                const Icon = ICON_REGISTRY[report.iconName] || Activity;
                const isExpanded = expandedId === report.id;
                const statusStyle = STATUS_STYLES[report.status] || STATUS_STYLES.PENDING;
                const priorityStyle = PRIORITY_STYLES[report.priority] || PRIORITY_STYLES.low;
                const formattedDate = formatDate(report.date);
                return (
                    <div key={report.id} className="group relative">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-sm ${priorityStyle.indicator}`} />
                        <div className={`p-6 hover:bg-slate-50/80 transition-all cursor-pointer ${isExpanded ? 'bg-slate-50/80' : ''}`} onClick={() => handleToggle(report.id)} role="button" aria-expanded={isExpanded} tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleToggle(report.id)}>
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? 'bg-red-600 text-white shadow-lg shadow-red-500/25' : 'bg-slate-100 text-slate-400 group-hover:bg-red-600 group-hover:text-white'}`}><Icon size={24} strokeWidth={2} /></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className={`text-base font-black uppercase tracking-tight truncate transition-colors ${isExpanded ? 'text-red-600' : 'text-slate-900 group-hover:text-red-600'}`}>{report.title}</h4>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>{report.status}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><Layers size={10} />{report.type}</span><span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className="flex items-center gap-1.5"><Calendar size={10} />{formattedDate}</span><span className="w-1 h-1 rounded-full bg-slate-300" /><span>{report.size}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 transition-all" onClick={e => e.stopPropagation()} aria-label="Preview report"><Eye size={16} /></button>
                                    <button className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-red-600 transition-all" onClick={e => e.stopPropagation()} aria-label="Download report"><Download size={16} /></button>
                                </div>
                                <ChevronRight size={20} className={`text-slate-300 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90 text-red-600' : ''}`} />
                            </div>
                            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                <div className="pl-20 flex items-center gap-8 text-xs text-slate-500">
                                    <span className="flex items-center gap-2"><Users size={14} className="text-slate-400" />{report.author}</span>
                                    <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" />{report.department}</span>
                                    <span className="flex items-center gap-2"><FileBarChart size={14} className="text-slate-400" />PDF • {report.size}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});
ReportsArchive.displayName = 'ReportsArchive';

// ============================================================================
// SECTION 8: MAIN COMPONENT
// ============================================================================

const LoadingFallback = () => <div className="h-16 w-32 bg-slate-200 animate-pulse rounded-xl" />;

const ManagerReports = () => {
    const { flights, defects, maintenance, isLoading, isRefreshing, error, lastUpdated, connectionStatus, refresh } = useDashboardData();

    const kpis = useMemo(() => generateKPIs(flights, defects, maintenance), [flights, defects, maintenance]);
    const reliabilityData = useMemo(() => aggregateReliabilityByWeek(flights), [flights]);
    const severityData = useMemo(() => calculateSeverityDistribution(defects), [defects]);

    const handleKpiClick = useCallback((kpi) => { console.log('KPI clicked:', kpi.id); }, []);
    const handleReportSelect = useCallback((report) => { console.log('Report selected:', report.id); }, []);

    if (isLoading && flights.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 lg:p-12 font-sans">
            <StatusBar connectionStatus={connectionStatus} lastUpdated={lastUpdated} isRefreshing={isRefreshing} onRefresh={refresh} />

            <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-200 pb-12">
                <div className="flex items-start gap-8">
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                        <Suspense fallback={<LoadingFallback />}><Logo className="h-16" /></Suspense>
                    </div>
                    <div className="h-16 w-px bg-slate-200 hidden lg:block" />
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-4 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl">Operational Intelligence</span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest"><History size={12} /> Archive Active</span>
                        </div>
                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">Performance <span className="text-red-600 italic">& KPIs</span></h1>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"><Filter size={14} /> Period</button>
                    <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 transition-all shadow-xl active:scale-95"><Download size={14} /> Export PDF</button>
                </div>
            </header>

            <ErrorBoundary>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {kpis.map(kpi => <KPICard key={kpi.id} kpi={kpi} isLoading={isLoading} onClick={handleKpiClick} />)}
                </div>
            </ErrorBoundary>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                <div className="xl:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-8 lg:p-10 shadow-sm">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/25"><BarChart3 size={24} className="text-white" /></div>
                            <div><h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Fleet Reliability Index</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Real-time Analysis</p></div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 transition-all" aria-label="Search"><Search size={18} /></button>
                            <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 transition-all" aria-label="Maximize"><Maximize2 size={18} /></button>
                            <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 transition-all" aria-label="Share"><Share2 size={18} /></button>
                        </div>
                    </div>
                    <ErrorBoundary><ReliabilityChart data={reliabilityData} isLoading={isLoading} /></ErrorBoundary>
                </div>

                <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur border border-white/10"><PieChart size={24} className="text-red-600" /></div>
                            <div><h3 className="text-2xl font-black text-white uppercase tracking-tight">Defect Criticality</h3><p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Severity Distribution</p></div>
                        </div>
                        <ErrorBoundary><SeverityChart data={severityData} isLoading={isLoading} /></ErrorBoundary>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="p-8 lg:p-10 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/25"><History size={24} className="text-white" /></div>
                            <div><h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Institutional Archive</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Compliance Documentation</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm"><ShieldCheck size={24} className="text-emerald-500" /></div>
                            <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 transition-all shadow-sm" aria-label="More options"><MoreHorizontal size={20} /></button>
                        </div>
                    </div>
                </div>
                <ErrorBoundary><ReportsArchive isLoading={isLoading} onReportSelect={handleReportSelect} /></ErrorBoundary>
            </div>

            <footer className="mt-16 pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <Suspense fallback={<LoadingFallback />}><Logo className="h-8 grayscale opacity-50" /></Suspense>
                    <div className="h-6 w-px bg-slate-200" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Global CAMO Reporting Network</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100"><Wifi size={14} className="text-emerald-500" /><span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Connected</span></div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200"><Lock size={14} className="text-slate-400" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tier 4</span></div>
                </div>
            </footer>
        </div>
    );
};

export default ManagerReports;