import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userAPI.getProfile();
            setProfile(response.data.profile_data || {});
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await userAPI.updateProfile({
                ...profile,
                onboarding_completed: true,
            });
            updateUser(response.data);
            setSuccess('Profile updated successfully');
            setIsEditing(false);

            // Auto-hide success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') return;

        setDeleting(true);
        try {
            await userAPI.deleteAccount();
            logout();
            navigate('/login');
        } catch (err) {
            setError('Failed to delete account');
            setDeleting(false);
        }
    };

    const updateField = (field, value) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    if (loading) return <Loader />;

    const COUNTRY_OPTIONS = [
        { code: 'US', name: 'United States', flag: '🇺🇸' },
        { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
        { code: 'CA', name: 'Canada', flag: '🇨🇦' },
        { code: 'AU', name: 'Australia', flag: '🇦🇺' },
        { code: 'DE', name: 'Germany', flag: '🇩🇪' },
        { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
        { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
        { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    ];

    const STAGE_INFO = {
        1: { label: 'Building Profile', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
        2: { label: 'Discovering Options', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
        3: { label: 'Finalizing List', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
        4: { label: 'Application Ready', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    };

    const stageInfo = STAGE_INFO[user?.stage] || STAGE_INFO[1];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-in">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display">
                        Your Profile
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Manage your study abroad journey details
                    </p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-secondary hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <span className="mr-1">✏️</span> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                fetchProfile(); // Reset changes
                            }}
                            className="btn btn-ghost hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-primary hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                            {saving ? <span className="spinner"></span> : '💾 Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Alerts */}
            {error && (
                <div className="alert alert-error animate-slide-up">
                    <span className="text-lg">⚠️</span>
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success animate-slide-up">
                    <span className="text-lg">✅</span>
                    {success}
                </div>
            )}

            {/* User Info Card */}
            <div className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 animate-slide-up">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl font-bold shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold mb-1">{user?.name}</h2>
                        <p className="text-gray-400 mb-2">{user?.email}</p>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${stageInfo.color}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                            Stage {user?.stage}: {stageInfo.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Academic Background */}
            <div className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
                    <span className="text-2xl">🎓</span>
                    Academic Background
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        label="Current Education Level"
                        isEditing={isEditing}
                        value={profile.current_education_level}
                    >
                        <select
                            className="input hover:border-primary/50 transition-colors"
                            value={profile.current_education_level || ''}
                            onChange={(e) => updateField('current_education_level', e.target.value)}
                        >
                            <option value="">Select your level</option>
                            <option value="High School">High School</option>
                            <option value="Bachelor's Degree">Bachelor's Degree</option>
                            <option value="Master's Degree">Master's Degree</option>
                            <option value="Working Professional">Working Professional</option>
                        </select>
                    </FormField>

                    <div>
                        <label className="label">GPA / Academic Score</label>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input flex-1 hover:border-primary/50 transition-colors"
                                    placeholder="3.5"
                                    value={profile.gpa || ''}
                                    onChange={(e) => updateField('gpa', e.target.value)}
                                />
                                <select
                                    className="input w-28 hover:border-primary/50 transition-colors"
                                    value={profile.gpa_scale || '4.0'}
                                    onChange={(e) => updateField('gpa_scale', e.target.value)}
                                >
                                    <option value="4.0">/4.0</option>
                                    <option value="5.0">/5.0</option>
                                    <option value="10.0">/10.0</option>
                                    <option value="100">/100</option>
                                </select>
                            </div>
                        ) : (
                            <p className="text-gray-200 py-2.5 px-3 bg-dark-800/50 rounded-lg border border-white/5">
                                {profile.gpa
                                    ? `${profile.gpa}/${profile.gpa_scale || '4.0'}`
                                    : 'Not set'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Study Goals */}
            <div className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Study Goals
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        label="Target Degree"
                        isEditing={isEditing}
                        value={profile.intended_degree}
                        capitalize
                    >
                        <select
                            className="input hover:border-primary/50 transition-colors"
                            value={profile.intended_degree || ''}
                            onChange={(e) => updateField('intended_degree', e.target.value)}
                        >
                            <option value="">Select degree type</option>
                            <option value="bachelors">Bachelor's</option>
                            <option value="masters">Master's</option>
                            <option value="mba">MBA</option>
                            <option value="phd">PhD</option>
                        </select>
                    </FormField>

                    <FormField
                        label="Field of Study"
                        isEditing={isEditing}
                        value={profile.field_of_study}
                    >
                        <input
                            type="text"
                            className="input hover:border-primary/50 transition-colors"
                            placeholder="e.g., Computer Science"
                            value={profile.field_of_study || ''}
                            onChange={(e) => updateField('field_of_study', e.target.value)}
                        />
                    </FormField>

                    <div>
                        <label className="label">Target Intake</label>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <select
                                    className="input flex-1 hover:border-primary/50 transition-colors"
                                    value={profile.target_intake_season || 'Fall'}
                                    onChange={(e) =>
                                        updateField('target_intake_season', e.target.value)
                                    }
                                >
                                    <option value="Fall">Fall</option>
                                    <option value="Spring">Spring</option>
                                    <option value="Summer">Summer</option>
                                </select>
                                <input
                                    type="number"
                                    className="input w-28 hover:border-primary/50 transition-colors"
                                    placeholder="2026"
                                    value={profile.target_intake_year || ''}
                                    onChange={(e) =>
                                        updateField('target_intake_year', e.target.value)
                                    }
                                />
                            </div>
                        ) : (
                            <p className="text-gray-200 py-2.5 px-3 bg-dark-800/50 rounded-lg border border-white/5">
                                {profile.target_intake_season} {profile.target_intake_year || 'Year not set'}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="label">Preferred Countries</label>
                        {isEditing ? (
                            <div className="flex flex-wrap gap-2">
                                {COUNTRY_OPTIONS.map(({ code, flag, name }) => {
                                    const isSelected = (profile.preferred_countries || []).includes(code);
                                    return (
                                        <button
                                            key={code}
                                            onClick={() => {
                                                const current = profile.preferred_countries || [];
                                                updateField(
                                                    'preferred_countries',
                                                    current.includes(code)
                                                        ? current.filter((c) => c !== code)
                                                        : [...current, code]
                                                );
                                            }}
                                            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 hover:scale-105 ${isSelected
                                                ? 'border-primary bg-primary/10 text-primary-light shadow-sm'
                                                : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                                                }`}
                                            title={name}
                                        >
                                            <span className="text-lg mr-1.5">{flag}</span>
                                            {code}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {(profile.preferred_countries || []).length > 0 ? (
                                    profile.preferred_countries.map((code) => {
                                        const country = COUNTRY_OPTIONS.find((c) => c.code === code);
                                        return country ? (
                                            <span
                                                key={code}
                                                className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-sm"
                                            >
                                                <span className="text-lg mr-1.5">{country.flag}</span>
                                                {country.name}
                                            </span>
                                        ) : null;
                                    })
                                ) : (
                                    <p className="text-gray-400 py-2">No countries selected</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Budget */}
            <div className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    Budget & Funding
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="label">Annual Budget (USD)</label>
                        {isEditing ? (
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    className="input flex-1 hover:border-primary/50 transition-colors"
                                    placeholder="10,000"
                                    value={profile.budget_range_min || ''}
                                    onChange={(e) =>
                                        updateField('budget_range_min', e.target.value)
                                    }
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="number"
                                    className="input flex-1 hover:border-primary/50 transition-colors"
                                    placeholder="50,000"
                                    value={profile.budget_range_max || ''}
                                    onChange={(e) =>
                                        updateField('budget_range_max', e.target.value)
                                    }
                                />
                            </div>
                        ) : (
                            <p className="text-gray-200 py-2.5 px-3 bg-dark-800/50 rounded-lg border border-white/5">
                                {profile.budget_range_min && profile.budget_range_max
                                    ? `$${Number(profile.budget_range_min).toLocaleString()} - $${Number(profile.budget_range_max).toLocaleString()}`
                                    : 'Not set'}
                            </p>
                        )}
                    </div>

                    <FormField
                        label="Funding Plan"
                        isEditing={isEditing}
                        value={profile.funding_plan}
                    >
                        <select
                            className="input hover:border-primary/50 transition-colors"
                            value={profile.funding_plan || ''}
                            onChange={(e) => updateField('funding_plan', e.target.value)}
                        >
                            <option value="">Select funding plan</option>
                            <option value="Self-funded">Self-funded</option>
                            <option value="Scholarship-dependent">Scholarship-dependent</option>
                            <option value="Loan-dependent">Loan-dependent</option>
                            <option value="Mixed">Mixed (Multiple sources)</option>
                        </select>
                    </FormField>
                </div>
            </div>

            {/* Exam Status */}
            <div className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    Exams & Documents
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {['ielts', 'gre', 'gmat'].map((exam) => (
                        <FormField
                            key={exam}
                            label={`${exam.toUpperCase()} Status`}
                            isEditing={isEditing}
                            value={profile[`${exam}_status`] || 'not-started'}
                            capitalize
                            formatValue={(val) => val.replace('-', ' ')}
                        >
                            <select
                                className="input hover:border-primary/50 transition-colors"
                                value={profile[`${exam}_status`] || 'not-started'}
                                onChange={(e) =>
                                    updateField(`${exam}_status`, e.target.value)
                                }
                            >
                                <option value="not-started">Not Started</option>
                                <option value="preparing">Preparing</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="not-required">Not Required</option>
                            </select>
                        </FormField>
                    ))}

                    <FormField
                        label="Statement of Purpose (SOP)"
                        isEditing={isEditing}
                        value={profile.sop_status || 'not-started'}
                        capitalize
                        formatValue={(val) => val.replace('-', ' ')}
                    >
                        <select
                            className="input hover:border-primary/50 transition-colors"
                            value={profile.sop_status || 'not-started'}
                            onChange={(e) => updateField('sop_status', e.target.value)}
                        >
                            <option value="not-started">Not Started</option>
                            <option value="draft">Draft Ready</option>
                            <option value="ready">Final Version Ready</option>
                        </select>
                    </FormField>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card border-red-500/20 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5 transition-all duration-200">
                <h3 className="text-xl font-semibold text-red-400 mb-5 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    Account Actions
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-white/5 hover:border-white/10 transition-all">
                        <div>
                            <p className="font-medium">Sign Out</p>
                            <p className="text-sm text-gray-400">
                                Log out from your current session
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="btn btn-secondary hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20 hover:border-red-500/30 transition-all">
                        <div>
                            <p className="font-medium text-red-400">Delete Account</p>
                            <p className="text-sm text-gray-400">
                                Permanently remove all your data
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="btn bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="card max-w-md w-full animate-slide-up shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4 animate-pulse">⚠️</div>
                            <h3 className="text-2xl font-semibold text-red-400 mb-3">
                                Delete Account?
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                This action is <strong className="text-red-400">permanent</strong> and cannot be undone. All your data including tasks, shortlists, and conversations will be deleted forever.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="label">
                                Type{' '}
                                <span className="text-red-400 font-mono font-bold px-2 py-0.5 bg-red-500/10 rounded">
                                    DELETE
                                </span>{' '}
                                to confirm
                            </label>
                            <input
                                type="text"
                                className="input border-red-500/30 focus:border-red-500"
                                placeholder="DELETE"
                                value={deleteConfirm}
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirm('');
                                }}
                                className="btn btn-secondary flex-1 hover:shadow-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirm !== 'DELETE' || deleting}
                                className="btn bg-red-500 hover:bg-red-600 text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-red-500/50 transition-all"
                            >
                                {deleting ? (
                                    <span className="spinner"></span>
                                ) : (
                                    '🗑️ Delete Forever'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Reusable Form Field Component
const FormField = ({
    label,
    isEditing,
    value,
    children,
    capitalize = false,
    formatValue = (val) => val,
}) => {
    return (
        <div>
            <label className="label">{label}</label>
            {isEditing ? (
                children
            ) : (
                <p
                    className={`text-gray-200 py-2.5 px-3 bg-dark-800/50 rounded-lg border border-white/5 ${capitalize ? 'capitalize' : ''
                        }`}
                >
                    {value ? formatValue(value) : 'Not set'}
                </p>
            )}
        </div>
    );
};

export default Profile;
