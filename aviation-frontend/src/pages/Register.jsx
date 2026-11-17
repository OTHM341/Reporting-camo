import { useState, useEffect, useRef, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Eye, EyeOff, User, Mail, Briefcase, Shield, ChevronRight, CheckCircle, ArrowLeft,
    Sparkles, Lock, Fingerprint, Wifi, Server, Zap, Plane, Activity, Clock, Globe,
    MapPin, CheckCircle2, ArrowRight, Loader2, Users, BadgeCheck, Radio, Headset, Award
} from 'lucide-react';
import { authAPI } from '../services/api';
import Logo from '../components/UI/Logo';

const RAM_BRAND = {
    colors: {
        primary: '#C41E3A',
        darkRed: '#9B1B30',
        secondary: '#FFFFFF',
        lightGray: '#F8FAFC',
        mediumGray: '#E2E8F0',
        darkGray: '#64748B',
        errorRed: '#EF4444',
        successGreen: '#10B981',
        primaryNavy: '#1E3A5F',
    },
    typography: {
        primary: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        heading: "'Poppins', 'Inter', system-ui, sans-serif",
    }
};

/* ================================================================
   ANIMATED BACKGROUND PARTICLES
   ================================================================ */
const ParticleBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        const createParticles = () => {
            particles = [];
            const count = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.3 + 0.1,
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[j].x - p.x;
                    const dy = particles[j].y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * (1 - dist / 100)})`;
                        ctx.stroke();
                    }
                }
            });
            animationId = requestAnimationFrame(animate);
        };

        resize();
        createParticles();
        animate();
        const handleResize = () => { resize(); createParticles(); };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
};

/* ================================================================
   ANIMATED COUNTER
   ================================================================ */
const AnimatedCounter = ({ target, suffix = '', duration = 2 }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        let start = 0;
        const end = parseFloat(target);
        const increment = end / (duration * 60);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else { setCount(parseFloat(start.toFixed(1))); }
        }, 16);
        return () => clearInterval(timer);
    }, [isVisible, target, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
};

/* ================================================================
   TYPING EFFECT TEXT
   ================================================================ */
const TypewriterText = ({ texts, speed = 80, pause = 2000 }) => {
    const [displayText, setDisplayText] = useState('');
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentText = texts[textIndex];
        let timeout;

        if (!isDeleting && charIndex < currentText.length) {
            timeout = setTimeout(() => {
                setDisplayText(currentText.slice(0, charIndex + 1));
                setCharIndex(charIndex + 1);
            }, speed);
        } else if (!isDeleting && charIndex >= currentText.length) {
            timeout = setTimeout(() => setIsDeleting(true), pause);
        } else if (isDeleting && charIndex > 0) {
            timeout = setTimeout(() => {
                setDisplayText(currentText.slice(0, charIndex - 1));
                setCharIndex(charIndex - 1);
            }, speed / 2);
        } else if (isDeleting && charIndex === 0) {
            setIsDeleting(false);
            setTextIndex((textIndex + 1) % texts.length);
        }

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, textIndex, texts, speed, pause]);

    return (
        <span className="inline-block">
            {displayText}
            <span className="animate-pulse ml-0.5">|</span>
        </span>
    );
};

/* ================================================================
   SECURITY BADGE
   ================================================================ */
const SecurityBadge = memo(({ label, icon: Icon, delay = 0 }) => (
    <div
        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full"
        style={{ animationDelay: `${delay}ms` }}
    >
        <Icon className="w-3 h-3 text-white/80" />
        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{label}</span>
    </div>
));

/* ================================================================
   FORM INPUT COMPONENT
   ================================================================ */
const FormInput = memo(({ label, name, type = 'text', value, onChange, onFocus, onBlur, focusedField, placeholder, icon: Icon, required = true, children }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {Icon && <Icon className="w-3 h-3" />}
            {label}
        </label>
        <div className="relative group">
            <input
                type={type}
                name={name}
                required={required}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all duration-300 font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-300"
                style={{
                    borderColor: focusedField === name ? RAM_BRAND.colors.primary : '#F1F5F9',
                    boxShadow: focusedField === name ? `0 0 0 4px ${RAM_BRAND.colors.primary}10` : 'none'
                }}
                placeholder={placeholder}
            />
            {value && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 animate-fade-in" />
            )}
        </div>
    </div>
));

/* ================================================================
   MAIN REGISTER COMPONENT
   ================================================================ */
function Register() {
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'TECHNICIAN'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [shake, setShake] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setLoading(false);
            return;
        }

        if (!agreeTerms) {
            setError('Agreement to Terms of Service required');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setLoading(false);
            return;
        }

        try {
            await authAPI.register(formData);
            navigate('/login');
        } catch (err) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setError(err.response?.data?.message || 'Induction process failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');

        if (name === 'password') {
            let strength = 0;
            if (value.length >= 8) strength += 25;
            if (/[A-Z]/.test(value)) strength += 25;
            if (/[0-9]/.test(value)) strength += 25;
            if (/[^A-Za-z0-9]/.test(value)) strength += 25;
            setPasswordStrength(strength);
        }
    };

    const typewriterTexts = [
        'Fleet Monitoring Access',
        'Institutional Reporting',
        'Technical Oversight',
        'CAMO Compliance'
    ];

    const statsData = [
        { icon: Activity, value: '75', suffix: '%', label: 'Fleet Availability', color: 'from-emerald-500/20 to-emerald-500/5' },
        { icon: Clock, value: '68.2', suffix: '%', label: 'On-Time Performance', color: 'from-blue-500/20 to-blue-500/5' },
        { icon: Plane, value: '64', suffix: '', label: 'Aircraft Managed', color: 'from-amber-500/20 to-amber-500/5' },
        { icon: Shield, value: '100', suffix: '%', label: 'Compliance Rate', color: 'from-purple-500/20 to-purple-500/5' },
    ];

    const benefits = [
        { icon: BadgeCheck, label: 'Fleet Monitoring Access' },
        { icon: Radio, label: 'Institutional Reporting' },
        { icon: Zap, label: 'Technical Oversight' },
    ];

    const getStrengthColor = () => {
        if (passwordStrength <= 25) return 'bg-red-500';
        if (passwordStrength <= 50) return 'bg-amber-500';
        if (passwordStrength <= 75) return 'bg-blue-500';
        return 'bg-emerald-500';
    };

    const getStrengthLabel = () => {
        if (passwordStrength <= 25) return 'Weak';
        if (passwordStrength <= 50) return 'Fair';
        if (passwordStrength <= 75) return 'Good';
        return 'Strong';
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row" style={{ fontFamily: RAM_BRAND.typography.primary }}>
            {/* ================================================================
                LEFT SECTION — Immersive Branding Experience
                ================================================================ */}
            <div className="lg:w-[55%] relative flex flex-col justify-between overflow-hidden min-h-[50vh] lg:min-h-screen">
                {/* Layered Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0" style={{
                        background: `linear-gradient(160deg, ${RAM_BRAND.colors.primaryNavy} 0%, ${RAM_BRAND.colors.primary} 40%, ${RAM_BRAND.colors.darkRed} 100%)`
                    }} />
                    <div className="absolute inset-0 opacity-30" style={{
                        background: 'radial-gradient(ellipse at 30% 20%, rgba(196,30,58,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(30,58,95,0.5) 0%, transparent 50%)'
                    }} />
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }} />
                </div>

                <ParticleBackground />

                <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-ram-red/10 rounded-full blur-[120px] pointer-events-none" style={{ animationDelay: '2s' }} />

                <div className="relative z-10 flex flex-col h-full p-8 md:p-12 lg:p-16">
                    {/* Top — Logo & Badge */}
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <Logo className="h-14 lg:h-16 relative z-10 transition-transform duration-300 group-hover:scale-105" />
                            </div>
                            <div className="hidden md:flex flex-col">
                                <span className="text-white font-black text-lg tracking-tight leading-none">ROYAL AIR MAROC</span>
                                <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Technical Division</span>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">System Online</span>
                        </div>
                    </div>

                    {/* Middle — Hero Content */}
                    <div className="flex-1 flex flex-col justify-center max-w-xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-fit mb-8">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span className="text-[11px] font-black text-white/90 uppercase tracking-[0.25em]">Workforce Induction Portal</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] mb-6 tracking-tight">
                            WORKFORCE<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-amber-200">
                                ENROLLMENT
                            </span>
                        </h1>

                        <div className="h-1 w-24 bg-gradient-to-r from-white to-ram-red rounded-full mb-8" />

                        <p className="text-white/60 text-lg md:text-xl leading-relaxed mb-4 font-medium">
                            <TypewriterText texts={typewriterTexts} speed={60} pause={2500} />
                        </p>

                        <p className="text-white/40 text-sm leading-relaxed max-w-md">
                            Join the Royal Air Maroc Technical Division. Gain access to institutional fleet monitoring, predictive maintenance analytics, and CAMO operations management.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                        {statsData.map((stat, i) => {
                            const StatIcon = stat.icon;
                            return (
                                <div
                                    key={i}
                                    className="group relative p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 cursor-default"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <div className="relative z-10">
                                        <StatIcon className="w-5 h-5 text-white/60 mb-3 group-hover:text-white/90 transition-colors" />
                                        <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                            <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                        </p>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-3 mb-6">
                        {benefits.map((benefit, i) => {
                            const BenefitIcon = benefit.icon;
                            return (
                                <div key={i} className="flex items-center gap-3 text-white/70 group">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                        <BenefitIcon className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">{benefit.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Security Strip */}
                    <div className="flex flex-wrap items-center gap-3">
                        <SecurityBadge label="AES-256" icon={Lock} delay={0} />
                        <SecurityBadge label="SSL/TLS 1.3" icon={Wifi} delay={100} />
                        <SecurityBadge label="SOC 2 Type II" icon={Server} delay={200} />
                        <SecurityBadge label="2FA Ready" icon={Fingerprint} delay={300} />
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-white/30 text-xs mt-6">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-bold uppercase tracking-widest">Casablanca, Morocco</span>
                        <span className="mx-2">•</span>
                        <Globe className="w-3.5 h-3.5" />
                        <span className="font-bold uppercase tracking-widest">Global Operations</span>
                    </div>
                </div>
            </div>

            {/* ================================================================
                RIGHT SECTION — Premium Registration Form
                ================================================================ */}
            <div className="lg:w-[45%] flex items-center justify-center p-6 md:p-12 bg-slate-50/80 relative">
                <div className="absolute inset-0 opacity-[0.015]" style={{
                    backgroundImage: 'radial-gradient(circle, #1E3A5F 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />

                <div className="w-full max-w-lg relative z-10">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-10">
                        <Logo className="h-16 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">ROYAL AIR MAROC</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Technical Division</p>
                    </div>

                    {/* Registration Card */}
                    <div className={`bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 transition-transform duration-300 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                        {/* Card Header */}
                        <div className="relative pt-10 pb-8 px-8 text-center overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ram-red via-ram-red-light to-primary-navy" />

                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ram-red/10 to-ram-red/5 border border-ram-red/10 mb-5">
                                <Users className="w-7 h-7 text-ram-red" />
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                                Initialize Account
                            </h3>
                            <p className="text-sm text-slate-400 font-medium">
                                New Operator Credentials — CAMO Network
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
                            {/* Error Alert */}
                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-4 h-4 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-0.5">Induction Failed</p>
                                        <p className="text-xs text-red-600 leading-relaxed">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Name Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('firstName')}
                                    onBlur={() => setFocusedField(null)}
                                    focusedField={focusedField}
                                    placeholder="John"
                                    icon={User}
                                />
                                <FormInput
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('lastName')}
                                    onBlur={() => setFocusedField(null)}
                                    focusedField={focusedField}
                                    placeholder="Doe"
                                    icon={User}
                                />
                            </div>

                            {/* Username */}
                            <FormInput
                                label="Operator Identity"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('username')}
                                onBlur={() => setFocusedField(null)}
                                focusedField={focusedField}
                                placeholder="j.doe"
                                icon={Fingerprint}
                            />

                            {/* Email */}
                            <FormInput
                                label="Corporate Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                focusedField={focusedField}
                                placeholder="john.doe@ram.ma"
                                icon={Mail}
                            />

                            {/* Role Select */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <Briefcase className="w-3 h-3" />
                                    Functional Role
                                </label>
                                <div className="relative">
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all duration-300 font-bold text-slate-800 appearance-none cursor-pointer"
                                        style={{
                                            borderColor: focusedField === 'role' ? RAM_BRAND.colors.primary : '#F1F5F9',
                                            boxShadow: focusedField === 'role' ? `0 0 0 4px ${RAM_BRAND.colors.primary}10` : 'none'
                                        }}
                                        onFocus={() => setFocusedField('role')}
                                        onBlur={() => setFocusedField(null)}
                                    >
                                        <option value="ADMIN">Institutional Admin</option>
                                        <option value="MANAGER">Operations Manager</option>
                                        <option value="TECHNICIAN">Technical Specialist</option>
                                    </select>
                                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                                </div>
                            </div>

                            {/* Password Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <Lock className="w-3 h-3" />
                                        Access Code
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all duration-300 font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-300"
                                            style={{
                                                borderColor: focusedField === 'password' ? RAM_BRAND.colors.primary : '#F1F5F9',
                                                boxShadow: focusedField === 'password' ? `0 0 0 4px ${RAM_BRAND.colors.primary}10` : 'none'
                                            }}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {/* Strength Indicator */}
                                    {formData.password && (
                                        <div className="mt-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Strength</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest" style={{
                                                    color: passwordStrength <= 25 ? '#EF4444' : passwordStrength <= 50 ? '#F59E0B' : passwordStrength <= 75 ? '#3B82F6' : '#10B981'
                                                }}>{getStrengthLabel()}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-500 ${getStrengthColor()}`} style={{ width: `${passwordStrength}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <Lock className="w-3 h-3" />
                                        Confirm Code
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('confirmPassword')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all duration-300 font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-300"
                                            style={{
                                                borderColor: focusedField === 'confirmPassword' ? RAM_BRAND.colors.primary : '#F1F5F9',
                                                boxShadow: focusedField === 'confirmPassword' ? `0 0 0 4px ${RAM_BRAND.colors.primary}10` : 'none'
                                            }}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                        <p className="text-[10px] font-bold text-red-500 mt-1">Passwords do not match</p>
                                    )}
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <p className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Match
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
                                <div className="relative mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-5 h-5 rounded-md border-2 border-slate-200 peer-checked:bg-ram-red peer-checked:border-ram-red transition-all duration-200 flex items-center justify-center cursor-pointer">
                                        {agreeTerms && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <span className="text-sm text-slate-500 font-medium leading-relaxed">
                                    I certify authorized use of{' '}
                                    <span className="font-black text-slate-700">RAM network resources</span>{' '}
                                    and agree to the institutional terms of service.
                                </span>
                            </label>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative overflow-hidden text-white font-black py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-ram-red/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6 uppercase tracking-[0.15em] text-sm group"
                                style={{ background: `linear-gradient(135deg, ${RAM_BRAND.colors.primary} 0%, ${RAM_BRAND.colors.darkRed} 100%)` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                                        <span className="relative z-10">Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <User className="w-4 h-4 relative z-10" />
                                        <span className="relative z-10">Finalize Induction</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Card Footer */}
                        <div className="px-8 py-6 text-center border-t border-slate-100 bg-slate-50/50">
                            <p className="text-slate-500 text-sm font-medium">
                                Already registered?{' '}
                                <Link
                                    to="/login"
                                    className="font-black text-ram-red hover:text-ram-red-dark transition-colors inline-flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Return to Login
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Support Strip */}
                    <div className="mt-8 flex items-center justify-center gap-6">
                        {[
                            { icon: Headset, label: '24/7 Ops Support' },
                            { icon: Award, label: 'RAM Internal Network' },
                            { icon: Zap, label: 'Real-time Sync' },
                        ].map((item, i) => {
                            const ItemIcon = item.icon;
                            return (
                                <div key={i} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors cursor-default">
                                    <ItemIcon className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Version */}
                    <div className="mt-6 text-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
                            Integrated CAMO Network v3.0.0 — Build 2026.06
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease forwards;
                }
            `}</style>
        </div>
    );
}

export default Register;