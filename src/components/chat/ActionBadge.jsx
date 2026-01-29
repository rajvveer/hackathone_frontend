import React from 'react';

// Real-time action badge (shows during streaming)
const ActionBadge = ({ action }) => {
    const configs = {
        shortlist_added: { icon: '⭐', text: `Added ${action.university}`, bg: 'bg-amber-500/20 border-amber-500/30' },
        task_added: { icon: '✅', text: `Created: ${action.task}`, bg: 'bg-emerald-500/20 border-emerald-500/30' },
        recommendations_generated: { icon: '🎓', text: 'Generating recommendations...', bg: 'bg-blue-500/20 border-blue-500/30' },
        profile_updated: { icon: '📝', text: `Updated ${action.field?.replace(/_/g, ' ')}`, bg: 'bg-purple-500/20 border-purple-500/30' },
        university_locked: { icon: '🔒', text: `Locked ${action.university}`, bg: 'bg-emerald-500/20 border-emerald-500/30' }
    };

    const config = configs[action.action] || { icon: '✨', text: 'Action taken', bg: 'bg-white/10 border-white/20' };

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${config.bg} animate-slide-up`}>
            <span>{config.icon}</span>
            <span>{config.text}</span>
        </div>
    );
};

export default ActionBadge;
