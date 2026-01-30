import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/chat', label: 'AI Counsellor', icon: '💬' },
        { path: '/recommendations', label: 'Universities', icon: '🎓' },
        { path: '/shortlist', label: 'Shortlist', icon: '⭐' },
        { path: '/tasks', label: 'Tasks', icon: '✓' },
    ];

    if (user?.locked_university_id) {
        navLinks.push({ path: '/sop-helper', label: 'SOP Helper', icon: '✍️' });
        navLinks.push({ path: '/application', label: 'Application', icon: '📝' });
    }

    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Backdrop - Only shows on mobile when sidebar is open */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSidebar}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Panel - Fixed on desktop, slide-in on mobile */}
            <aside
                className={`
                    fixed top-16 left-0 h-[calc(100vh-64px)] w-72 z-40
                    bg-themed border-r border-themed flex flex-col shrink-0
                    transition-transform duration-300 ease-in-out overflow-y-auto
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Mobile Header - Only shows on mobile */}
                <div className="flex lg:hidden items-center justify-between p-4 border-b border-themed">
                    <span className="font-display font-bold text-lg text-themed">Menu</span>
                    <button
                        onClick={closeSidebar}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-themed-card transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {navLinks.map(({ path, label, icon }) => (
                        <Link
                            key={path}
                            to={path}
                            onClick={closeSidebar}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                ${isActive(path)
                                    ? 'bg-primary/10 text-primary-light shadow-sm'
                                    : 'text-themed-secondary hover:bg-themed-card hover:text-themed'
                                }
                            `}
                        >
                            <span className="text-xl">{icon}</span>
                            <span>{label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-themed">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-themed-card">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-sm font-bold text-white">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-themed truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-themed-muted truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
