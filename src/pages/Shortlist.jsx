import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { shortlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import { fireUniversityConfetti } from '../utils/confetti';

const Shortlist = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locking, setLocking] = useState(false);
    const [showLockModal, setShowLockModal] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [selectedForCompare, setSelectedForCompare] = useState([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    useEffect(() => {
        fetchShortlist();
    }, []);

    const fetchShortlist = async () => {
        try {
            const response = await shortlistAPI.get();
            setUniversities(response.data.shortlists || response.data || []);
        } catch (err) {
            setError('Failed to load shortlist');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id) => {
        try {
            await shortlistAPI.remove(id);
            setUniversities(prev => prev.filter(u => u.id !== id));
            setSelectedForCompare(prev => prev.filter(sid => sid !== id));
        } catch (err) {
            setError('Failed to remove university');
        }
    };

    const handleLock = async (uni) => {
        setLocking(true);
        try {
            const response = await shortlistAPI.lock(uni.id);
            updateUser(response.data.user);
            setShowLockModal(null);

            // Fire celebration
            fireUniversityConfetti();

            // Add slight delay before navigation so user sees confetti
            setTimeout(() => {
                navigate('/application');
            }, 1500);
        } catch (err) {
            setError('Failed to lock university');
        } finally {
            setLocking(false);
        }
    };

    const handleUnlock = async () => {
        try {
            const response = await shortlistAPI.unlock();
            updateUser(response.data.user);
        } catch (err) {
            setError('Failed to unlock university');
        }
    };

    const toggleCompareSelection = (id) => {
        setSelectedForCompare(prev => {
            if (prev.includes(id)) {
                return prev.filter(sid => sid !== id);
            }
            if (prev.length >= 2) {
                return [prev[1], id]; // Replace oldest
            }
            return [...prev, id];
        });
    };

    if (loading) return <Loader />;

    const grouped = {
        Dream: universities.filter(u => u.category === 'Dream'),
        Target: universities.filter(u => u.category === 'Target'),
        Safe: universities.filter(u => u.category === 'Safe'),
    };

    const lockedUni = universities.find(u => u.id === user?.locked_university_id);
    const compareUnis = universities.filter(u => selectedForCompare.includes(u.id));

    return (
        <div className="space-y-6 pb-20 md:pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-themed">Your Shortlist</h1>
                    <p className="text-themed-secondary mt-1">
                        {universities.length} universities shortlisted
                    </p>
                </div>
                <div className="flex gap-2">
                    {universities.length >= 2 && (
                        <button
                            onClick={() => {
                                setCompareMode(!compareMode);
                                if (compareMode) setSelectedForCompare([]);
                            }}
                            className={`btn ${compareMode ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            {compareMode ? '✕ Cancel' : '⚖️ Compare'}
                        </button>
                    )}
                    <Link to="/recommendations" className="btn btn-secondary text-themed">
                        + Add More Universities
                    </Link>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Compare Mode Banner */}
            {compareMode && (
                <div
                    className="rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">⚖️</span>
                        <div>
                            <p className="font-medium text-themed">Compare Mode</p>
                            <p className="text-sm text-themed-muted">
                                Select 2 universities to compare ({selectedForCompare.length}/2 selected)
                            </p>
                        </div>
                    </div>
                    <button
                        disabled={selectedForCompare.length !== 2}
                        onClick={() => setShowCompareModal(true)}
                        className="btn btn-primary"
                    >
                        Compare Now
                    </button>
                </div>
            )}

            {/* Locked University Banner */}
            {lockedUni && (
                <div className="card bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🔒</span>
                            <div>
                                <p className="text-sm text-emerald-500 font-medium">Locked University</p>
                                <h3 className="text-xl font-semibold text-themed">{lockedUni.uni_name}</h3>
                                <p className="text-themed-muted">{lockedUni.country}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link to="/application" className="btn btn-primary">
                                View Application Guidance
                            </Link>
                            <button onClick={handleUnlock} className="btn btn-ghost text-amber-500">
                                🔓 Unlock
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {universities.length === 0 && (
                <div
                    className="rounded-2xl p-12 text-center"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <div className="text-5xl mb-4">⭐</div>
                    <h3 className="text-lg font-semibold text-themed mb-2">No Universities Shortlisted</h3>
                    <p className="text-themed-secondary mb-4">
                        Start by exploring AI recommendations and adding universities to your shortlist
                    </p>
                    <Link to="/recommendations" className="btn btn-primary">
                        Explore Universities
                    </Link>
                </div>
            )}

            {/* University Groups */}
            {['Dream', 'Target', 'Safe'].map(category => {
                const unis = grouped[category];
                if (unis.length === 0) return null;

                const styles = {
                    Dream: { icon: '✨', color: 'amber' },
                    Target: { icon: '🎯', color: 'blue' },
                    Safe: { icon: '🛡️', color: 'emerald' },
                };
                const { icon } = styles[category];

                return (
                    <div key={category}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">{icon}</span>
                            <h2 className="text-lg font-semibold text-themed">{category} Universities</h2>
                            <span className="badge bg-white/10 text-themed-muted">{unis.length}</span>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {unis.map(uni => (
                                <ShortlistCard
                                    key={uni.id}
                                    university={uni}
                                    onRemove={() => handleRemove(uni.id)}
                                    onLock={() => setShowLockModal(uni)}
                                    isLocked={uni.id === user?.locked_university_id}
                                    hasLockedUni={!!user?.locked_university_id}
                                    compareMode={compareMode}
                                    isSelectedForCompare={selectedForCompare.includes(uni.id)}
                                    onToggleCompare={() => toggleCompareSelection(uni.id)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Lock Confirmation Modal */}
            {showLockModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div
                        className="rounded-2xl p-6 max-w-md w-full animate-slide-up"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                    >
                        <div className="text-center mb-6">
                            <div className="text-5xl mb-4">🔒</div>
                            <h3 className="text-xl font-semibold text-themed mb-2">Lock {showLockModal.uni_name}?</h3>
                            <p className="text-themed-secondary">
                                This will set this as your primary university and unlock application guidance. You can unlock later if needed.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLockModal(null)}
                                className="btn btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleLock(showLockModal)}
                                disabled={locking}
                                className="btn btn-primary flex-1"
                            >
                                {locking ? <span className="spinner"></span> : 'Lock University'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compare Modal */}
            {showCompareModal && compareUnis.length === 2 && (
                <CompareModal
                    universities={compareUnis}
                    onClose={() => setShowCompareModal(false)}
                    onLock={(uni) => {
                        setShowCompareModal(false);
                        setShowLockModal(uni);
                    }}
                    hasLockedUni={!!user?.locked_university_id}
                />
            )}
        </div>
    );
};

// Shortlist Card Component
const ShortlistCard = ({ university, onRemove, onLock, isLocked, hasLockedUni, compareMode, isSelectedForCompare, onToggleCompare }) => {
    const chanceColors = {
        Low: 'text-red-500',
        Medium: 'text-amber-500',
        High: 'text-emerald-500',
    };

    return (
        <div
            className={`card relative transition-all ${isLocked ? 'border-emerald-500/30 bg-emerald-500/5' : ''} 
                ${compareMode ? 'cursor-pointer' : ''} 
                ${isSelectedForCompare ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}`}
            onClick={compareMode ? onToggleCompare : undefined}
            style={{
                background: isSelectedForCompare ? 'var(--bg-secondary)' : 'var(--bg-card)',
                borderColor: isSelectedForCompare ? '#3b82f6' : 'var(--border-color)'
            }}
        >
            {/* Compare Checkbox */}
            {compareMode && (
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                    ${isSelectedForCompare ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}
                >
                    {isSelectedForCompare && <span className="text-white text-sm">✓</span>}
                </div>
            )}

            <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                    <h3 className="font-semibold text-themed">{university.uni_name}</h3>
                    <p className="text-sm text-themed-muted">{university.country}</p>
                </div>
                {isLocked && <span className="badge badge-success">🔒 Locked</span>}
            </div>

            {university.why_fits && (
                <p className="text-sm text-themed-secondary mb-3 line-clamp-2">{university.why_fits}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-themed-muted mb-4">
                {university.acceptance_chance && (
                    <span className={chanceColors[university.acceptance_chance]}>
                        {university.acceptance_chance} chance
                    </span>
                )}
                {university.data?.fit_score && (
                    <span>Fit: {university.data.fit_score}/10</span>
                )}
            </div>

            {!compareMode && (
                <div className="flex gap-2">
                    {!isLocked && (
                        <>
                            <button
                                onClick={onRemove}
                                className="btn btn-ghost text-red-500 text-sm flex-1"
                            >
                                Remove
                            </button>
                            {!hasLockedUni && (
                                <button
                                    onClick={onLock}
                                    className="btn btn-primary text-sm flex-1"
                                >
                                    🔒 Lock This
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// Compare Modal Component
const CompareModal = ({ universities, onClose, onLock, hasLockedUni }) => {
    const [uni1, uni2] = universities;

    const getChanceColor = (chance) => {
        const colors = { Low: 'text-red-500', Medium: 'text-amber-500', High: 'text-emerald-500' };
        return colors[chance] || 'text-themed-muted';
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
            <div
                className="rounded-2xl p-6 max-w-4xl w-full animate-slide-up my-8"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-themed">⚖️ Compare Universities</h3>
                    <button onClick={onClose} className="btn btn-ghost">✕</button>
                </div>

                {/* Header Row */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="font-medium text-themed-muted">Criteria</div>
                    <div className="text-center">
                        <h4 className="font-semibold text-lg text-themed">{uni1.uni_name}</h4>
                        <span className={`badge ${uni1.category === 'Dream' ? 'badge-dream' : uni1.category === 'Target' ? 'badge-target' : 'badge-safe'}`}>
                            {uni1.category}
                        </span>
                    </div>
                    <div className="text-center">
                        <h4 className="font-semibold text-lg text-themed">{uni2.uni_name}</h4>
                        <span className={`badge ${uni2.category === 'Dream' ? 'badge-dream' : uni2.category === 'Target' ? 'badge-target' : 'badge-safe'}`}>
                            {uni2.category}
                        </span>
                    </div>
                </div>

                {/* Comparison Rows */}
                <div className="space-y-4">
                    {/* Country */}
                    <div className="grid grid-cols-3 gap-4 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="text-themed-muted">Country</div>
                        <div className="text-center text-themed">{uni1.country}</div>
                        <div className="text-center text-themed">{uni2.country}</div>
                    </div>

                    {/* Acceptance Chance */}
                    <div className="grid grid-cols-3 gap-4 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="text-themed-muted">Acceptance Chance</div>
                        <div className={`text-center font-semibold ${getChanceColor(uni1.acceptance_chance)}`}>
                            {uni1.acceptance_chance || 'N/A'}
                        </div>
                        <div className={`text-center font-semibold ${getChanceColor(uni2.acceptance_chance)}`}>
                            {uni2.acceptance_chance || 'N/A'}
                        </div>
                    </div>

                    {/* Fit Score */}
                    <div className="grid grid-cols-3 gap-4 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="text-themed-muted">Fit Score</div>
                        <div className="text-center font-semibold text-themed">{uni1.data?.fit_score || 'N/A'}/10</div>
                        <div className="text-center font-semibold text-themed">{uni2.data?.fit_score || 'N/A'}/10</div>
                    </div>

                    {/* Why It Fits */}
                    <div className="grid grid-cols-3 gap-4 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="text-themed-muted">Why It Fits</div>
                        <div className="text-sm text-themed-secondary">{uni1.why_fits || 'N/A'}</div>
                        <div className="text-sm text-themed-secondary">{uni2.why_fits || 'N/A'}</div>
                    </div>

                    {/* Key Risks */}
                    <div className="grid grid-cols-3 gap-4 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="text-themed-muted">Key Risks</div>
                        <div className="text-sm text-amber-500/80">{uni1.key_risks || 'None noted'}</div>
                        <div className="text-sm text-amber-500/80">{uni2.key_risks || 'None noted'}</div>
                    </div>
                </div>

                {/* Actions */}
                {!hasLockedUni && (
                    <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <p className="text-sm text-themed-muted mb-4 text-center">Ready to commit? Lock one of these universities:</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => onLock(uni1)} className="btn btn-primary">
                                🔒 Lock {uni1.uni_name}
                            </button>
                            <button onClick={() => onLock(uni2)} className="btn btn-primary">
                                🔒 Lock {uni2.uni_name}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shortlist;
