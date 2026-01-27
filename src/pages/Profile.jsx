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
            const response = await userAPI.updateProfile({ ...profile, onboarding_completed: true });
            updateUser(response.data);
            setSuccess('Profile updated successfully');
            setIsEditing(false);
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
        setProfile(prev => ({ ...prev, [field]: value }));
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

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display">Profile</h1>
                    <p className="text-gray-400 mt-1">Manage your study abroad profile</p>
                </div>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                        ✏️ Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="btn btn-ghost">
                            Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                            {saving ? <span className="spinner"></span> : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* User Info Card */}
            <div className="card">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{user?.name}</h2>
                        <p className="text-gray-400">{user?.email}</p>
                        <span className="badge badge-info mt-1">Stage {user?.stage}</span>
                    </div>
                </div>
            </div>

            {/* Academic Background */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Academic Background</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Current Education</label>
                        {isEditing ? (
                            <select
                                className="input"
                                value={profile.current_education_level || ''}
                                onChange={(e) => updateField('current_education_level', e.target.value)}
                            >
                                <option value="">Select...</option>
                                <option value="High School">High School</option>
                                <option value="Bachelor's Degree">Bachelor's Degree</option>
                                <option value="Master's Degree">Master's Degree</option>
                                <option value="Working Professional">Working Professional</option>
                            </select>
                        ) : (
                            <p className="text-gray-200">{profile.current_education_level || 'Not set'}</p>
                        )}
                    </div>
                    <div>
                        <label className="label">GPA</label>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.1"
                                    className="input flex-1"
                                    placeholder="3.5"
                                    value={profile.gpa || ''}
                                    onChange={(e) => updateField('gpa', e.target.value)}
                                />
                                <select
                                    className="input w-24"
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
                            <p className="text-gray-200">
                                {profile.gpa ? `${profile.gpa}/${profile.gpa_scale || '4.0'}` : 'Not set'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Study Goals */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Study Goals</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Target Degree</label>
                        {isEditing ? (
                            <select
                                className="input"
                                value={profile.intended_degree || ''}
                                onChange={(e) => updateField('intended_degree', e.target.value)}
                            >
                                <option value="">Select...</option>
                                <option value="bachelors">Bachelor's</option>
                                <option value="masters">Master's</option>
                                <option value="mba">MBA</option>
                                <option value="phd">PhD</option>
                            </select>
                        ) : (
                            <p className="text-gray-200 capitalize">{profile.intended_degree || 'Not set'}</p>
                        )}
                    </div>
                    <div>
                        <label className="label">Field of Study</label>
                        {isEditing ? (
                            <input
                                type="text"
                                className="input"
                                value={profile.field_of_study || ''}
                                onChange={(e) => updateField('field_of_study', e.target.value)}
                            />
                        ) : (
                            <p className="text-gray-200">{profile.field_of_study || 'Not set'}</p>
                        )}
                    </div>
                    <div>
                        <label className="label">Target Intake</label>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <select
                                    className="input flex-1"
                                    value={profile.target_intake_season || 'Fall'}
                                    onChange={(e) => updateField('target_intake_season', e.target.value)}
                                >
                                    <option value="Fall">Fall</option>
                                    <option value="Spring">Spring</option>
                                    <option value="Summer">Summer</option>
                                </select>
                                <input
                                    type="number"
                                    className="input w-24"
                                    value={profile.target_intake_year || ''}
                                    onChange={(e) => updateField('target_intake_year', e.target.value)}
                                />
                            </div>
                        ) : (
                            <p className="text-gray-200">
                                {profile.target_intake_season} {profile.target_intake_year || 'Not set'}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="label">Preferred Countries</label>
                        {isEditing ? (
                            <div className="flex flex-wrap gap-2">
                                {COUNTRY_OPTIONS.map(({ code, flag }) => (
                                    <button
                                        key={code}
                                        onClick={() => {
                                            const current = profile.preferred_countries || [];
                                            updateField('preferred_countries',
                                                current.includes(code)
                                                    ? current.filter(c => c !== code)
                                                    : [...current, code]
                                            );
                                        }}
                                        className={`px-3 py-1.5 rounded-lg border text-sm transition ${(profile.preferred_countries || []).includes(code)
                                            ? 'border-primary bg-primary/10 text-primary-light'
                                            : 'border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                    >
                                        {flag} {code}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-200">
                                {(profile.preferred_countries || []).join(', ') || 'Not set'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Budget */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Budget</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Budget Range (USD/year)</label>
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="input flex-1"
                                    placeholder="Min"
                                    value={profile.budget_range_min || ''}
                                    onChange={(e) => updateField('budget_range_min', e.target.value)}
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="number"
                                    className="input flex-1"
                                    placeholder="Max"
                                    value={profile.budget_range_max || ''}
                                    onChange={(e) => updateField('budget_range_max', e.target.value)}
                                />
                            </div>
                        ) : (
                            <p className="text-gray-200">
                                {profile.budget_range_min && profile.budget_range_max
                                    ? `$${profile.budget_range_min} - $${profile.budget_range_max}`
                                    : 'Not set'}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="label">Funding Plan</label>
                        {isEditing ? (
                            <select
                                className="input"
                                value={profile.funding_plan || ''}
                                onChange={(e) => updateField('funding_plan', e.target.value)}
                            >
                                <option value="">Select...</option>
                                <option value="Self-funded">Self-funded</option>
                                <option value="Scholarship-dependent">Scholarship-dependent</option>
                                <option value="Loan-dependent">Loan-dependent</option>
                                <option value="Mixed">Mixed</option>
                            </select>
                        ) : (
                            <p className="text-gray-200">{profile.funding_plan || 'Not set'}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Exam Status */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Exam & Preparation Status</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {['ielts', 'gre', 'gmat'].map(exam => (
                        <div key={exam}>
                            <label className="label">{exam.toUpperCase()} Status</label>
                            {isEditing ? (
                                <select
                                    className="input"
                                    value={profile[`${exam}_status`] || 'not-started'}
                                    onChange={(e) => updateField(`${exam}_status`, e.target.value)}
                                >
                                    <option value="not-started">Not Started</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="not-required">Not Required</option>
                                </select>
                            ) : (
                                <p className="text-gray-200 capitalize">
                                    {(profile[`${exam}_status`] || 'not-started').replace('-', ' ')}
                                </p>
                            )}
                        </div>
                    ))}
                    <div>
                        <label className="label">SOP Status</label>
                        {isEditing ? (
                            <select
                                className="input"
                                value={profile.sop_status || 'not-started'}
                                onChange={(e) => updateField('sop_status', e.target.value)}
                            >
                                <option value="not-started">Not Started</option>
                                <option value="draft">Draft Ready</option>
                                <option value="ready">Final Version Ready</option>
                            </select>
                        ) : (
                            <p className="text-gray-200 capitalize">
                                {(profile.sop_status || 'not-started').replace('-', ' ')}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card border-red-500/20">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                        <div>
                            <p className="font-medium">Logout</p>
                            <p className="text-sm text-gray-400">Sign out of your account</p>
                        </div>
                        <button onClick={logout} className="btn btn-secondary">
                            Logout
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                        <div>
                            <p className="font-medium text-red-400">Delete Account</p>
                            <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                        </div>
                        <button onClick={() => setShowDeleteModal(true)} className="btn bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="card max-w-md w-full animate-slide-up">
                        <div className="text-center mb-6">
                            <div className="text-5xl mb-4">⚠️</div>
                            <h3 className="text-xl font-semibold text-red-400 mb-2">Delete Account?</h3>
                            <p className="text-gray-400">
                                This action is <strong>permanent</strong> and cannot be undone. All your data including tasks, shortlists, and conversations will be deleted.
                            </p>
                        </div>
                        <div className="mb-4">
                            <label className="label">Type <span className="text-red-400 font-mono">DELETE</span> to confirm</label>
                            <input
                                type="text"
                                className="input"
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
                                className="btn btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirm !== 'DELETE' || deleting}
                                className="btn bg-red-500 hover:bg-red-600 text-white flex-1 disabled:opacity-50"
                            >
                                {deleting ? <span className="spinner"></span> : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
