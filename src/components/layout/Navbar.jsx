import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300" style={{ backgroundColor: 'var(--bg-nav)', borderColor: 'var(--border-color)' }}>
            {/* Premium gradient line at top */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-pink-500 opacity-80" />

            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Hamburger + Brand */}
                    <div className="flex items-center gap-3">
                        {/* Hamburger Menu (Mobile Only - sidebar is always visible on desktop) */}
                        {onToggleSidebar && (
                            <button
                                onClick={onToggleSidebar}
                                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                                style={{ color: 'var(--text-primary)', background: 'var(--bg-card)' }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}

                        {/* Brand */}
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:shadow-primary/40 transition-shadow">
                                    A
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                    <span className="text-[8px] text-white">AI</span>
                                </div>
                            </div>
                            <div>
                                <span className="font-display font-bold text-lg text-themed">Counselix</span>
                                <span className="hidden sm:block text-xs text-themed-muted">Study Abroad Guide</span>
                            </div>
                        </Link>
                    </div>

                    {/* Right: Theme Toggle + Profile + Logout */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 hover:rotate-12"
                            style={{
                                background: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                color: isDark ? '#fbbf24' : '#6366f1',
                                boxShadow: isDark ? '0 0 15px rgba(251, 191, 36, 0.2)' : '0 0 15px rgba(99, 102, 241, 0.15)'
                            }}
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>

                        {/* Profile */}
                        <Link
                            to="/profile"
                            className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                            style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
                        >
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-secondary to-pink-500 flex items-center justify-center font-semibold text-sm text-white shadow-lg">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="absolute inset-0 rounded-full animate-pulse-glow opacity-50" />
                            </div>
                            <span className="hidden md:inline text-sm font-medium">
                                {user?.name || 'User'}
                            </span>
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="btn btn-ghost text-sm px-3 py-1.5 hidden sm:inline-flex hover:text-red-500 transition-colors"
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
