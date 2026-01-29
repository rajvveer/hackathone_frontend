import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authAPI.forgotPassword(email);
            setSuccess('OTP sent to your email');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authAPI.verifyOtp(email, otp);
            setSuccess('OTP verified successfully');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await authAPI.resetPassword(email, otp, newPassword);
            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-dark-900 via-dark-900 to-dark-800">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

            <div className="relative w-full max-w-md animate-slide-up">
                <div className="card-glass p-8">
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-4">🔐</div>
                        <h1 className="text-2xl font-bold font-display mb-2">Reset Password</h1>
                        <p className="text-gray-400">
                            {step === 1 && "Enter your email to receive an OTP"}
                            {step === 2 && "Enter the OTP sent to your email"}
                            {step === 3 && "Create a new password"}
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-0 mb-8">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= 1 ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'bg-dark-700 text-gray-500'}`}>1</div>
                        <div className="w-10 h-0.5 bg-dark-700"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= 2 ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'bg-dark-700 text-gray-500'}`}>2</div>
                        <div className="w-10 h-0.5 bg-dark-700"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= 3 ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'bg-dark-700 text-gray-500'}`}>3</div>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp}>
                            <div className="mb-6">
                                <label className="label">Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-full py-3.5" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-6">
                                <label className="label">Enter OTP</label>
                                <input
                                    type="text"
                                    className="input text-center text-2xl tracking-[0.5em] font-semibold"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    autoFocus
                                    maxLength={6}
                                />
                                <p className="text-xs text-gray-500 mt-2">Check your email for the 6-digit code</p>
                            </div>
                            <button type="submit" className="btn btn-primary w-full py-3.5" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button type="button" className="btn btn-ghost w-full mt-3" onClick={() => setStep(1)}>
                                Resend OTP
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-5">
                                <label className="label">New Password</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    autoFocus
                                    minLength={6}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="label">Confirm Password</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-full py-3.5" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-gray-400 mt-6">
                        <Link to="/login" className="text-primary-light hover:text-primary transition">
                            ← Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
