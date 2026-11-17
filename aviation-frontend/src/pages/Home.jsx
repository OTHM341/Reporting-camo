import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plane, ShieldCheck, Activity, ArrowRight, ClipboardCheck, Globe, Clock,
    ChevronRight, Server, Database, Lock, TrendingUp, TrendingDown, Minus,
    BarChart3, PieChart, Zap, Layers, Wrench, FileSearch, Radar, Gauge,
    CheckCircle2, AlertTriangle, Eye, Cpu, Radio, MapPin, Wind, Thermometer,
    ChevronDown, Play, X, Menu, ArrowUpRight, Sparkles, Satellite, Cable
} from 'lucide-react';
import Logo from '../components/UI/Logo';
import { aircraftAPI, maintenanceAPI } from '../services/api';

/* ================================================================
   DESIGN TOKENS & CONFIGURATION — LIGHT / CLEAN THEME
   ================================================================ */
const COLORS = {
    ramRed: '#C41E3A',
    ramRedLight: '#E63950',
    ramRedDark: '#9B1B30',
    primary: '#1E3A5F',
    primaryLight: '#2A4A73',
    primaryDark: '#152B47',
    surface: '#F8FAFC',
    surfaceAlt: '#F1F5F9',
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    white: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
};

/* ================================================================
   AVIATION IMAGES — REAL & VERIFIED IMAGES
   All images sourced from reliable aviation photography sources.
   ================================================================ */
const IMAGES = {
    // Hero - Commercial aircraft flying above clouds
    hero: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2500',

    // Cockpit - Aircraft instrument panel
    cockpit: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&q=80&w=2000',

    // Hangar - Aircraft in MRO maintenance hangar
    hangar: 'https://images.unsplash.com/photo-1524592714635-d77511a4834d?auto=format&fit=crop&q=80&w=2000',

    // Engine - Jet engine close-up in hangar
    engine: 'https://images.unsplash.com/photo-1524592714635-d77511a4834d?auto=format&fit=crop&q=80&w=2000',

    // Tarmac - Aircraft on airport tarmac
    tarmac: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2500',

    // Control - Operations control center / server room
    control: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000',

    // Wing - Airplane wing view from window
    wing: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80&w=2000',

    // Maintenance - Aviation mechanic working on engine
    maintenance: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=2000',

    // ram737 - Boeing 737 aircraft
    ram737: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=2000',

    // ram787 - Boeing 787 Dreamliner
    ram787: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&q=80&w=2000',

    // Operations Center - Technical operations control room
    operationsCenter: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000',

    // ATR 72-600 - Regional turboprop aircraft
    atr72: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&q=80&w=2000',

    // MRO Hangar Operations - Wide hangar bay with aircraft
    mroHangar: 'https://images.unsplash.com/photo-1524592714635-d77511a4834d?auto=format&fit=crop&q=80&w=2000',

    // Line Maintenance Station - Ground crew on tarmac
    lineMaintenance: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=2000',

    // Data-Driven Airworthiness - Analytics and data visualization
    dataDriven: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000',

    // Flight Deck Avionics - Modern cockpit instruments
    flightDeck: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&q=80&w=2000',
};

/* Fallback image color gradient for when images fail to load */
const IMAGE_FALLBACK = 'linear-gradient(135deg, #1E3A5F 0%, #2A4A73 50%, #1E3A5F 100%)';

/* ================================================================
   CUSTOM CSS ANIMATIONS (injected via style tag)
   ================================================================ */
const GlobalStyles = () => (
    <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeInLeft {
            from { opacity: 0; transform: translateX(-40px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
            from { opacity: 0; transform: translateX(40px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
            from { opacity: 0; max-height: 0; }
            to { opacity: 1; max-height: 500px; }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        @keyframes progressFill {
            from { width: 0; }
        }
        @keyframes barGrow {
            from { height: 0; }
        }
        @keyframes scrollBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(8px); }
        }
        @keyframes slideInNav {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
        }

        .animate-fade-in-up {
            animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            opacity: 0;
        }
        .animate-fade-in {
            animation: fadeIn 0.6s ease forwards;
            opacity: 0;
        }
        .animate-fade-in-left {
            animation: fadeInLeft 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            opacity: 0;
        }
        .animate-fade-in-right {
            animation: fadeInRight 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            opacity: 0;
        }
        .animate-scale-in {
            animation: scaleIn 0.6s ease forwards;
            opacity: 0;
        }
        .animate-slide-down {
            animation: slideDown 0.4s ease forwards;
            overflow: hidden;
        }
        .animate-pulse-slow {
            animation: pulse 3s ease-in-out infinite;
        }
        .animate-float {
            animation: float 4s ease-in-out infinite;
        }
        .animate-scroll-bounce {
            animation: scrollBounce 2s ease-in-out infinite;
        }
        .animate-nav-slide {
            animation: slideInNav 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }
        .delay-1000 { animation-delay: 1.0s; }
        .delay-1200 { animation-delay: 1.2s; }
        .delay-1500 { animation-delay: 1.5s; }

        .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.5s ease, background-color 0.5s ease;
        }
        .hover-lift:hover {
            transform: translateY(-8px);
        }
        .group:hover .group-hover-scale {
            transform: scale(1.1);
        }
        .group:hover .group-hover-text {
            color: #C41E3A;
        }
        .group:hover .group-hover-bg {
            background-color: #C41E3A;
            border-color: #C41E3A;
        }
        .group:hover .group-hover-icon {
            color: white;
        }

        .parallax-bg {
            will-change: transform;
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .glass-card:hover {
            border-color: rgba(196, 30, 58, 0.3);
            background: rgba(255, 255, 255, 0.85);
        }

        .glass-card-dark {
            background: rgba(30, 58, 95, 0.6);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-card-dark:hover {
            border-color: rgba(196, 30, 58, 0.4);
            background: rgba(30, 58, 95, 0.75);
        }

        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        /* Bar chart animation support */
        .bar-animate {
            transition: height 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .progress-animate {
            transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
    `}</style>
);

/* ================================================================
   INTERSECTION OBSERVER HOOK
   ================================================================ */
const useInView = (options = {}) => {
    const ref = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    if (options.once !== false) {
                        observer.disconnect();
                    }
                }
            },
            { threshold: options.threshold || 0.1, rootMargin: options.margin || '0px' }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return [ref, isInView];
};

/* ================================================================
   IMAGE COMPONENT WITH FALLBACK HANDLING
   ================================================================ */
const AviationImage = memo(({ src, alt, className = '', loading = 'lazy', style = {} }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`} style={style}>
            {/* Fallback gradient background - always visible behind image */}
            <div
                className="absolute inset-0 z-0"
                style={{ background: IMAGE_FALLBACK }}
            />
            {/* Actual image */}
            {!error && (
                <img
                    src={src}
                    alt={alt}
                    className={`relative z-10 w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                    loading={loading}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                />
            )}
            {/* Loading shimmer effect */}
            {!loaded && !error && (
                <div className="absolute inset-0 z-20 animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700" />
            )}
        </div>
    );
});

/* ================================================================
   UTILITY COMPONENTS
   ================================================================ */

const AnimatedCounter = memo(({ target, suffix = '', prefix = '', duration = 2 }) => {
    const [count, setCount] = useState(0);
    const [ref, isInView] = useInView({ once: true, margin: '-50px' });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const end = parseFloat(target);
        const isFloat = target.toString().includes('.');
        const increment = end / (duration * 60);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(isFloat ? parseFloat(start.toFixed(1)) : Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, target, duration]);

    return (
        <span ref={ref}>
            {prefix}{count}{suffix}
        </span>
    );
});

const GlassCard = memo(({ children, className = '', hover = true, delay = 0, dark = false }) => {
    const [ref, isInView] = useInView({ once: true, margin: '-50px' });
    const delayClass = delay === 0 ? '' : delay === 0.1 ? 'delay-100' : delay === 0.2 ? 'delay-200' : delay === 0.3 ? 'delay-300' : 'delay-400';
    const cardClass = dark ? 'glass-card-dark' : 'glass-card';

    return (
        <div
            ref={ref}
            className={`
                relative overflow-hidden rounded-3xl
                ${cardClass}
                ${hover ? 'hover-lift' : ''}
                ${isInView ? 'animate-fade-in-up' : 'opacity-0'}
                ${delayClass}
                ${className}
            `}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
            {children}
        </div>
    );
});

const SectionHeading = memo(({ eyebrow, title, subtitle, align = 'left', light = false }) => {
    const [ref, isInView] = useInView({ once: true });
    const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';
    const textColor = light ? 'text-white' : 'text-slate-900';
    const subColor = light ? 'text-white/60' : 'text-slate-500';

    return (
        <div
            ref={ref}
            className={`flex flex-col gap-4 mb-16 max-w-3xl ${alignClass} ${isInView ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
            {eyebrow && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ram-red/10 border border-ram-red/20 w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-ram-red" />
                    <span className="text-[11px] font-bold text-ram-red uppercase tracking-[0.25em]">{eyebrow}</span>
                </div>
            )}
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black ${textColor} tracking-tight leading-[1.1]`}>
                {title}
            </h2>
            {subtitle && (
                <p className={`text-lg md:text-xl ${subColor} font-medium leading-relaxed max-w-2xl`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
});

const TrendBadge = memo(({ value, type = 'up' }) => {
    const colors = {
        up: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        down: 'text-rose-600 bg-rose-50 border-rose-200',
        neutral: 'text-slate-500 bg-slate-50 border-slate-200',
    };
    const icons = {
        up: <TrendingUp className="w-3 h-3" />,
        down: <TrendingDown className="w-3 h-3" />,
        neutral: <Minus className="w-3 h-3" />,
    };

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[type]}`}>
            {icons[type]}
            {value}
        </span>
    );
});

/* ================================================================
   NAVIGATION
   ================================================================ */

const Navbar = memo(({ navigate }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Platform', href: '#platform' },
        { label: 'Fleet', href: '#fleet' },
        { label: 'Operations', href: '#operations' },
        { label: 'Analytics', href: '#analytics' },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] animate-nav-slide transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}>
            <div className="max-w-7xl mx-auto px-6">
                <div
                    className={`
                        flex items-center justify-between px-6 md:px-10 py-4 rounded-[2rem]
                        transition-all duration-500 border
                        ${scrolled
                        ? 'bg-white/90 backdrop-blur-2xl border-slate-200 shadow-xl shadow-slate-200/30'
                        : 'bg-white/70 backdrop-blur-xl border-white/50'
                    }
                    `}
                >
                    <div className="flex items-center gap-6">
                        <div className="transition-transform hover:scale-105 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <Logo className="h-10 md:h-12" />
                        </div>
                        <div className="hidden lg:flex flex-col border-l border-slate-200 pl-6">
                            <span className="font-black text-lg tracking-tighter text-slate-900 leading-none">ROYAL AIR MAROC</span>
                            <span className="text-[10px] font-bold text-ram-red tracking-[0.3em] uppercase mt-0.5">Technical Division</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-xs font-bold text-slate-500 hover:text-ram-red transition-colors uppercase tracking-widest"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden sm:block text-xs font-black text-slate-500 hover:text-ram-red transition-all uppercase tracking-widest"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-ram-red text-white text-[10px] font-black rounded-2xl hover:bg-ram-red-dark transition-all shadow-lg shadow-ram-red/20 active:scale-95 uppercase tracking-[0.2em]"
                        >
                            Access Platform
                        </button>
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 text-slate-500 hover:text-ram-red"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="md:hidden mt-2 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl overflow-hidden animate-slide-down shadow-xl">
                        <div className="p-6 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="text-sm font-bold text-slate-500 hover:text-ram-red transition-colors uppercase tracking-widest py-2"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <button
                                onClick={() => { setMobileOpen(false); navigate('/login'); }}
                                className="text-sm font-bold text-slate-500 hover:text-ram-red transition-colors uppercase tracking-widest py-2 text-left"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
});

/* ================================================================
   HERO SECTION — CLEAN / LIGHT OVERLAY
   ================================================================ */

const HeroSection = memo(({ navigate }) => {
    const heroRef = useRef(null);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                setScrollY(window.scrollY);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const parallaxOffset = scrollY * 0.3;
    const opacity = Math.max(0, 1 - scrollY / 600);
    const scale = 1 + scrollY * 0.00015;

    const floatingElements = [
        { icon: Radar, label: 'ADS-B', x: '15%', y: '20%', delay: 'delay-1000' },
        { icon: Satellite, label: 'ACARS', x: '75%', y: '15%', delay: 'delay-1200' },
        { icon: Wind, label: 'WX RADAR', x: '80%', y: '60%', delay: 'delay-1500' },
        { icon: Cpu, label: 'FMS', x: '10%', y: '65%', delay: 'delay-1500' },
    ];

    return (
        <section ref={heroRef} className="relative min-h-[110vh] flex items-center overflow-hidden">
            {/* Background Layers — lighter overlay */}
            <div className="absolute inset-0 z-0" style={{ transform: `scale(${scale})` }}>
                <div className="absolute inset-0 bg-gradient-to-b from-[#1E3A5F]/60 via-[#1E3A5F]/30 to-[#1E3A5F]/80 z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A5F]/50 via-transparent to-[#1E3A5F]/50 z-10" />
                <AviationImage
                    src={IMAGES.hero}
                    alt="Aircraft in flight"
                    className="w-full h-full"
                    loading="eager"
                />
            </div>

            {/* Animated Orbs — lighter, blue-tinted */}
            <div
                className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-[150px] pointer-events-none animate-pulse-slow"
                style={{ transform: `translateY(${parallaxOffset}px)` }}
            />
            <div
                className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-ram-red/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"
                style={{ transform: `translateY(${parallaxOffset * 0.5}px)`, animationDelay: '1.5s' }}
            />

            {/* Floating Aviation Elements */}
            {floatingElements.map((el, i) => (
                <div
                    key={i}
                    className={`absolute z-20 hidden lg:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full animate-fade-in ${el.delay}`}
                    style={{ left: el.x, top: el.y }}
                >
                    <el.icon className="w-3.5 h-3.5 text-ram-red" />
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">{el.label}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
            ))}

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-20 w-full pt-24" style={{ opacity }}>
                <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/15 backdrop-blur-md border border-white/25 rounded-full mb-10 animate-fade-in-up delay-200">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <ShieldCheck className="w-4 h-4 text-white" />
                        <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">
                            Institutional CAMO & MRO Intelligence
                        </span>
                    </div>

                    <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white leading-[0.85] mb-10 tracking-tight animate-fade-in-up delay-400">
                        PRECISION
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-ram-red-light">
                            OPERATIONS.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl lg:text-2xl text-white/70 mb-14 max-w-2xl font-medium leading-relaxed animate-fade-in-up delay-600">
                        A centralized intelligence layer for Royal Air Maroc's Continuing Airworthiness
                        Management Organization. Engineered for uncompromising safety, regulatory compliance,
                        and operational excellence across the entire fleet lifecycle.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 items-start animate-fade-in-up delay-800">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="group flex items-center justify-center gap-4 px-10 py-5 bg-white text-ram-red font-black text-sm rounded-[2rem] hover:bg-ram-red hover:text-white transition-all duration-300 shadow-2xl shadow-black/20 uppercase tracking-widest"
                        >
                            Enter Operations Center
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </button>

                        <button
                            onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group flex items-center gap-4 px-8 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-sm rounded-[2rem] hover:bg-white/20 transition-all uppercase tracking-widest"
                        >
                            <Play className="w-4 h-4 text-white" />
                            Explore Platform
                        </button>
                    </div>

                    {/* Live Status Strip */}
                    <div className="mt-20 flex flex-wrap items-center gap-8 animate-fade-in delay-1500">
                        {[
                            { label: 'System Status', value: 'OPERATIONAL', color: '#10B981' },
                            { label: 'Last Sync', value: 'LIVE', color: '#FFFFFF' },
                            { label: 'Security', value: 'AES-256', color: '#60A5FA' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{item.label}</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: item.color }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-fade-in delay-1500">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Scroll</span>
                <div className="animate-scroll-bounce">
                    <ChevronDown className="w-4 h-4 text-white/40" />
                </div>
            </div>
        </section>
    );
});

/* ================================================================
   LIVE STATISTICS SECTION — LIGHT CARDS
   ================================================================ */

const StatsSection = memo(({ stats }) => {
    const statsConfig = [
        {
            label: 'Fleet Assets',
            value: stats.aircraft,
            suffix: '',
            icon: Plane,
            trend: '+12%',
            trendType: 'up',
            detail: 'Active aircraft across all bases',
            color: 'from-ram-red/20 to-transparent',
        },
        {
            label: 'Dispatch Reliability',
            value: stats.reliability,
            suffix: '',
            prefix: '',
            icon: Activity,
            trend: '+0.3%',
            trendType: 'up',
            detail: '30-day rolling average',
            color: 'from-emerald-500/10 to-transparent',
        },
        {
            label: 'Active MRO Cycles',
            value: stats.maintenance,
            suffix: '',
            icon: Wrench,
            trend: '-2',
            trendType: 'down',
            detail: 'In-progress maintenance events',
            color: 'from-blue-500/10 to-transparent',
        },
        {
            label: 'Platform Uptime',
            value: stats.uptime,
            suffix: '',
            icon: Globe,
            trend: '0.00%',
            trendType: 'neutral',
            detail: 'High-availability cluster SLA',
            color: 'from-amber-500/10 to-transparent',
        },
    ];

    return (
        <section className="relative z-30 -mt-32 px-6 md:px-10 pb-24">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsConfig.map((stat, i) => (
                    <GlassCard key={i} delay={i * 0.1} className="p-8 md:p-10 shadow-xl shadow-slate-200/50">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.color} rounded-full blur-2xl`} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <stat.icon className="w-6 h-6 text-ram-red" />
                                </div>
                                <TrendBadge value={stat.trend} type={stat.trendType} />
                            </div>
                            <p className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">
                                {typeof stat.value === 'number' ? (
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                ) : (
                                    stat.value
                                )}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                            <p className="text-xs text-slate-400 font-medium">{stat.detail}</p>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </section>
    );
});

/* ================================================================
   FLEET GALLERY SECTION
   ================================================================ */

const FleetGallery = memo(() => {
    const fleetData = [
        {
            type: 'Boeing 787-9 Dreamliner',
            count: 8,
            role: 'Long-Haul Flagship',
            image: IMAGES.ram787,
            specs: { range: '13,950 km', pax: '302', engines: 'GEnx-1B' },
        },
        {
            type: 'Boeing 737 MAX 8',
            count: 18,
            role: 'Short & Medium Haul',
            image: IMAGES.ram737,
            specs: { range: '6,570 km', pax: '156', engines: 'CFM LEAP-1B' },
        },
        {
            type: 'Boeing 737-800',
            count: 30,
            role: 'Core Network',
            image: IMAGES.wing,
            specs: { range: '5,765 km', pax: '159', engines: 'CFM56-7B' },
        },
        {
            type: 'ATR 72-600',
            count: 8,
            role: 'Regional Connectivity',
            image: IMAGES.atr72,
            specs: { range: '1,528 km', pax: '70', engines: 'PW127M' },
        },
    ];

    return (
        <section id="fleet" className="py-32 px-6 md:px-10 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <SectionHeading
                    eyebrow="Fleet Intelligence"
                    title="Modern Fleet Architecture"
                    subtitle="A diversified, fuel-efficient fleet optimized for Royal Air Maroc's network spanning Africa, Europe, and the Americas."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fleetData.map((aircraft, i) => (
                        <div
                            key={i}
                            className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white cursor-pointer animate-fade-in-up shadow-lg shadow-slate-200/50"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        >
                            <div className="relative h-72 md:h-80 overflow-hidden bg-slate-100">
                                <AviationImage
                                    src={aircraft.image}
                                    alt={aircraft.type}
                                    className="w-full h-full"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-30 pointer-events-none" />
                                <div className="absolute top-6 left-6 z-30">
                                    <span className="px-4 py-1.5 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {aircraft.count} In Service
                                    </span>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{aircraft.type}</h3>
                                        <p className="text-sm text-slate-500 font-medium">{aircraft.role}</p>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover-text transition-colors" />
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                                    {Object.entries(aircraft.specs).map(([key, value]) => (
                                        <div key={key}>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{key}</p>
                                            <p className="text-sm font-black text-slate-700">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});

/* ================================================================
   DASHBOARD PREVIEW SECTION — CLEAN LIGHT THEME
   ================================================================ */

const DashboardPreview = memo(() => {
    const kpiData = [
        { label: 'AOG Events', value: '9', target: '0', status: 'good', icon: AlertTriangle },
        { label: 'Deferred Items', value: '12', target: '<20', status: 'good', icon: ClipboardCheck },
        { label: 'Check Due (C)', value: '3', target: '5', status: 'warning', icon: Clock },
        { label: 'Reliability Rate', value: '99.8%', target: '99.5%', status: 'good', icon: Gauge },
    ];

    // Semaines d'Avril, Mai et Juin
    const chartBars = [
        // Avril
        { label: 'S14', value: 78, color: 'bg-ram-red', month: 'Avril' },
        { label: 'S15', value: 82, color: 'bg-ram-red', month: 'Avril' },
        { label: 'S16', value: 95, color: 'bg-emerald-500', month: 'Avril' },
        { label: 'S17', value: 88, color: 'bg-ram-red', month: 'Avril' },
        { label: 'S18', value: 92, color: 'bg-emerald-500', month: 'Avril' },
        // Mai
        { label: 'S19', value: 96, color: 'bg-emerald-500', month: 'Mai' },
        { label: 'S20', value: 94, color: 'bg-emerald-500', month: 'Mai' },
        { label: 'S21', value: 89, color: 'bg-ram-red', month: 'Mai' },
        { label: 'S22', value: 91, color: 'bg-emerald-500', month: 'Mai' },
        { label: 'S23', value: 97, color: 'bg-emerald-500', month: 'Mai' },
        // Juin
        { label: 'S24', value: 93, color: 'bg-emerald-500', month: 'Juin' },
        { label: 'S25', value: 98, color: 'bg-emerald-500', month: 'Juin' },
        { label: 'S26', value: 95, color: 'bg-emerald-500', month: 'Juin' },
    ];

    const [chartRef, chartInView] = useInView({ once: true, margin: '-100px' });
    const [progressRef, progressInView] = useInView({ once: true, margin: '-100px' });

    // Regrouper les semaines par mois pour les en-têtes
    const months = ['Avril', 'Mai', 'Juin'];

    return (
        <section id="analytics" className="py-32 px-6 md:px-10 bg-white relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="h-full w-full" style={{
                    backgroundImage: 'linear-gradient(rgba(30,58,95,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,95,0.3) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <SectionHeading
                    eyebrow="Operations Center"
                    title="Real-Time Command Interface"
                    subtitle="A unified operations dashboard providing instantaneous visibility into fleet health, maintenance status, and regulatory compliance across all RAM technical stations."
                    align="center"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-16">
                    {/* Main Dashboard Panel */}
                    <div className="lg:col-span-8">
                        <div className="h-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Fleet Availability</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Real-time operational status</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                {kpiData.map((kpi, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <kpi.icon className={`w-3.5 h-3.5 ${kpi.status === 'good' ? 'text-emerald-500' : 'text-amber-500'}`} />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Target: {kpi.target}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Chart Simulation - Semaines Avril/Mai/Juin */}
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dispatch Reliability — Avril / Mai / Juin</span>
                                    <span className="text-xs font-black text-emerald-600">+2.4% YoY</span>
                                </div>

                                {/* En-têtes des mois */}
                                <div className="flex justify-between mb-2 px-2">
                                    {months.map((month) => (
                                        <span key={month} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center flex-1">
                                            {month}
                                        </span>
                                    ))}
                                </div>

                                <div ref={chartRef} className="flex items-end justify-between gap-2 h-44">
                                    {chartBars.map((bar, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                                            <div className="w-full max-w-[36px] h-36 bg-slate-200/50 rounded-t-lg relative overflow-hidden">
                                                <div
                                                    className={`absolute bottom-0 left-0 right-0 rounded-t-lg ${bar.color} opacity-90 bar-animate`}
                                                    style={{
                                                        height: chartInView ? `${bar.value}%` : `${bar.value * 0.1}%`,
                                                        transitionDelay: `${i * 80}ms`,
                                                        minHeight: chartInView ? '8px' : '4px',
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-500">{bar.value}%</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{bar.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Légende des couleurs */}
                                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">≥ 90% Objectif</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-ram-red" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">&lt; 90% Attention</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Panels */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="p-6 flex-1 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight mb-4">Maintenance Alerts</h3>
                            <div className="space-y-3">
                                {[
                                    { type: 'warning', msg: 'CN-RGU: A-Check due in 120 FH', time: '3 weeks ago' },
                                    { type: 'info', msg: 'CN-RHP: SB 737-57-1323 compliance', time: '5 weeks ago' },
                                    { type: 'success', msg: 'CN-RGZ: C-Check completed', time: '4 weeks ago' },
                                    { type: 'warning', msg: 'CN-RGM: LLI inspection required', time: '7 weeks ago' },
                                ].map((alert, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                                            alert.type === 'warning' ? 'bg-amber-500' : alert.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-600 font-medium truncate">{alert.msg}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{alert.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight mb-4">Component Health</h3>
                            <div ref={progressRef} className="space-y-5">
                                {[
                                    { label: 'APU', value: 94, color: 'bg-emerald-500' },
                                    { label: 'Landing Gear', value: 87, color: 'bg-ram-red' },
                                    { label: 'Avionics', value: 98, color: 'bg-emerald-500' },
                                    { label: 'Engines', value: 91, color: 'bg-ram-red' },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                                            <span className="text-[10px] font-black text-slate-600">{item.value}%</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${item.color} progress-animate`}
                                                style={{
                                                    width: progressInView ? `${item.value}%` : `${item.value * 0.15}%`,
                                                    transitionDelay: `${i * 150}ms`,
                                                    minWidth: progressInView ? '4px' : '2px',
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});


/* ================================================================
   PLATFORM FEATURES SECTION
   ================================================================ */

const FeaturesSection = memo(() => {
    const features = [
        {
            icon: Plane,
            title: 'Fleet Management',
            description: 'Comprehensive aircraft registry with airworthiness status, configuration control, and lease return tracking.',
            metric: '64 Aircraft',
            color: 'from-ram-red/20 to-ram-red/5',
        },
        {
            icon: Wrench,
            title: 'Aircraft Maintenance',
            description: 'End-to-end MRO workflow management from work package creation to task card sign-off and release to service.',
            metric: '8 Active Checks',
            color: 'from-blue-500/20 to-blue-500/5',
        },
        {
            icon: AlertTriangle,
            title: 'Defect Tracking',
            description: 'Real-time MEL/CDL management with automated deferral tracking, repeat defect analysis, and reliability alerts.',
            metric: '12 Deferred',
            color: 'from-amber-500/20 to-amber-500/5',
        },
        {
            icon: ClipboardCheck,
            title: 'Work Orders',
            description: 'Digital task card execution with electronic signatures, man-hour tracking, and material consumption logging.',
            metric: '342 Closed/Mo',
            color: 'from-emerald-500/20 to-emerald-500/5',
        },
        {
            icon: ShieldCheck,
            title: 'Compliance Monitoring',
            description: 'Automated regulatory compliance tracking for DGCA Morocco, EASA, and ICAO standards with audit trails.',
            metric: '100% Compliant',
            color: 'from-purple-500/20 to-purple-500/5',
        },
        {
            icon: BarChart3,
            title: 'Predictive Analytics',
            description: 'Machine learning models analyzing ATA chapter trends to forecast component failures and optimize inventory.',
            metric: 'AI-Powered',
            color: 'from-cyan-500/20 to-cyan-500/5',
        },
        {
            icon: Radar,
            title: 'Flight Operations',
            description: 'Integrated flight data monitoring with FOQA, MOR reporting, and operational performance dashboards.',
            metric: '24/7 Live',
            color: 'from-orange-500/20 to-orange-500/5',
        },
        {
            icon: Cpu,
            title: 'Reliability Engineering',
            description: 'Statistical analysis of component reliability, MTBUR tracking, and engineering order management.',
            metric: '99.2% Uptime',
            color: 'from-pink-500/20 to-pink-500/5',
        },
    ];

    return (
        <section id="platform" className="py-32 px-6 md:px-10 bg-slate-50 relative">
            <div className="max-w-7xl mx-auto">
                <SectionHeading
                    eyebrow="Platform Capabilities"
                    title="Integrated CAMO Ecosystem"
                    subtitle="Eight core modules engineered to unify Royal Air Maroc's technical operations into a single source of truth."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="group relative p-8 rounded-[2rem] bg-white border border-slate-200 hover:border-ram-red/20 hover:shadow-xl hover:shadow-ram-red/5 transition-all duration-500 cursor-pointer hover-lift animate-fade-in-up"
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${feature.color} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover-bg transition-all duration-300">
                                    <feature.icon className="w-6 h-6 text-ram-red group-hover-icon transition-colors duration-300" />
                                </div>

                                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-3">{feature.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-6">{feature.description}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <span className="text-[10px] font-bold text-ram-red uppercase tracking-widest">{feature.metric}</span>
                                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover-text transition-colors" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});

/* ================================================================
   VISUAL STORYTELLING SECTIONS
   ================================================================ */

const StorySection = memo(({ id, eyebrow, title, description, image, reverse = false, stats = [] }) => {
    const [imgRef, imgInView] = useInView({ once: true });
    const [textRef, textInView] = useInView({ once: true });

    return (
        <section id={id} className={`py-24 md:py-32 px-6 md:px-10 ${reverse ? 'bg-white' : 'bg-slate-50'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`}>
                    <div
                        ref={imgRef}
                        className={`${reverse ? 'lg:order-2' : ''} ${imgInView ? (reverse ? 'animate-fade-in-right' : 'animate-fade-in-left') : 'opacity-0'}`}
                    >
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-br from-ram-red/10 to-transparent rounded-[3rem] blur-2xl" />
                            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-2xl bg-slate-100">
                                <AviationImage
                                    src={image}
                                    alt={title}
                                    className="w-full"
                                    style={{ height: '500px' }}
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent z-30 pointer-events-none" />
                            </div>

                            {/* Floating Card */}

                        </div>
                    </div>

                    <div
                        ref={textRef}
                        className={`${reverse ? 'lg:order-1' : ''} ${textInView ? (reverse ? 'animate-fade-in-left' : 'animate-fade-in-right') : 'opacity-0'}`}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-ram-red/10 rounded-full border border-ram-red/20 mb-6">
                            <Sparkles className="w-3.5 h-3.5 text-ram-red" />
                            <span className="text-[10px] font-bold text-ram-red uppercase tracking-[0.25em]">{eyebrow}</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                            {title}
                        </h2>

                        <p className="text-lg text-slate-500 leading-relaxed mb-8">
                            {description}
                        </p>

                        {stats.length > 0 && (
                            <div className="grid grid-cols-2 gap-6">
                                {stats.map((stat, i) => (
                                    <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                        <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
});

/* ================================================================
   AVIATION VISUALS / HANGAR SECTION
   ================================================================ */

const AviationVisuals = memo(() => {
    const visuals = [
        { src: IMAGES.mroHangar, title: 'MRO Hangar Operations', category: 'Maintenance' },
        { src: IMAGES.engine, title: 'Engine Condition Monitoring', category: 'Powerplant' },
        { src: IMAGES.flightDeck, title: 'Flight Deck Avionics', category: 'Avionics' },
        { src: IMAGES.control, title: 'AOCC Command Center', category: 'Operations' },
        { src: IMAGES.lineMaintenance, title: 'Line Maintenance Station', category: 'Line Ops' },
        { src: IMAGES.wing, title: 'Structural Inspection', category: 'Airframe' },
    ];

    return (
        <section className="py-32 px-6 md:px-10 bg-[#1E3A5F]">
            <div className="max-w-7xl mx-auto">
                <SectionHeading
                    eyebrow="Visual Intelligence"
                    title="Technical Operations in Action"
                    subtitle="A glimpse into the infrastructure and processes that keep Royal Air Maroc's fleet airworthy and compliant."
                    light
                    align="center"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
                    {visuals.map((visual, i) => (
                        <div
                            key={i}
                            className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 cursor-pointer animate-scale-in bg-[#152B47]"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <AviationImage
                                src={visual.src}
                                alt={visual.title}
                                className="absolute inset-0 w-full h-full"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A5F] via-[#1E3A5F]/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity z-30 pointer-events-none" />

                            <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
                                <span className="inline-block px-3 py-1 bg-ram-red text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                                    {visual.category}
                                </span>
                                <h3 className="text-lg font-black text-white tracking-tight">{visual.title}</h3>
                            </div>

                            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                <Eye className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});

/* ================================================================
   TRUST / BRANDING STRIP — CLEAN DEEP BLUE
   ================================================================ */

const BrandingStrip = memo(() => {
    const metrics = [
        { value: '1957', label: 'Founded' },
        { value: '100+', label: 'Destinations' },
        { value: '64', label: 'Fleet Size' },
        { value: '5000+', label: 'Employees' },
        { value: 'OneWorld', label: 'Alliance' },
    ];

    return (
        <section className="py-32 px-6 md:px-10 bg-[#1E3A5F] relative overflow-hidden">
            {/* Decorative Grid */}
            <div className="absolute inset-0 opacity-[0.06]">
                <div className="grid grid-cols-12 h-full">
                    {Array.from({ length: 144 }).map((_, i) => (
                        <div key={i} className="border border-white/10" />
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col items-center text-center mb-20">
                    <div className="animate-scale-in">
                        <Logo className="h-24 md:h-32 opacity-90 mb-10" />
                    </div>

                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-8 animate-fade-in-up delay-200">
                        WINGS OF THE
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-ram-red-light">KINGDOM</span>
                    </h2>

                    <div className="h-1 w-40 bg-gradient-to-r from-white to-ram-red rounded-full mb-12 animate-fade-in delay-500" />

                    <p className="text-lg text-white/50 max-w-2xl font-medium leading-relaxed animate-fade-in delay-700">
                        Connecting Morocco to the world since 1957. Royal Air Maroc's Technical Division
                        ensures every departure meets the highest standards of airworthiness and safety.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 animate-fade-in-up delay-300">
                    {metrics.map((metric, i) => (
                        <div key={i} className="text-center p-6 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                            <p className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">{metric.value}</p>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">{metric.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
});

/* ================================================================
   FOOTER — CLEAN LIGHT
   ================================================================ */

const Footer = memo(() => {
    const links = [
        { label: 'Security', href: '#' },
        { label: 'Support', href: '#' },
        { label: 'Legal', href: '#' },
        { label: 'Privacy', href: '#' },
        { label: 'API Docs', href: '#' },
    ];

    return (
        <footer className="py-16 px-6 md:px-10 bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center lg:items-start gap-4">
                        <Logo className="h-10 opacity-60" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                            Integrated CAMO Network v3.0.0
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8">
                        {links.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-ram-red transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            © 2026 Royal Air Maroc Technical Division
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
});

/* ================================================================
   MAIN HOME COMPONENT
   ================================================================ */

const Home = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        aircraft: 64,
        reliability: '99.8%',
        maintenance: 8,
        uptime: '99.99%'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [aircraftRes, maintenanceRes] = await Promise.all([
                    aircraftAPI.getAll().catch(() => ({ data: [] })),
                    maintenanceAPI.getAll().catch(() => ({ data: [] }))
                ]);

                if (aircraftRes.data?.length > 0) {
                    setStats(prev => ({
                        ...prev,
                        aircraft: aircraftRes.data.length,
                        maintenance: (maintenanceRes.data || []).filter(m => m.status === 'IN_PROGRESS').length
                    }));
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-white selection:bg-ram-red selection:text-white font-sans overflow-x-hidden">
            <GlobalStyles />
            <Navbar navigate={navigate} />
            <HeroSection navigate={navigate} />
            <StatsSection stats={stats} />
            <FleetGallery />
            <DashboardPreview />
            <FeaturesSection />

            <StorySection
                id="operations"
                eyebrow="Why We Exist"
                title="Unifying Technical Operations"
                description="Before this platform, Royal Air Maroc's technical data lived in fragmented spreadsheets, legacy systems, and paper logbooks. The Integrated CAMO Network consolidates every maintenance action, defect report, and airworthiness directive into a single, auditable source of truth — accessible to engineers in Casablanca, technicians in the hangar, and auditors in Rabat."
                image={IMAGES.operationsCenter}
                stats={[
                    { value: '64', label: 'Aircraft Managed' },
                    { value: '100%', label: 'Digital Records' },
                ]}
            />

            <StorySection
                id="defects"
                eyebrow="Defect Intelligence"
                title="From Reactive to Predictive"
                description="Every MEL entry, CDL item, and deferred defect is tracked with full traceability. The system automatically flags repeat defects, analyzes ATA chapter trends, and predicts component failures before they ground an aircraft. Engineers receive real-time alerts when an item approaches its expiration or when a reliability threshold is breached."
                image={IMAGES.engine}
                reverse
                stats={[
                    { value: '12', label: 'Active Deferred' },
                    { value: '9', label: 'AOG Events' },
                ]}
            />

            <StorySection
                id="reliability"
                eyebrow="Fleet Reliability"
                title="Data-Driven Airworthiness"
                description="Dispatch reliability is not just a metric — it is a commitment to every passenger. The platform aggregates flight data, maintenance logs, and component health to compute real-time reliability indices. Maintenance planners use these insights to optimize check intervals, reduce unscheduled downtime, and extend component life cycles."
                image={IMAGES.dataDriven}
                stats={[
                    { value: '99.8%', label: 'Dispatch Reliability' },
                    { value: '2.4%', label: 'YoY Improvement' },
                ]}
            />

            <AviationVisuals />
            <BrandingStrip />
            <Footer />
        </div>
    );
};

export default Home;