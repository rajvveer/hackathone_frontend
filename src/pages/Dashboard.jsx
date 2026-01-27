import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, tasksAPI, shortlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

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
                tasksAPI.getAll()
            ]);
            setData(dashboardRes.data);
            setTasks(tasksRes.data.tasks || tasksRes.data || []);
        } catch (err) {
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
            setTasks(prev => prev.map(t =>
                t.id === taskId
                    ? { ...t, status: currentStatus === 'completed' ? 'pending' : 'completed' }
                    : t
            ));
        } catch (err) {
            console.error('Failed to toggle task:', err);
        }
    };

    if (loading) return <Loader />;
    if (error) return <div className="alert alert-error">{error}</div>;

    const { profile_summary, profile_strength, current_stage, stats, locked_university } = data || {};

    // Calculate real task stats from fetched tasks
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');
    const taskProgress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

    const strengthColors = {
        'Strong': 'text-emerald-400',
        'Average': 'text-amber-400',
        'Weak': 'text-red-400',
    };

    const getStrengthPercentage = () => {
        if (!profile_strength) return 0;
        return Math.round((profile_strength.score / profile_strength.max_score) * 100);
    };

    return (
        <div className="space-y-6 pb-20 md:pb-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-display">
                    Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>! 👋
                </h1>
                <p className="text-gray-400 mt-1">
                    Here's your study abroad journey at a glance
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon="🎓"
                    value={stats?.shortlisted || 0}
                    label="Universities"
                    color="primary"
                />
                <StatCard
                    icon="✅"
                    value={completedTasks.length}
                    label="Completed"
                    color="emerald"
                />
                <StatCard
                    icon="📋"
                    value={pendingTasks.length}
                    label="Pending"
                    color="amber"
                />
                <StatCard
                    icon="📊"
                    value={`${taskProgress}%`}
                    label="Progress"
                    color="purple"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Strength */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Profile Strength</h3>
                        <div className="flex justify-center mb-4">
                            <div className="relative w-28 h-28">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="56"
                                        cy="56"
                                        r="48"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        className="text-dark-700"
                                    />
                                    <circle
                                        cx="56"
                                        cy="56"
                                        r="48"
                                        stroke="url(#gradient)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${getStrengthPercentage() * 3.02} 302`}
                                        className="transition-all duration-1000"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold">{getStrengthPercentage()}%</span>
                                    <span className={`text-xs font-medium ${strengthColors[profile_strength?.overall]}`}>
                                        {profile_strength?.overall || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            {profile_strength?.details && Object.entries(profile_strength.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                    <span className="text-gray-400 capitalize">{key}</span>
                                    <span className={`${strengthColors[value] || 'text-gray-300'}`}>
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Profile Summary */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-3">Profile</h3>
                        <div className="space-y-2 text-sm">
                            <ProfileRow label="Target" value={profile_summary?.target_degree} />
                            <ProfileRow label="Intake" value={profile_summary?.intake} />
                            <ProfileRow label="Budget" value={profile_summary?.budget} />
                        </div>
                        <Link to="/profile" className="text-primary-light text-sm hover:underline mt-3 block">
                            Edit Profile →
                        </Link>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Stage */}
                    <div className="card">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-xl font-bold">
                                {user?.stage || 1}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{current_stage?.name || 'Getting Started'}</h3>
                                <p className="text-sm text-gray-400">{current_stage?.description}</p>
                            </div>
                        </div>
                        {/* Stage Progress */}
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((stage) => (
                                <div key={stage} className="flex-1">
                                    <div className={`h-2 rounded-full ${stage <= (user?.stage || 1)
                                            ? 'bg-gradient-to-r from-primary to-secondary'
                                            : 'bg-dark-700'
                                        }`}></div>
                                    <p className={`text-xs mt-1 ${stage <= (user?.stage || 1) ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {stage === 1 && 'Profile'}
                                        {stage === 2 && 'Discover'}
                                        {stage === 3 && 'Finalize'}
                                        {stage === 4 && 'Apply'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Locked University */}
                    {locked_university && (
                        <div className="card bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🔒</span>
                                    <div>
                                        <p className="text-sm text-emerald-400">Locked University</p>
                                        <h3 className="font-semibold">{locked_university.uni_name}</h3>
                                        <p className="text-sm text-gray-400">{locked_university.country}</p>
                                    </div>
                                </div>
                                <Link to="/application" className="btn btn-primary text-sm">
                                    View Guide →
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Your Tasks (Real tasks from database) */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Your Tasks</h3>
                            <Link to="/tasks" className="text-sm text-primary-light hover:underline">
                                View All →
                            </Link>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="text-center py-6 text-gray-400">
                                <p>No tasks yet. Chat with AI Counsellor to get started!</p>
                                <Link to="/chat" className="btn btn-primary mt-3">
                                    💬 Talk to AI
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pendingTasks.slice(0, 5).map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskToggle(task.id, task.status)}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] cursor-pointer transition-all"
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.priority === 'high'
                                                ? 'border-amber-500'
                                                : 'border-gray-500'
                                            }`}>
                                        </div>
                                        <span className="flex-1 text-sm">{task.title}</span>
                                        {task.priority === 'high' && (
                                            <span className="text-xs text-amber-400">High</span>
                                        )}
                                    </div>
                                ))}
                                {pendingTasks.length > 5 && (
                                    <p className="text-sm text-gray-500 text-center pt-2">
                                        +{pendingTasks.length - 5} more tasks
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/chat" className="card hover:border-primary/50 transition-all">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">💬</span>
                                <div>
                                    <h4 className="font-semibold">AI Counsellor</h4>
                                    <p className="text-xs text-gray-500">Get advice</p>
                                </div>
                            </div>
                        </Link>
                        <Link to="/recommendations" className="card hover:border-primary/50 transition-all">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🎓</span>
                                <div>
                                    <h4 className="font-semibold">Universities</h4>
                                    <p className="text-xs text-gray-500">Explore options</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon, value, label, color }) => {
    const colorClasses = {
        primary: 'from-primary/20 to-primary/5 border-primary/20',
        emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
        amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
        purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
    };

    return (
        <div className={`card bg-gradient-to-br ${colorClasses[color]}`}>
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
        </div>
    );
};

// Profile Row Component
const ProfileRow = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-300">{value || 'Not set'}</span>
    </div>
);

export default Dashboard;
