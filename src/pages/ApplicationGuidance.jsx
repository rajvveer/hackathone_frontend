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
                <h1 className="text-2xl font-bold mb-2 text-themed">Application Guidance Locked</h1>
                <p className="text-themed-secondary mb-6">
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
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-themed">Application Guidance</h1>
                    <p className="text-themed-secondary mt-1">
                        Your personalized roadmap to {university.uni_name}
                    </p>
                </div>
                <Link to="/tasks" className="btn btn-secondary border" style={{ borderColor: 'var(--border-color)' }}>
                    📋 View All Tasks
                </Link>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Target University Banner */}
            <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
                <div className="flex items-center gap-4 relative">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'var(--bg-secondary)' }}>
                        🎯
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-themed-secondary font-medium">Your Target University</p>
                        <h2 className="text-2xl font-bold text-themed">{university.uni_name}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-themed-muted">{university.country}</span>
                            {university.category && (
                                <span className={`badge ${university.category === 'Dream' ? 'bg-amber-500/10 text-amber-500' :
                                    university.category === 'Target' ? 'bg-blue-500/10 text-blue-500' :
                                        'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                    {university.category}
                                </span>
                            )}
                        </div>
                    </div>
                    <Link to="/shortlist" className="btn btn-ghost text-sm text-themed-secondary">
                        🔓 Change
                    </Link>
                </div>
            </div>

            {/* Overall Progress */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-themed">📋 Task Progress</h3>
                        <span className="text-2xl font-bold text-primary">{taskProgress}%</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${taskProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-themed-secondary mt-2">
                        {completedTasks} of {totalTasks} tasks completed
                    </p>
                </div>

                <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-themed">📁 Documents Ready</h3>
                        <span className="text-2xl font-bold text-emerald-500">{docProgress}%</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${docProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-themed-secondary mt-2">
                        {checkedDocsCount} of {documents.length} documents ready
                    </p>
                </div>
            </div>

            {/* Your Tasks (from backend) */}
            {tasks.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-themed">✅ Your Application Tasks</h3>
                        <span className="badge bg-primary/10 text-primary">
                            {completedTasks}/{totalTasks} done
                        </span>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(tasksByCategory).map(([category, categoryTasks]) => (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{categoryIcons[category] || '📌'}</span>
                                    <h4 className="font-medium text-themed-secondary">{categoryNames[category] || category}</h4>
                                </div>
                                <div className="space-y-2 ml-6">
                                    {categoryTasks.map(task => (
                                        <div
                                            key={task.id}
                                            onClick={() => handleTaskToggle(task.id, task.status)}
                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                                                ${task.status === 'completed'
                                                    ? 'bg-emerald-500/5 border border-emerald-500/20'
                                                    : 'hover:bg-themed-secondary/5'
                                                }`}
                                            style={{
                                                border: task.status !== 'completed' ? '1px solid var(--border-color)' : undefined
                                            }}
                                        >
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                                                ${task.status === 'completed'
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-themed-muted hover:border-primary'
                                                }`}
                                            >
                                                {task.status === 'completed' && (
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium ${task.status === 'completed' ? 'line-through text-themed-muted' : 'text-themed'}`}>
                                                    {task.title}
                                                </p>
                                                {task.description && (
                                                    <p className="text-sm text-themed-secondary">{task.description}</p>
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
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <h3 className="text-lg font-semibold text-themed mb-4">📅 Application Timeline</h3>
                <div className="space-y-3">
                    {timeline.map((phase, idx) => (
                        <div
                            key={idx}
                            className={`rounded-xl border transition-all duration-300 overflow-hidden
                                ${expandedPhase === idx
                                    ? 'border-primary/50 bg-primary/5'
                                    : 'hover:bg-themed-secondary/5'
                                }`}
                            style={{
                                borderColor: expandedPhase === idx ? undefined : 'var(--border-color)'
                            }}
                        >
                            <div
                                onClick={() => setExpandedPhase(expandedPhase === idx ? -1 : idx)}
                                className="flex items-center gap-4 p-4 cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'var(--bg-secondary)' }}>
                                    {phase.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-primary text-sm font-medium">{phase.month}</p>
                                    <h4 className="font-semibold text-themed">{phase.title}</h4>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${expandedPhase === idx ? 'rotate-180' : ''}`} style={{ background: 'var(--bg-secondary)' }}>
                                    <svg className="w-5 h-5 text-themed-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <div className={`overflow-hidden transition-all duration-300 ${expandedPhase === idx ? 'max-h-96' : 'max-h-0'}`}>
                                <div className="px-4 pb-4 pt-0">
                                    <div className="pl-16 space-y-2">
                                        {phase.tasks.map((task, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                <span className="text-themed-secondary">{task}</span>
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
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-themed">📁 Document Checklist</h3>
                    <span className="text-sm text-themed-secondary">
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
                                    ? 'bg-emerald-500/5 border border-emerald-500/20'
                                    : 'hover:bg-themed-secondary/5'
                                }`}
                            style={{
                                border: checkedDocs[doc.name] ? undefined : '1px solid var(--border-color)'
                            }}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all
                                ${checkedDocs[doc.name]
                                    ? 'bg-emerald-500/10'
                                    : 'bg-themed-secondary/10'
                                }`}
                            >
                                {checkedDocs[doc.name] ? '✅' : doc.icon}
                            </div>
                            <div className="flex-1">
                                <p className={`font-medium ${checkedDocs[doc.name] ? 'text-emerald-500' : 'text-themed'}`}>
                                    {doc.name}
                                </p>
                                <p className="text-sm text-themed-secondary">{doc.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
                <Link
                    to="/chat"
                    className="rounded-2xl p-6 transition-all group hover:border-primary/50"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform" style={{ background: 'var(--bg-secondary)' }}>
                            💬
                        </div>
                        <div>
                            <h4 className="font-semibold text-themed">Ask AI Counsellor</h4>
                            <p className="text-sm text-themed-secondary">Get help with SOP, interviews</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/tasks"
                    className="rounded-2xl p-6 transition-all group hover:border-amber-500/50"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform" style={{ background: 'var(--bg-secondary)' }}>
                            📝
                        </div>
                        <div>
                            <h4 className="font-semibold text-themed">Manage Tasks</h4>
                            <p className="text-sm text-themed-secondary">Track your to-do list</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/recommendations"
                    className="rounded-2xl p-6 transition-all group hover:border-emerald-500/50"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform" style={{ background: 'var(--bg-secondary)' }}>
                            🎓
                        </div>
                        <div>
                            <h4 className="font-semibold text-themed">Explore More</h4>
                            <p className="text-sm text-themed-secondary">View other universities</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Motivational Footer */}
            <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="text-4xl mb-3">🌟</div>
                <h3 className="text-xl font-semibold text-themed mb-2">You're making great progress!</h3>
                <p className="text-themed-secondary max-w-md mx-auto">
                    Stay consistent with your preparation. Every task completed brings you closer to {university.uni_name}.
                </p>
            </div>
        </div>
    );
};

export default ApplicationGuidance;
