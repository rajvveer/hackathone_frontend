import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ backgroundColor: 'var(--bg-nav)', borderColor: 'var(--border-color)' }}>
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Hamburger + Brand */}
                    <div className="flex items-center gap-3">
                        {/* Hamburger Menu (Mobile Only - sidebar is always visible on desktop) */}
                        {onToggleSidebar && (
                            <button
                                onClick={onToggleSidebar}
                                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-themed-card"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}

                        {/* Brand */}
                        <Link to="/dashboard" className="flex items-center gap-2 font-display font-bold text-xl hover:text-primary-light transition" style={{ color: 'var(--text-primary)' }}>
                            <span className="text-2xl">🎓</span>
                            <span className="hidden sm:inline">AI Counsellor</span>
                        </Link>
                    </div>

                    {/* Right: Theme Toggle + Profile + Logout */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-200 hover:scale-110"
                            style={{
                                background: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                color: isDark ? '#fbbf24' : '#6366f1'
                            }}
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>

                        <Link
                            to="/profile"
                            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-themed-card transition"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-semibold text-sm text-white">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="hidden md:inline text-sm font-medium">
                                {user?.name || 'User'}
                            </span>
                        </Link>
                        <button
                            onClick={logout}
                            className="btn btn-ghost text-sm px-3 py-1.5 hidden sm:inline-flex"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
