import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, tasksAPI } from '../services/api';
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
                tasksAPI.getAll(),
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

    if (loading) return <Loader />;
    if (error) return <div className="alert alert-error">{error}</div>;

    const {
        profile_summary,
        profile_strength,
        current_stage,
        stats,
        locked_university,
    } = data || {};

    const pendingTasks = tasks.filter((t) => t.status === 'pending');
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const taskProgress =
        tasks.length > 0
            ? Math.round((completedTasks.length / tasks.length) * 100)
            : 0;

    const strengthColors = {
        Strong: 'text-emerald-400',
        Average: 'text-amber-400',
        Weak: 'text-red-400',
    };

    const getStrengthPercentage = () => {
        if (!profile_strength) return 0;
        return Math.round(
            (profile_strength.score / profile_strength.max_score) * 100
        );
    };

    return (
        <div className="space-y-8 pb-20 md:pb-6">
            {/* Welcome Header */}
            <div className="animate-fade-in">
                <h1 className="text-2xl md:text-3xl font-bold font-display">
                    Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-400 mt-2">
                    Here's your study abroad journey at a glance
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
                <StatCard
                    icon="🎓"
                    value={stats?.shortlisted || 0}
                    label="Universities"
                    color="bg-primary/10 border-primary/30"
                />
                <StatCard
                    icon="✅"
                    value={completedTasks.length}
                    label="Completed"
                    color="bg-emerald-500/10 border-emerald-500/30"
                />
                <StatCard
                    icon="📋"
                    value={pendingTasks.length}
                    label="Pending"
                    color="bg-amber-500/10 border-amber-500/30"
                />
                <StatCard
                    icon="📊"
                    value={`${taskProgress}%`}
                    label="Progress"
                    color="bg-purple-500/10 border-purple-500/30"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Info */}
                <div className="space-y-6">
                    {/* Profile Strength */}
                    <div className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                        <h3 className="text-lg font-semibold mb-6">Profile Strength</h3>
                        <div className="flex justify-center mb-6">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="52"
                                        stroke="currentColor"
                                        strokeWidth="10"
                                        fill="none"
                                        className="text-dark-700"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="52"
                                        stroke="currentColor"
                                        strokeWidth="10"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${getStrengthPercentage() * 3.27} 327`}
                                        className="text-primary transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold">
                                        {getStrengthPercentage()}%
                                    </span>
                                    <span
                                        className={`text-sm font-medium ${strengthColors[profile_strength?.overall]
                                            }`}
                                    >
                                        {profile_strength?.overall || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            {profile_strength?.details &&
                                Object.entries(profile_strength.details).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                                    >
                                        <span className="text-gray-400 capitalize">{key}</span>
                                        <span
                                            className={`font-medium ${strengthColors[value] || 'text-gray-300'
                                                }`}
                                        >
                                            {value}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Quick Profile Summary */}
                    <div className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                        <h3 className="text-lg font-semibold mb-4">Profile Summary</h3>
                        <div className="space-y-3 text-sm">
                            <ProfileRow
                                label="Target Degree"
                                value={profile_summary?.target_degree}
                            />
                            <ProfileRow label="Intake" value={profile_summary?.intake} />
                            <ProfileRow label="Budget" value={profile_summary?.budget} />
                        </div>
                        <Link
                            to="/profile"
                            className="inline-flex items-center gap-1 text-primary-light text-sm hover:gap-2 transition-all mt-4"
                        >
                            Edit Profile <span>→</span>
                        </Link>
                    </div>
                </div>

                {/* Right Column - Actions & Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Stage */}
                    <div className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-xl font-bold">
                                {user?.stage || 1}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {current_stage?.name || 'Getting Started'}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {current_stage?.description}
                                </p>
                            </div>
                        </div>

                        {/* Stage Progress */}
                        <div className="flex gap-2">
                            {[
                                { num: 1, label: 'Profile' },
                                { num: 2, label: 'Discover' },
                                { num: 3, label: 'Finalize' },
                                { num: 4, label: 'Apply' },
                            ].map((stage) => (
                                <div key={stage.num} className="flex-1">
                                    <div
                                        className={`h-2.5 rounded-full transition-all duration-500 ${stage.num <= (user?.stage || 1)
                                            ? 'bg-primary'
                                            : 'bg-dark-700'
                                            }`}
                                    />
                                    <p
                                        className={`text-xs mt-2 text-center ${stage.num <= (user?.stage || 1)
                                            ? 'text-gray-300 font-medium'
                                            : 'text-gray-600'
                                            }`}
                                    >
                                        {stage.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Locked University */}
                    {locked_university && (
                        <div className="card bg-emerald-500/5 border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all duration-200">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl">
                                        🔒
                                    </div>
                                    <div>
                                        <p className="text-xs text-emerald-400 font-medium mb-0.5">
                                            Locked University
                                        </p>
                                        <h3 className="font-semibold text-lg">
                                            {locked_university.uni_name}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {locked_university.country}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/application"
                                    className="btn btn-primary hover:shadow-lg transition-all"
                                >
                                    View Guide →
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Your Tasks */}
                    <div className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Your Tasks</h3>
                            <Link
                                to="/tasks"
                                className="text-sm text-primary-light hover:gap-1.5 inline-flex items-center gap-1 transition-all"
                            >
                                View All <span>→</span>
                            </Link>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <div className="text-4xl mb-3">📝</div>
                                <p className="mb-4">
                                    No tasks yet. Chat with AI Counsellor to get started!
                                </p>
                                <Link
                                    to="/chat"
                                    className="btn btn-primary hover:shadow-lg transition-all inline-flex items-center gap-2"
                                >
                                    <span>💬</span> Talk to AI
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pendingTasks.slice(0, 5).map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskToggle(task.id, task.status)}
                                        className="flex items-center gap-3 p-4 rounded-lg bg-dark-800/50 border border-white/5 hover:bg-dark-800 hover:border-white/10 hover:shadow-md cursor-pointer transition-all duration-200 group"
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.priority === 'high'
                                                ? 'border-amber-500 group-hover:bg-amber-500/10'
                                                : 'border-gray-500 group-hover:border-gray-400'
                                                }`}
                                        />
                                        <span className="flex-1 text-sm group-hover:text-gray-200 transition-colors">
                                            {task.title}
                                        </span>
                                        {task.priority === 'high' && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                High
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {pendingTasks.length > 5 && (
                                    <p className="text-sm text-gray-500 text-center pt-3">
                                        +{pendingTasks.length - 5} more tasks
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            to="/chat"
                            className="card hover:border-primary/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    💬
                                </div>
                                <div>
                                    <h4 className="font-semibold group-hover:text-primary-light transition-colors">
                                        AI Counsellor
                                    </h4>
                                    <p className="text-xs text-gray-500">Get personalized advice</p>
                                </div>
                            </div>
                        </Link>
                        <Link
                            to="/recommendations"
                            className="card hover:border-primary/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    🎓
                                </div>
                                <div>
                                    <h4 className="font-semibold group-hover:text-primary-light transition-colors">
                                        Universities
                                    </h4>
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
    return (
        <div
            className={`card ${color} hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
        >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
                {label}
            </div>
        </div>
    );
};

// Profile Row Component
const ProfileRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-300 font-medium">{value || 'Not set'}</span>
    </div>
);

export default Dashboard;
