import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Skeleton Component for loading states
const Skeleton = ({ className = '', variant = 'default' }) => {
    const baseClass = "animate-pulse rounded-xl";
    const variantStyles = {
        default: "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
        circle: "rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
        text: "h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"
    };

    return (
        <div
            className={`${baseClass} ${variantStyles[variant]} ${className}`}
            style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear'
            }}
        />
    );
};

// Dashboard Skeleton Layout
const DashboardSkeleton = () => (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" variant="text" />
            </div>
            <Skeleton className="h-12 w-36 rounded-xl" />
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <Skeleton className="w-10 h-10 mb-3" variant="circle" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" variant="text" />
                </div>
            ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <Skeleton className="h-5 w-32 mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3].map(j => (
                                <Skeleton key={j} className="h-10 w-full" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <Skeleton className="h-5 w-32 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-14 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 1000 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const countRef = useRef(null);

    useEffect(() => {
        const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
        const startTime = Date.now();
        const startValue = displayValue;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(startValue + (numValue - startValue) * easeOutQuart);

            setDisplayValue(currentValue);

            if (progress < 1) {
                countRef.current = requestAnimationFrame(animate);
            }
        };

        countRef.current = requestAnimationFrame(animate);

        return () => {
            if (countRef.current) cancelAnimationFrame(countRef.current);
        };
    }, [value, duration]);

    return <span>{displayValue}</span>;
};

// Animated Progress Ring Component
const AnimatedProgressRing = ({ percentage, size = 64, strokeWidth = 6, color = 'var(--color-primary)' }) => {
    const [animatedPercentage, setAnimatedPercentage] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedPercentage(percentage), 100);
        return () => clearTimeout(timer);
    }, [percentage]);

    const offset = circumference - (animatedPercentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="var(--bg-progress-empty)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Animated progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transition: 'stroke-dashoffset 1s ease-out',
                        filter: `drop-shadow(0 0 6px ${color}40)`
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-themed">
                    <AnimatedCounter value={animatedPercentage} />%
                </span>
            </div>
        </div>
    );
};

// Progress Bar with Animation
const AnimatedProgressBar = ({ progress, label }) => {
    const [animatedWidth, setAnimatedWidth] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedWidth(progress), 100);
        return () => clearTimeout(timer);
    }, [progress]);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm text-themed-secondary">{label}</span>
                <span className="text-sm font-semibold text-themed">
                    <AnimatedCounter value={progress} />%
                </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-progress-empty)' }}>
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${animatedWidth}%`,
                        background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)'
                    }}
                />
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const [dashboardRes, tasksRes] = await Promise.all([
                dashboardAPI.getStats(),
                tasksAPI.getAll(),
            ]);
            setData(dashboardRes.data);
            setTasks(tasksRes.data.tasks || tasksRes.data || []);
        } catch {
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleTaskToggle = async (taskId, currentStatus) => {
        try {
            if (currentStatus === 'completed') {
                await tasksAPI.markPending(taskId);
            } else {
                await tasksAPI.markComplete(taskId);
            }
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === taskId
                        ? {
                            ...t,
                            status: currentStatus === 'completed' ? 'pending' : 'completed',
                        }
                        : t
                )
            );
        } catch (err) {
            console.error('Failed to toggle task:', err);
        }
    };

    // Show skeleton during loading
    if (loading) return <DashboardSkeleton />;
    if (error) return <div className="alert alert-error">{error}</div>;

    const {
        profile_summary,
        profile_strength,
        // eslint-disable-next-line no-unused-vars
        current_stage,
        stats,
        locked_university,
    } = data || {};

    const pendingTasks = tasks.filter((t) => t.status === 'pending');
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const overallProgress = stats?.overall_progress ?? (
        tasks.length > 0
            ? Math.round((completedTasks.length / tasks.length) * 100)
            : 0
    );

    const getStrengthPercentage = () => {
        if (!profile_strength) return 0;
        return Math.round(
            (profile_strength.score / profile_strength.max_score) * 100
        );
    };

    const stages = [
        { num: 1, label: 'Profile', icon: '👤' },
        { num: 2, label: 'Discover', icon: '🔍' },
        { num: 3, label: 'Finalize', icon: '📋' },
        { num: 4, label: 'Apply', icon: '🚀' },
    ];

    return (
        <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-themed">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-themed-secondary mt-1">
                        Here's your study abroad journey at a glance
                    </p>
                </div>
                <Link
                    to="/chat"
                    className="btn btn-primary inline-flex items-center gap-2 self-start group"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat with AI
                </Link>
            </div>

            {/* Overall Progress Hero Card */}
            <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                }}
            >
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/20" />
                    <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/10" />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="text-white">
                        <p className="text-white/80 text-sm font-medium uppercase tracking-wide mb-1">Overall Progress</p>
                        <h2 className="text-4xl md:text-5xl font-bold mb-2">
                            <AnimatedCounter value={overallProgress} />%
                        </h2>
                        <p className="text-white/70 text-sm">
                            {overallProgress < 25 ? "Let's get started on your profile!" :
                                overallProgress < 50 ? "Great progress! Keep exploring universities." :
                                    overallProgress < 75 ? "Almost there! Time to finalize your choice." :
                                        "Final stretch! Complete your applications."}
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center text-white">
                            <div className="text-3xl font-bold"><AnimatedCounter value={stats?.shortlisted || 0} /></div>
                            <div className="text-white/70 text-xs uppercase tracking-wide">Universities</div>
                        </div>
                        <div className="text-center text-white">
                            <div className="text-3xl font-bold"><AnimatedCounter value={completedTasks.length} /></div>
                            <div className="text-white/70 text-xs uppercase tracking-wide">Completed</div>
                        </div>
                        <div className="text-center text-white">
                            <div className="text-3xl font-bold"><AnimatedCounter value={pendingTasks.length} /></div>
                            <div className="text-white/70 text-xs uppercase tracking-wide">Pending</div>
                        </div>
                    </div>
                </div>
                {/* Progress bar at bottom */}
                <div className="mt-6 h-2 rounded-full bg-white/20 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-white transition-all duration-1000 ease-out"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    }
                    value={stats?.shortlisted || 0}
                    label="Universities"
                    iconBg="bg-primary/10 text-primary"
                />
                <StatCard
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    value={completedTasks.length}
                    label="Completed"
                    iconBg="bg-emerald-500/10 text-emerald-500"
                />
                <StatCard
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    value={pendingTasks.length}
                    label="Pending"
                    iconBg="bg-amber-500/10 text-amber-500"
                />
                <StatCard
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    }
                    value={`${overallProgress}%`}
                    label="Progress"
                    iconBg="bg-purple-500/10 text-purple-500"
                    isProgress
                    progressValue={overallProgress}
                />
            </div>

            {/* Locked University Banner */}
            {locked_university && (
                <div
                    className="rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center animate-pulse">
                            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-emerald-500 font-medium uppercase tracking-wide">
                                Locked University
                            </p>
                            <h3 className="font-semibold text-lg text-themed">
                                {locked_university.uni_name}
                            </h3>
                            <p className="text-sm text-themed-muted">
                                {locked_university.country}
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/application"
                        className="btn btn-primary group"
                    >
                        View Application Guide
                        <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Stage Progress */}
                    <div
                        className="rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <h3 className="text-base font-semibold text-themed mb-5">Your Journey</h3>
                        <div className="space-y-1">
                            {stages.map((stage, idx) => {
                                const isActive = stage.num === (user?.stage || 1);
                                const isCompleted = stage.num < (user?.stage || 1);
                                return (
                                    <div key={stage.num} className="relative">
                                        <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/5' : ''}`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-500 ${isActive
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-110'
                                                : isCompleted
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'text-themed-muted'
                                                }`} style={{
                                                    background: !isActive && !isCompleted ? 'var(--bg-secondary)' : undefined
                                                }}>
                                                {isCompleted ? (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : stage.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-medium transition-colors ${isActive ? 'text-primary' : isCompleted ? 'text-themed' : 'text-themed-secondary'
                                                    }`}>
                                                    {stage.label}
                                                </p>
                                                {isActive && (
                                                    <p className="text-xs text-themed-muted animate-pulse">Current stage</p>
                                                )}
                                            </div>
                                            {isCompleted && (
                                                <span className="text-xs text-emerald-500 font-medium">Done</span>
                                            )}
                                        </div>
                                        {idx < stages.length - 1 && (
                                            <div className={`absolute left-[23px] top-[52px] w-0.5 h-2 transition-colors ${isCompleted ? 'bg-emerald-500/50' : ''
                                                }`} style={{
                                                    background: !isCompleted ? 'var(--border-color)' : undefined
                                                }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Profile Strength */}
                    <div
                        className="rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold text-themed">Profile Strength</h3>
                            <Link to="/profile" className="text-sm text-primary hover:text-primary-dark transition-colors">
                                Edit
                            </Link>
                        </div>

                        <div className="flex items-center gap-4 mb-5">
                            <AnimatedProgressRing
                                percentage={getStrengthPercentage()}
                                color={profile_strength?.overall === 'Strong' ? '#10b981' :
                                    profile_strength?.overall === 'Average' ? '#f59e0b' : '#ef4444'}
                            />
                            <div>
                                <p className={`font-medium ${profile_strength?.overall === 'Strong' ? 'text-emerald-500' :
                                    profile_strength?.overall === 'Average' ? 'text-amber-500' : 'text-red-500'
                                    }`}>
                                    {profile_strength?.overall || 'Unknown'}
                                </p>
                                <p className="text-xs text-themed-muted">Overall rating</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {profile_strength?.details &&
                                Object.entries(profile_strength.details).slice(0, 3).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center text-sm">
                                        <span className="text-themed-muted capitalize">{key}</span>
                                        <span className={`font-medium ${value === 'Strong' ? 'text-emerald-500' :
                                            value === 'Average' || value === 'In Progress' || value === 'Some' ? 'text-amber-500' : 'text-red-500'
                                            }`}>
                                            {value}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Quick Profile Info */}
                    <div
                        className="rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <h3 className="text-base font-semibold text-themed mb-4">Quick Info</h3>
                        <div className="space-y-3 text-sm">
                            <InfoRow
                                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>}
                                label="Target Degree"
                                value={profile_summary?.target_degree}
                            />
                            <InfoRow
                                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
                                label="Intake"
                                value={profile_summary?.intake}
                            />
                            <InfoRow
                                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                label="Budget"
                                value={profile_summary?.budget}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column - Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tasks Card */}
                    <div
                        className="rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold text-themed">Your Tasks</h3>
                            <Link
                                to="/tasks"
                                className="text-sm text-primary hover:text-primary-dark transition-colors flex items-center gap-1 group"
                            >
                                View All
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Task Progress Bar */}
                        {tasks.length > 0 && (
                            <div className="mb-5">
                                <AnimatedProgressBar
                                    progress={tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}
                                    label="Task Completion"
                                />
                            </div>
                        )}

                        {tasks.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <p className="text-themed-secondary mb-4">
                                    No tasks yet. Chat with AI Counsellor to get started!
                                </p>
                                <Link
                                    to="/chat"
                                    className="btn btn-primary inline-flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Talk to AI
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pendingTasks.slice(0, 6).map((task, index) => (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskToggle(task.id, task.status)}
                                        className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 group hover:shadow-md hover:scale-[1.01]"
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            animationDelay: `${index * 50}ms`
                                        }}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${task.priority === 'high' || task.priority === 'critical'
                                            ? 'border-amber-500 group-hover:bg-amber-500/20'
                                            : 'group-hover:border-primary group-hover:bg-primary/10'
                                            }`} style={{ borderColor: task.priority === 'high' || task.priority === 'critical' ? undefined : 'var(--border-color)' }}>
                                        </div>
                                        <span className="flex-1 text-sm text-themed-secondary group-hover:text-themed transition-colors">
                                            {task.title}
                                        </span>
                                        {(task.priority === 'high' || task.priority === 'critical') && (
                                            <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 font-medium">
                                                {task.priority === 'critical' ? 'Critical' : 'High'}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {pendingTasks.length > 6 && (
                                    <p className="text-sm text-themed-muted text-center pt-2">
                                        +{pendingTasks.length - 6} more tasks
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <QuickAction
                            to="/chat"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            }
                            title="AI Counsellor"
                            description="Get personalized advice"
                            iconBg="bg-primary/10 text-primary"
                        />
                        <QuickAction
                            to="/recommendations"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            }
                            title="Universities"
                            description="Explore options"
                            iconBg="bg-secondary/10 text-secondary"
                        />
                        <QuickAction
                            to="/shortlist"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            }
                            title="Shortlist"
                            description="Your saved universities"
                            iconBg="bg-rose-500/10 text-rose-500"
                        />
                        <QuickAction
                            to="/tasks"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            }
                            title="Tasks"
                            description="Track your progress"
                            iconBg="bg-emerald-500/10 text-emerald-500"
                        />
                    </div>
                </div>
            </div>

            {/* Shimmer animation style */}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

// Stat Card Component with animation
const StatCard = ({ icon, value, label, iconBg, isProgress, progressValue }) => {
    return (
        <div
            className="rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-default group"
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)'
            }}
        >
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
                {icon}
            </div>
            <div className="text-2xl font-bold text-themed">
                {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
            </div>
            <div className="text-xs text-themed-muted uppercase tracking-wide mt-1">
                {label}
            </div>
            {isProgress && (
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-progress-empty)' }}>
                    <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                            width: `${progressValue}%`,
                            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

// Info Row Component
const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5">
        <div className="text-themed-muted">{icon}</div>
        <span className="text-themed-muted flex-1">{label}</span>
        <span className="text-themed-secondary font-medium">{value || 'Not set'}</span>
    </div>
);

// Quick Action Component with enhanced animations
const QuickAction = ({ to, icon, title, description, iconBg }) => (
    <Link
        to={to}
        className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
        style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
        }}
    >
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-themed group-hover:text-primary transition-colors">
                {title}
            </h4>
            <p className="text-xs text-themed-muted">{description}</p>
        </div>
        <svg className="w-5 h-5 text-themed-muted ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </Link>
);

export default Dashboard;
