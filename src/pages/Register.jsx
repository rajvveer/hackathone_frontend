import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(name, email, password);
            navigate('/onboarding');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep = () => {
        if (!name.trim() || !email.trim()) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setStep(2);
    };

    const passwordStrength = () => {
        if (password.length === 0) return { level: 0, text: '', color: '' };
        if (password.length < 6) return { level: 1, text: 'Weak', color: 'bg-red-500' };
        if (password.length < 10) return { level: 2, text: 'Medium', color: 'bg-amber-500' };
        return { level: 3, text: 'Strong', color: 'bg-emerald-500' };
    };

    const strength = passwordStrength();

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Left Side - Simple & Clean */}
            <div className="hidden lg:flex lg:w-1/2 relative" style={{ background: 'var(--bg-secondary)' }}>
                {/* Subtle Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white text-2xl font-bold">
                            A
                        </div>
                        <span className="font-display font-bold text-xl text-themed">AI Counsellor</span>
                    </Link>

                    {/* Main Message */}
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold font-display mb-6 leading-tight text-themed">
                            Start your journey
                        </h1>
                        <p className="text-themed-secondary text-lg leading-relaxed mb-10">
                            Join thousands of students using AI to find their perfect
                            university match and navigate the application process.
                        </p>

                        {/* Process Steps */}
                        <div className="space-y-4">
                            {[
                                { num: '01', text: 'Create your profile' },
                                { num: '02', text: 'Get AI recommendations' },
                                { num: '03', text: 'Track applications' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                                        {item.num}
                                    </div>
                                    <span className="text-themed-secondary">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8">
                        {[
                            { value: '500+', label: 'Universities' },
                            { value: '8+', label: 'Countries' },
                            { value: '24/7', label: 'AI Support' }
                        ].map((stat, idx) => (
                            <div key={idx}>
                                <div className="text-2xl font-bold text-themed">{stat.value}</div>
                                <div className="text-themed-muted text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white text-xl font-bold">
                                A
                            </div>
                            <span className="font-display font-bold text-xl text-themed">AI Counsellor</span>
                        </Link>
                    </div>

                    {/* Form Card */}
                    <div
                        className="rounded-3xl p-8 lg:p-10"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold font-display mb-2 text-themed">
                                Create Account
                            </h1>
                            <p className="text-themed-secondary">
                                {step === 1 ? 'Enter your details to get started' : 'Create a secure password'}
                            </p>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 1
                                    ? 'bg-primary text-white'
                                    : 'bg-themed-card text-themed-muted border border-themed'
                                }`}>
                                1
                            </div>
                            <div className={`w-16 h-1 rounded-full transition-all ${step >= 2 ? 'bg-primary' : ''
                                }`} style={{ background: step >= 2 ? undefined : 'var(--border-color)' }} />
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 2
                                    ? 'bg-primary text-white'
                                    : 'bg-themed-card text-themed-muted border border-themed'
                                }`}>
                                2
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* Step 1: Name & Email */}
                            {step === 1 && (
                                <>
                                    {/* Name Field */}
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-themed-secondary mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-themed-muted">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                className="input pl-12"
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-themed-secondary mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-themed-muted">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="email"
                                                className="input pl-12"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="btn btn-primary w-full py-4 text-base"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            Continue
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </button>
                                </>
                            )}

                            {/* Step 2: Password */}
                            {step === 2 && (
                                <>
                                    {/* Password Field */}
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-themed-secondary mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-themed-muted">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className="input pl-12 pr-12"
                                                placeholder="Create a password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed-secondary transition-colors"
                                            >
                                                {showPassword ? (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>

                                        {/* Password Strength Indicator */}
                                        {password.length > 0 && (
                                            <div className="mt-3">
                                                <div className="flex gap-1 mb-1">
                                                    {[1, 2, 3].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`h-1 flex-1 rounded-full transition-all ${strength.level >= level ? strength.color : ''
                                                                }`}
                                                            style={{ background: strength.level >= level ? undefined : 'var(--border-color)' }}
                                                        />
                                                    ))}
                                                </div>
                                                <p className={`text-xs ${strength.level === 1 ? 'text-red-500' :
                                                        strength.level === 2 ? 'text-amber-500' : 'text-emerald-500'
                                                    }`}>
                                                    {strength.text} password
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-themed-secondary mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-themed-muted">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="password"
                                                className="input pl-12"
                                                placeholder="Confirm your password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                            {confirmPassword.length > 0 && password === confirmPassword && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-4 rounded-xl font-semibold text-base border transition-all hover:bg-themed-card"
                                            style={{
                                                borderColor: 'var(--border-color)',
                                                color: 'var(--text-secondary)'
                                            }}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                                </svg>
                                                Back
                                            </span>
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary flex-[2] py-4 text-base"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Creating...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    Create Account
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
                            <span className="text-themed-muted text-sm">or</span>
                            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
                        </div>

                        {/* Sign In Link */}
                        <p className="text-center text-themed-secondary">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary font-medium hover:text-primary-dark transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-8">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-themed-muted hover:text-themed-secondary transition-colors text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
