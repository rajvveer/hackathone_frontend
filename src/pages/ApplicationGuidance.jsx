import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI, shortlistAPI, tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const ApplicationGuidance = () => {
    const { user } = useAuth();
    const [guidance, setGuidance] = useState(null);
    const [university, setUniversity] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedPhase, setExpandedPhase] = useState(0);
    const [checkedDocs, setCheckedDocs] = useState(() => {
        const saved = localStorage.getItem('applicationDocs');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        fetchData();
    }, []);

    // Save document checks to localStorage
    useEffect(() => {
        localStorage.setItem('applicationDocs', JSON.stringify(checkedDocs));
    }, [checkedDocs]);

    const fetchData = async () => {
        try {
            const [guidanceRes, shortlistRes, tasksRes] = await Promise.all([
                applicationAPI.getGuidance(),
                shortlistAPI.get(),
                tasksAPI.getAll()
            ]);
            setGuidance(guidanceRes.data);
            setTasks(tasksRes.data.tasks || tasksRes.data || []);

            const shortlists = shortlistRes.data.shortlists || shortlistRes.data || [];
            const lockedId = shortlistRes.data.locked_id || user?.locked_university_id;

            let locked = shortlists.find(u => u.id === lockedId);
            if (!locked) {
                locked = shortlists.find(u => u.is_locked === true);
            }
            setUniversity(locked);
        } catch (err) {
            setError('Failed to load application guidance');
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
            // Update local state
            setTasks(prev => prev.map(t =>
                t.id === taskId
                    ? { ...t, status: currentStatus === 'completed' ? 'pending' : 'completed' }
                    : t
            ));
        } catch (err) {
            console.error('Failed to toggle task:', err);
        }
    };

    const toggleDocCheck = (docName) => {
        setCheckedDocs(prev => ({
            ...prev,
            [docName]: !prev[docName]
        }));
    };

    if (loading) return <Loader />;

    if (!university) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="text-6xl mb-4 animate-bounce">🔒</div>
                <h1 className="text-2xl font-bold mb-2">Application Guidance Locked</h1>
                <p className="text-gray-400 mb-6">
                    You need to lock a university before accessing application guidance.
                    This ensures personalized advice for your specific application.
                </p>
                <Link to="/shortlist" className="btn btn-primary">
                    Go to Shortlist →
                </Link>
            </div>
        );
    }

    // Calculate progress
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const documents = [
        { name: 'Statement of Purpose (SOP)', desc: '500-1000 words explaining your goals', icon: '✍️' },
        { name: 'Letters of Recommendation', desc: '2-3 letters from professors/employers', icon: '📧' },
        { name: 'Academic Transcripts', desc: 'Official transcripts from all institutions', icon: '📄' },
        { name: 'Language Test Score', desc: 'IELTS/TOEFL score report', icon: '📝' },
        { name: 'Resume/CV', desc: 'Updated academic and professional resume', icon: '📋' },
        { name: 'Financial Proof', desc: 'Bank statements, scholarship letters', icon: '💰' },
        { name: 'Passport Copy', desc: 'Valid passport with 6+ months validity', icon: '🛂' },
        { name: 'Photographs', desc: 'Passport-size photos as per requirements', icon: '📸' },
    ];

    const checkedDocsCount = Object.values(checkedDocs).filter(Boolean).length;
    const docProgress = Math.round((checkedDocsCount / documents.length) * 100);

    const timeline = [
        {
            month: 'Month 1-2',
            title: 'Research & Preparation',
            icon: '🔍',
            color: 'from-blue-500 to-cyan-500',
            tasks: [
                'Finalize university choice',
                'Research program requirements',
                'Start SOP draft',
                'Book language test date'
            ]
        },
        {
            month: 'Month 2-3',
            title: 'Document Preparation',
            icon: '📝',
            color: 'from-purple-500 to-pink-500',
            tasks: [
                'Complete SOP drafts',
                'Request LORs from recommenders',
                'Gather official transcripts',
                'Take language test'
            ]
        },
        {
            month: 'Month 3-4',
            title: 'Application Submission',
            icon: '🚀',
            color: 'from-orange-500 to-red-500',
            tasks: [
                'Fill application forms',
                'Pay application fees',
                'Upload all documents',
                'Submit applications'
            ]
        },
        {
            month: 'Month 4-6',
            title: 'Post-Submission',
            icon: '⏳',
            color: 'from-emerald-500 to-teal-500',
            tasks: [
                'Track application status',
                'Prepare for interviews',
                'Plan visa documents',
                'Accept offer & confirm enrollment'
            ]
        },
    ];

    // Group tasks by category for display
    const tasksByCategory = tasks.reduce((acc, task) => {
        const cat = task.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(task);
        return acc;
    }, {});

    const categoryIcons = {
        sop: '✍️',
        lor: '📧',
        documents: '📄',
        exams: '📝',
        visa: '🛂',
        research: '🔍',
        profile: '👤',
        other: '📌'
    };

    const categoryNames = {
        sop: 'Statement of Purpose',
        lor: 'Letters of Recommendation',
        documents: 'Documents',
        exams: 'Exams & Tests',
        visa: 'Visa & Immigration',
        research: 'Research',
        profile: 'Profile',
        other: 'Other Tasks'
    };

    return (
        <div className="space-y-6 pb-20 md:pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display">Application Guidance</h1>
                    <p className="text-gray-400 mt-1">
                        Your personalized roadmap to {university.uni_name}
                    </p>
                </div>
                <Link to="/tasks" className="btn btn-secondary">
                    📋 View All Tasks
                </Link>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Target University Banner */}
            <div className="card bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl"></div>
                <div className="flex items-center gap-4 relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl shadow-lg shadow-primary/20">
                        🎯
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-primary-light font-medium">Your Target University</p>
                        <h2 className="text-2xl font-bold">{university.uni_name}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-gray-400">{university.country}</span>
                            {university.category && (
                                <span className={`badge ${university.category === 'Dream' ? 'bg-amber-500/20 text-amber-400' :
                                        university.category === 'Target' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                    {university.category}
                                </span>
                            )}
                        </div>
                    </div>
                    <Link to="/shortlist" className="btn btn-ghost text-sm">
                        🔓 Change
                    </Link>
                </div>
            </div>

            {/* Overall Progress */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">📋 Task Progress</h3>
                        <span className="text-2xl font-bold text-primary">{taskProgress}%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                            style={{ width: `${taskProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        {completedTasks} of {totalTasks} tasks completed
                    </p>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">📁 Documents Ready</h3>
                        <span className="text-2xl font-bold text-emerald-400">{docProgress}%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${docProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        {checkedDocsCount} of {documents.length} documents ready
                    </p>
                </div>
            </div>

            {/* Your Tasks (from backend) */}
            {tasks.length > 0 && (
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">✅ Your Application Tasks</h3>
                        <span className="badge bg-primary/20 text-primary-light">
                            {completedTasks}/{totalTasks} done
                        </span>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(tasksByCategory).map(([category, categoryTasks]) => (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{categoryIcons[category] || '📌'}</span>
                                    <h4 className="font-medium text-gray-300">{categoryNames[category] || category}</h4>
                                </div>
                                <div className="space-y-2 ml-6">
                                    {categoryTasks.map(task => (
                                        <div
                                            key={task.id}
                                            onClick={() => handleTaskToggle(task.id, task.status)}
                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                                                ${task.status === 'completed'
                                                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                                                    : 'bg-white/[0.02] border border-white/10 hover:bg-white/[0.05]'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                                ${task.status === 'completed'
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-gray-500 hover:border-primary'
                                                }`}
                                            >
                                                {task.status === 'completed' && (
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                                    {task.title}
                                                </p>
                                                {task.description && (
                                                    <p className="text-sm text-gray-500">{task.description}</p>
                                                )}
                                            </div>
                                            {task.priority === 'high' && task.status !== 'completed' && (
                                                <span className="badge badge-error text-xs">High Priority</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Interactive Timeline */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">📅 Application Timeline</h3>
                <div className="space-y-3">
                    {timeline.map((phase, idx) => (
                        <div
                            key={idx}
                            className={`rounded-xl border transition-all duration-300 overflow-hidden
                                ${expandedPhase === idx
                                    ? 'border-primary/50 bg-primary/5'
                                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                                }`}
                        >
                            <div
                                onClick={() => setExpandedPhase(expandedPhase === idx ? -1 : idx)}
                                className="flex items-center gap-4 p-4 cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center text-2xl shadow-lg`}>
                                    {phase.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-primary-light text-sm font-medium">{phase.month}</p>
                                    <h4 className="font-semibold">{phase.title}</h4>
                                </div>
                                <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${expandedPhase === idx ? 'rotate-180' : ''}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <div className={`overflow-hidden transition-all duration-300 ${expandedPhase === idx ? 'max-h-96' : 'max-h-0'}`}>
                                <div className="px-4 pb-4 pt-0">
                                    <div className="pl-16 space-y-2">
                                        {phase.tasks.map((task, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.03]">
                                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary"></div>
                                                <span className="text-gray-300">{task}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Document Checklist */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">📁 Document Checklist</h3>
                    <span className="text-sm text-gray-400">
                        Click to mark as ready
                    </span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                    {documents.map((doc, idx) => (
                        <div
                            key={idx}
                            onClick={() => toggleDocCheck(doc.name)}
                            className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all
                                ${checkedDocs[doc.name]
                                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                                    : 'bg-white/[0.02] border border-white/10 hover:bg-white/[0.05]'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all
                                ${checkedDocs[doc.name]
                                    ? 'bg-emerald-500/20'
                                    : 'bg-white/10'
                                }`}
                            >
                                {checkedDocs[doc.name] ? '✅' : doc.icon}
                            </div>
                            <div className="flex-1">
                                <p className={`font-medium ${checkedDocs[doc.name] ? 'text-emerald-400' : ''}`}>
                                    {doc.name}
                                </p>
                                <p className="text-sm text-gray-500">{doc.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
                <Link
                    to="/chat"
                    className="card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            💬
                        </div>
                        <div>
                            <h4 className="font-semibold">Ask AI Counsellor</h4>
                            <p className="text-sm text-gray-400">Get help with SOP, interviews</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/tasks"
                    className="card bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:border-amber-500/40 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            📝
                        </div>
                        <div>
                            <h4 className="font-semibold">Manage Tasks</h4>
                            <p className="text-sm text-gray-400">Track your to-do list</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/recommendations"
                    className="card bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            🎓
                        </div>
                        <div>
                            <h4 className="font-semibold">Explore More</h4>
                            <p className="text-sm text-gray-400">View other universities</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Motivational Footer */}
            <div className="card bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-white/10 text-center py-8">
                <div className="text-4xl mb-3">🌟</div>
                <h3 className="text-xl font-semibold mb-2">You're making great progress!</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                    Stay consistent with your preparation. Every task completed brings you closer to {university.uni_name}.
                </p>
            </div>
        </div>
    );
};

export default ApplicationGuidance;
