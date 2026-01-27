import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/chat', label: 'AI Counsellor', icon: '💬' },
        { path: '/recommendations', label: 'Universities', icon: '🎓' },
        { path: '/shortlist', label: 'Shortlist', icon: '⭐' },
        { path: '/tasks', label: 'Tasks', icon: '✓' },
    ];

    if (user?.stage === 4) {
        navLinks.push({ path: '/application', label: 'Application', icon: '📝' });
    }

    return (
        <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link to="/dashboard" className="flex items-center gap-2 font-display font-bold text-xl text-white hover:text-primary-light transition">
                        <span className="text-2xl">🎓</span>
                        <span className="hidden sm:inline">AI Counsellor</span>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ path, label, icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(path)
                                        ? 'bg-white/10 text-primary-light'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span>{icon}</span>
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/profile"
                            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-semibold text-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="hidden sm:inline text-sm font-medium text-gray-300">
                                {user?.name || 'User'}
                            </span>
                        </Link>
                        <button
                            onClick={logout}
                            className="btn btn-ghost text-sm px-3 py-1.5"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-white/10 px-2 py-2 z-50">
                <div className="flex justify-around">
                    {navLinks.slice(0, 5).map(({ path, label, icon }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition ${isActive(path)
                                    ? 'text-primary-light'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <span className="text-lg">{icon}</span>
                            <span>{label.split(' ')[0]}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
