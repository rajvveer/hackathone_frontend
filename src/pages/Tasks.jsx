import { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import Loader from '../components/common/Loader';

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
                    <h1 className="text-2xl md:text-3xl font-bold font-display">Tasks</h1>
                    <p className="text-gray-400 mt-1">
                        {pendingCount} pending • {completedCount} completed
                    </p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn btn-primary">
                    + Add Task
                </button>
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
                            ? 'bg-gradient-to-r from-primary to-secondary text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Progress Bar */}
            <div className="card">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Overall Progress</span>
                    <span className="text-sm font-medium">
                        {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
                    </span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                        style={{ width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : '0%' }}
                    />
                </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <div className="card text-center py-12">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-lg font-semibold mb-2">
                        {filter === 'completed' ? 'No Completed Tasks' : 'No Tasks Yet'}
                    </h3>
                    <p className="text-gray-400">
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
                    <div className="card max-w-md w-full animate-slide-up">
                        <h3 className="text-xl font-semibold mb-4">Create New Task</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Task Title</label>
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
                                    <label className="label">Category</label>
                                    <select
                                        className="input"
                                        value={newTask.category}
                                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} className="bg-dark-800">
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Priority</label>
                                    <select
                                        className="input"
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="high" className="bg-dark-800">High</option>
                                        <option value="medium" className="bg-dark-800">Medium</option>
                                        <option value="low" className="bg-dark-800">Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="btn btn-secondary flex-1"
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
        high: 'text-red-400',
        medium: 'text-amber-400',
        low: 'text-emerald-400',
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
        <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all group ${isCompleted
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
            }`}>
            {/* Checkbox */}
            <button
                onClick={onToggle}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-white/20 hover:border-primary'
                    }`}
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
                    <span className={`font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                    </span>
                    {task.ai_generated && (
                        <span className="badge bg-purple-500/10 text-purple-400 text-xs">AI</span>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="capitalize">{task.category}</span>
                    <span className={priorityStyles[task.priority]}>{task.priority} priority</span>
                </div>
            </div>

            {/* Delete Button */}
            <button
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
