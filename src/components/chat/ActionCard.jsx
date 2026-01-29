import React, { useState } from 'react';

// Action Card Component (shows in message)
const ActionCard = ({ action, onSendMessage }) => {
    const icons = {
        shortlist_added: '⭐',
        task_added: '✅',
        recommendations_generated: '🎓',
        profile_updated: '📝',
        university_locked: '🔒',
        task_updated: '✅',
    };

    const colors = {
        shortlist_added: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
        task_added: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
        recommendations_generated: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
        profile_updated: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
        university_locked: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
        task_updated: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    };

    const [selectedUni, setSelectedUni] = useState(null);

    const handleShortlist = () => {
        if (selectedUni && onSendMessage) {
            onSendMessage(`Shortlist ${selectedUni}`);
        }
    };

    return (
        <div className={`flex flex-col gap-3 p-3 rounded-lg bg-gradient-to-r ${colors[action.action] || 'from-white/10 to-white/5 border-white/20'} border`}>
            <div className="flex items-center gap-2">
                <span className="text-lg">{icons[action.action] || '✨'}</span>
                <div className="flex-1 text-sm">
                    {action.action === 'shortlist_added' && (
                        <p>Added <strong>{action.university}</strong> to your <span className="capitalize">{action.category}</span> list</p>
                    )}
                    {action.action === 'task_added' && (
                        <p>Created task: <strong>{action.task}</strong></p>
                    )}
                    {action.action === 'recommendations_generated' && (
                        <div>
                            <p className="font-semibold mb-2">Generated University Recommendations:</p>
                            {/* Interactive List for Recommendations */}
                            {action.recommendations && action.recommendations.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {action.recommendations.map((uni, idx) => (
                                        <label key={idx} className={`flex items-start gap-2 p-2 rounded cursor-pointer transition ${selectedUni === uni.university_name ? 'bg-themed-card border border-themed' : 'hover:bg-themed-card'}`}>
                                            <input
                                                type="radio"
                                                name={`recommendation-${action.timeStamp || idx}`} // unique group per card isn't strictly needed if we just use local state correctly, but good for form semantics
                                                value={uni.university_name}
                                                checked={selectedUni === uni.university_name}
                                                onChange={() => setSelectedUni(uni.university_name)}
                                                className="mt-1"
                                            />
                                            <div className="text-xs">
                                                <div className="font-medium text-themed">{uni.university_name}</div>
                                                <div className="text-themed-secondary">{uni.location}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-themed-secondary text-xs">Check detailed response above.</p>
                            )}
                        </div>
                    )}
                    {action.action === 'profile_updated' && (
                        <p>Updated <strong>{action.field?.replace(/_/g, ' ')}</strong> to <strong>{action.value}</strong></p>
                    )}
                    {action.action === 'university_locked' && (
                        <p>Locked <strong>{action.university}</strong> as your primary choice</p>
                    )}
                    {action.action === 'task_updated' && (
                        <p>Marked task <strong>{action.task}</strong> as <span className="capitalize">{action.status}</span></p>
                    )}
                </div>
                {action.success && action.action !== 'recommendations_generated' && <span className="text-emerald-400">✓</span>}
            </div>

            {/* Shortlist Action Button */}
            {action.action === 'recommendations_generated' && selectedUni && (
                <button
                    onClick={handleShortlist}
                    className="self-end px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs rounded border border-amber-500/50 transition flex items-center gap-1"
                >
                    <span>⭐</span> Shortlist {selectedUni}
                </button>
            )}
        </div>
    );
};

export default ActionCard;
