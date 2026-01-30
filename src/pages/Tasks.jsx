import { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import Loader from '../components/common/Loader';
import { fireTaskConfetti, fireMilestoneConfetti } from '../utils/confetti';
import jsPDF from 'jspdf';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [showCreate, setShowCreate] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', category: 'other', priority: 'medium' });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await tasksAPI.getAll();
            // API returns { tasks, stats } - extract tasks array
            setTasks(response.data.tasks || response.data || []);
        } catch (err) {
            setError('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (task) => {
        try {
            if (task.status === 'completed') {
                await tasksAPI.markPending(task.id);
                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'pending' } : t));
            } else {
                await tasksAPI.markComplete(task.id);
                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed' } : t));

                // Fire confetti for task completion
                fireTaskConfetti();

                // Check if all tasks are now completed
                const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, status: 'completed' } : t);
                const allComplete = updatedTasks.every(t => t.status === 'completed');
                if (allComplete && updatedTasks.length > 0) {
                    setTimeout(() => fireMilestoneConfetti(), 500);
                }
            }
        } catch (err) {
            setError('Failed to update task');
        }
    };

    const handleCreate = async () => {
        if (!newTask.title.trim()) return;
        try {
            const response = await tasksAPI.create(newTask);
            setTasks(prev => [response.data, ...prev]);
            setNewTask({ title: '', category: 'other', priority: 'medium' });
            setShowCreate(false);
        } catch (err) {
            setError('Failed to create task');
        }
    };

    const handleDelete = async (id) => {
        try {
            await tasksAPI.delete(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            setError('Failed to delete task');
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const margin = 20;
        let yPos = margin;

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Application Tasks Checklist', margin, yPos);
        yPos += 15;

        // Stats
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`${pendingCount} pending • ${completedCount} completed • ${Math.round((completedCount / (tasks.length || 1)) * 100)}% complete`, margin, yPos);
        yPos += 15;

        // Tasks by category
        const categories = [...new Set(tasks.map(t => t.category))];

        categories.forEach(category => {
            const categoryTasks = tasks.filter(t => t.category === category);

            // Category header
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.text(category.charAt(0).toUpperCase() + category.slice(1), margin, yPos);
            yPos += 8;

            // Tasks in category
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');

            categoryTasks.forEach(task => {
                const checkbox = task.status === 'completed' ? '[✓]' : '[ ]';
                const priority = task.priority === 'high' ? ' (HIGH)' : '';
                doc.text(`${checkbox} ${task.title}${priority}`, margin + 5, yPos);
                yPos += 7;

                // Check for page break
                if (yPos > 270) {
                    doc.addPage();
                    yPos = margin;
                }
            });

            yPos += 5;
        });

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(128);
        doc.text(`Generated with AI Counsellor • ${new Date().toLocaleDateString()}`, margin, doc.internal.pageSize.getHeight() - 10);

        doc.save('Application_Tasks_Checklist.pdf');
    };

    if (loading) return <Loader />;

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        if (filter === 'pending') return task.status === 'pending';
        if (filter === 'completed') return task.status === 'completed';
        return task.category === filter;
    });

    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;

    const categories = ['exams', 'sop', 'lor', 'documents', 'visa', 'research', 'other'];

    return (
        <div className="space-y-6 pb-20 md:pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-themed">Tasks</h1>
                    <p className="text-themed-secondary mt-1">
                        {pendingCount} pending • {completedCount} completed
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={exportToPDF}
                        className="btn border flex items-center gap-2"
                        style={{ borderColor: 'var(--border-color)' }}
                        disabled={tasks.length === 0}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export PDF
                    </button>
                    <button onClick={() => setShowCreate(true)} className="btn btn-primary">
                        + Add Task
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'completed', label: 'Completed' },
                ].map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setFilter(id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === id
                            ? 'bg-primary text-white'
                            : 'text-themed-secondary hover:bg-themed-secondary/10'
                            }`}
                        style={{ background: filter === id ? undefined : 'var(--bg-secondary)' }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Progress Bar */}
            <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-themed-secondary">Overall Progress</span>
                    <span className="text-sm font-medium text-themed">
                        {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
                    </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : '0%' }}
                    />
                </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <div
                    className="rounded-2xl p-12 text-center"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-themed mb-2">
                        {filter === 'completed' ? 'No Completed Tasks' : 'No Tasks Yet'}
                    </h3>
                    <p className="text-themed-secondary">
                        {filter === 'completed'
                            ? 'Complete some tasks to see them here'
                            : 'Create tasks or chat with AI Counsellor to get started'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredTasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={() => handleToggle(task)}
                            onDelete={() => handleDelete(task.id)}
                        />
                    ))}
                </div>
            )}

            {/* Create Task Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div
                        className="rounded-2xl p-6 max-w-md w-full animate-slide-up"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                    >
                        <h3 className="text-xl font-semibold text-themed mb-4">Create New Task</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-themed-secondary mb-2">Task Title</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="What needs to be done?"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-themed-secondary mb-2">Category</label>
                                    <select
                                        className="input"
                                        value={newTask.category}
                                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-themed-secondary mb-2">Priority</label>
                                    <select
                                        className="input"
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="btn flex-1 border"
                                style={{ borderColor: 'var(--border-color)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newTask.title.trim()}
                                className="btn btn-primary flex-1"
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Task Item Component
const TaskItem = ({ task, onToggle, onDelete }) => {
    const isCompleted = task.status === 'completed';

    const priorityStyles = {
        high: 'text-red-500',
        medium: 'text-amber-500',
        low: 'text-emerald-500',
    };

    const categoryIcons = {
        exams: '📝',
        sop: '✍️',
        lor: '📧',
        documents: '📄',
        visa: '🛂',
        research: '🔬',
        other: '📌',
    };

    return (
        <div
            className={`flex items-center gap-3 p-4 rounded-xl transition-all group ${isCompleted ? 'bg-emerald-500/5' : ''
                }`}
            style={{
                background: isCompleted ? undefined : 'var(--bg-card)',
                border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)'}`
            }}
        >
            {/* Checkbox */}
            <button
                onClick={onToggle}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'hover:border-primary'
                    }`}
                style={{ borderColor: isCompleted ? undefined : 'var(--border-color)' }}
            >
                {isCompleted && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{categoryIcons[task.category] || '📌'}</span>
                    <span className={`font-medium ${isCompleted ? 'line-through text-themed-muted' : 'text-themed'}`}>
                        {task.title}
                    </span>
                    {task.ai_generated && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-500 font-medium">
                            AI
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-themed-muted">
                    <span className="capitalize">{task.category}</span>
                    <span className={priorityStyles[task.priority]}>{task.priority} priority</span>
                </div>
            </div>

            {/* Delete Button */}
            <button
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete task"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    );
};

export default Tasks;
