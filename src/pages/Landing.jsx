import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const Landing = () => {
    const { isAuthenticated } = useAuth();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };

        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
            ),
            title: "AI-Powered Guidance",
            description: "Our intelligent counsellor understands your unique profile and provides personalized recommendations tailored to your goals.",
            gradient: "from-violet-500 to-purple-600"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
            ),
            title: "Smart University Match",
            description: "Get categorized recommendations into Dream, Target, and Safe schools based on your academic profile and preferences.",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
            ),
            title: "Complete Application Tracker",
            description: "From SOPs to LORs, track every document and deadline with AI-generated tasks that keep you on schedule.",
            gradient: "from-emerald-500 to-teal-500"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
            ),
            title: "Global University Database",
            description: "Access comprehensive data on 500+ universities across 8+ countries including USA, UK, Canada, and Australia.",
            gradient: "from-orange-500 to-amber-500"
        }
    ];

    const steps = [
        { number: "01", title: "Build Your Profile", description: "Complete your academic profile with GPA, test scores, and preferences" },
        { number: "02", title: "Discover Universities", description: "Get AI-curated recommendations tailored to your unique profile" },
        { number: "03", title: "Lock Your Choice", description: "Compare, analyze, and lock your target university" },
        { number: "04", title: "Track & Apply", description: "Follow guided steps with AI-generated tasks to submission" }
    ];

    const universities = [
        { name: "MIT", country: "USA", logo: "🏛️" },
        { name: "Oxford", country: "UK", logo: "🎓" },
        { name: "Stanford", country: "USA", logo: "🌲" },
        { name: "Cambridge", country: "UK", logo: "📚" },
        { name: "Toronto", country: "Canada", logo: "🍁" },
        { name: "Melbourne", country: "Australia", logo: "🦘" },
    ];

    return (
        <div className="min-h-screen bg-themed text-themed overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Gradient Mesh */}
                <div
                    className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full opacity-30"
                    style={{
                        background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
                        transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                />
                <div
                    className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full opacity-30"
                    style={{
                        background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
                        transform: `translate(${-mousePosition.x * 1.5}px, ${mousePosition.y * 1.5}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                />
                <div
                    className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)',
                        transform: `translate(${mousePosition.x}px, ${-mousePosition.y}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                />

                {/* Floating Particles */}
                <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-primary/30 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                         linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            {/* Navigation */}
            <nav
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
                style={{
                    backgroundColor: scrollY > 50 ? 'var(--bg-nav)' : 'transparent',
                    backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
                    borderBottom: scrollY > 50 ? '1px solid var(--border-color)' : 'none'
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:shadow-primary/40 transition-shadow">
                                A
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                <span className="text-[8px] text-white">AI</span>
                            </div>
                        </div>
                        <div>
                            <span className="font-display font-bold text-lg">Counselix</span>
                            <span className="hidden sm:block text-xs text-themed-muted">Study Abroad Guide</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="btn btn-primary group"
                            >
                                <span>Dashboard</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="hidden sm:flex btn btn-ghost"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn btn-primary group"
                                >
                                    <span>Get Started</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-6">
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    {/* Announcement Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(236,72,153,0.1) 100%)',
                            border: '1px solid rgba(99,102,241,0.2)',
                            animation: 'slideDown 0.6s ease-out'
                        }}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-themed-secondary">Powered by Advanced AI</span>
                        <span className="text-primary font-medium">• Free to Use</span>
                    </div>

                    {/* Main Heading */}
                    <h1
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-display leading-[1.1] mb-6"
                        style={{ animation: 'slideUp 0.8s ease-out' }}
                    >
                        <span className="block">Your Dream University</span>
                        <span className="block mt-2">
                            <span className="relative">
                                <span className="text-gradient">Starts Here</span>
                                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8">
                                    <path
                                        d="M0 4 Q50 0, 100 4 T200 4"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </span>
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p
                        className="text-lg sm:text-xl md:text-2xl text-themed-secondary max-w-3xl mx-auto mb-12 leading-relaxed"
                        style={{ animation: 'slideUp 1s ease-out' }}
                    >
                        Navigate your international education journey with an AI counsellor
                        that understands you. Get personalized university matches, application
                        tracking, and expert guidance—all in one place.
                    </p>

                    {/* CTA Buttons */}
                    <div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                        style={{ animation: 'slideUp 1.2s ease-out' }}
                    >
                        <Link
                            to="/register"
                            className="group relative px-8 py-4 rounded-2xl font-semibold text-lg text-white overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.4)'
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Free Journey
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>
                        <Link
                            to="/login"
                            className="group px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-themed hover:border-primary transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Watch Demo
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div
                        className="flex flex-wrap items-center justify-center gap-8 text-themed-muted"
                        style={{ animation: 'fadeIn 1.4s ease-out' }}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>No Credit Card Required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>500+ Universities</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>24/7 AI Support</span>
                        </div>
                    </div>
                </div>

                {/* Floating University Cards (Decorative) */}
                <div className="hidden lg:block absolute top-1/4 left-10 animate-float" style={{ animationDelay: '0s' }}>
                    <div className="card p-4 flex items-center gap-3 shadow-xl">
                        <span className="text-2xl">🎓</span>
                        <div>
                            <div className="text-sm font-semibold">Oxford</div>
                            <div className="text-xs text-themed-muted">Dream School</div>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:block absolute top-1/3 right-10 animate-float" style={{ animationDelay: '1s' }}>
                    <div className="card p-4 flex items-center gap-3 shadow-xl">
                        <span className="text-2xl">🌟</span>
                        <div>
                            <div className="text-sm font-semibold">Match Found!</div>
                            <div className="text-xs text-emerald-500">95% Fit Score</div>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:block absolute bottom-1/4 left-20 animate-float" style={{ animationDelay: '2s' }}>
                    <div className="card p-4 flex items-center gap-3 shadow-xl">
                        <span className="text-2xl">✅</span>
                        <div>
                            <div className="text-sm font-semibold">SOP Complete</div>
                            <div className="text-xs text-themed-muted">Task Done</div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-themed-muted animate-bounce">
                    <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-6"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(236,72,153,0.05) 100%)',
                            borderRadius: '2rem',
                            padding: '3rem',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        {[
                            { value: "500+", label: "Universities", icon: "🏛️" },
                            { value: "8+", label: "Countries", icon: "🌍" },
                            { value: "24/7", label: "AI Support", icon: "🤖" },
                            { value: "100%", label: "Free to Use", icon: "🎁" }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                                <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                                <div className="text-themed-muted text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
                            Features
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
                            Everything You Need to
                            <span className="block text-gradient">Succeed Abroad</span>
                        </h2>
                        <p className="text-themed-secondary text-lg max-w-2xl mx-auto">
                            From discovering the perfect university to submitting your application,
                            our AI guides you through every step.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="group relative p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                {/* Gradient Border on Hover */}
                                <div
                                    className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                                />

                                <div
                                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6 shadow-lg`}
                                >
                                    {feature.icon}
                                </div>

                                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-themed-secondary leading-relaxed">{feature.description}</p>

                                <div className="mt-6 flex items-center gap-2 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Learn more</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="relative py-32 px-6 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>

                <div className="max-w-6xl mx-auto relative">
                    <div className="text-center mb-20">
                        <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary mb-4">
                            How It Works
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
                            Four Steps to Your
                            <span className="block text-gradient">Dream University</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {steps.map((step, idx) => (
                            <div
                                key={idx}
                                className="relative group"
                            >
                                {/* Connector Line */}
                                {idx < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-primary/30 to-transparent z-0" />
                                )}

                                <div className="relative z-10 text-center">
                                    <div
                                        className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl text-2xl font-bold text-white mb-6 transition-transform group-hover:scale-110"
                                        style={{
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                            boxShadow: '0 15px 30px -10px rgba(99, 102, 241, 0.4)'
                                        }}
                                    >
                                        {step.number}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                    <p className="text-themed-secondary text-sm leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* University Marquee */}
            <section className="py-20 overflow-hidden">
                <div className="text-center mb-12">
                    <p className="text-themed-muted">Universities from around the world</p>
                </div>
                <div className="relative">
                    <div className="flex gap-8 animate-marquee">
                        {[...universities, ...universities].map((uni, idx) => (
                            <div
                                key={idx}
                                className="flex-shrink-0 flex items-center gap-4 px-8 py-4 rounded-2xl"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                <span className="text-3xl">{uni.logo}</span>
                                <div>
                                    <div className="font-semibold">{uni.name}</div>
                                    <div className="text-sm text-themed-muted">{uni.country}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div
                        className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(236,72,153,0.1) 100%)',
                            border: '1px solid rgba(99,102,241,0.2)'
                        }}
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
                                Ready to Begin Your
                                <span className="block text-gradient">Journey Abroad?</span>
                            </h2>
                            <p className="text-themed-secondary text-lg mb-10 max-w-xl mx-auto">
                                Join thousands of students who are using AI to navigate their
                                international education dreams. It's free to get started.
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-semibold text-lg text-white transition-all duration-300 hover:scale-105"
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.4)'
                                }}
                            >
                                <span>Get Started for Free</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-12 px-6 border-t border-themed">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">
                                A
                            </div>
                            <div>
                                <span className="font-display font-bold">AI Counsellor</span>
                                <span className="block text-xs text-themed-muted">© 2025 All rights reserved</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 text-sm text-themed-muted">
                            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                            <a href="#" className="hover:text-primary transition-colors">Terms</a>
                            <a href="#" className="hover:text-primary transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Custom Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Landing;
