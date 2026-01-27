import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Step configurations with better UX
const STEPS = [
    { id: 'welcome', title: 'Welcome', icon: '👋', color: 'from-violet-500 to-purple-500' },
    { id: 'education', title: 'Education', icon: '📚', color: 'from-blue-500 to-cyan-500' },
    { id: 'goals', title: 'Goals', icon: '🎯', color: 'from-emerald-500 to-teal-500' },
    { id: 'preferences', title: 'Preferences', icon: '🌍', color: 'from-amber-500 to-orange-500' },
    { id: 'readiness', title: 'Readiness', icon: '📝', color: 'from-rose-500 to-pink-500' },
    { id: 'complete', title: 'All Set!', icon: '🚀', color: 'from-primary to-secondary' },
];

const EDUCATION_OPTIONS = [
    { value: 'High School', icon: '🏫', desc: 'Currently in or completed high school' },
    { value: "Bachelor's Degree", icon: '🎓', desc: 'Studying or completed undergraduate' },
    { value: "Master's Degree", icon: '📜', desc: 'Studying or completed postgraduate' },
    { value: 'Working Professional', icon: '💼', desc: 'Currently employed' },
];

const DEGREE_OPTIONS = [
    { value: 'bachelors', label: "Bachelor's", icon: '🎓', desc: 'Undergraduate degree' },
    { value: 'masters', label: "Master's", icon: '📜', desc: 'Postgraduate degree' },
    { value: 'mba', label: 'MBA', icon: '💼', desc: 'Business administration' },
    { value: 'phd', label: 'PhD', icon: '🔬', desc: 'Doctoral research' },
];

const FIELD_OPTIONS = [
    { value: 'Computer Science', icon: '💻' },
    { value: 'Business & Management', icon: '📊' },
    { value: 'Engineering', icon: '⚙️' },
    { value: 'Data Science & AI', icon: '🤖' },
    { value: 'Finance', icon: '💹' },
    { value: 'Healthcare', icon: '🏥' },
    { value: 'Arts & Design', icon: '🎨' },
    { value: 'Law', icon: '⚖️' },
    { value: 'Other', icon: '📚' },
];

const COUNTRY_OPTIONS = [
    { code: 'US', name: 'United States', flag: '🇺🇸', popular: true },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', popular: true },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', popular: true },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', popular: true },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', affordable: true },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'FR', name: 'France', flag: '🇫🇷', affordable: true },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
];

const BUDGET_OPTIONS = [
    { min: 10000, max: 20000, label: '$10k - $20k', desc: 'Budget-friendly', icon: '💰' },
    { min: 20000, max: 35000, label: '$20k - $35k', desc: 'Moderate', icon: '💰💰' },
    { min: 35000, max: 50000, label: '$35k - $50k', desc: 'Flexible', icon: '💰💰💰' },
    { min: 50000, max: 80000, label: '$50k+', desc: 'Premium', icon: '💎' },
];

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, fetchProfile } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [animating, setAnimating] = useState(false);

    const [formData, setFormData] = useState({
        current_education_level: '',
        graduation_year: '',
        intended_degree: '',
        field_of_study: '',
        gpa: '',
        gpa_scale: '4.0',
        budget_range_min: '',
        budget_range_max: '',
        funding_plan: 'Self-funded',
        preferred_countries: [],
        target_intake_season: 'Fall',
        target_intake_year: new Date().getFullYear() + 1,
        ielts_status: 'not-started',
        ielts_score: '',
        gre_status: 'not-started',
        sop_status: 'not-started',
        work_experience_years: 0,
        research_experience: false,
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleCountry = (code) => {
        setFormData(prev => ({
            ...prev,
            preferred_countries: prev.preferred_countries.includes(code)
                ? prev.preferred_countries.filter(c => c !== code)
                : [...prev.preferred_countries, code]
        }));
    };

    const selectBudget = (budget) => {
        setFormData(prev => ({
            ...prev,
            budget_range_min: budget.min,
            budget_range_max: budget.max
        }));
    };

    const canProceed = () => {
        switch (STEPS[currentStep].id) {
            case 'welcome': return true;
            case 'education': return formData.current_education_level && formData.intended_degree;
            case 'goals': return formData.field_of_study;
            case 'preferences': return formData.preferred_countries.length > 0 && formData.budget_range_min;
            case 'readiness': return true;
            case 'complete': return true;
            default: return true;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setAnimating(false);
            }, 200);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setAnimating(false);
            }, 200);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const profileData = { ...formData, onboarding_completed: true };
            await userAPI.updateProfile(profileData);
            await fetchProfile();
            navigate('/dashboard');
        } catch (err) {
            console.error('Profile save error:', err);
            setError(err.response?.data?.error || 'Failed to save profile');
            setLoading(false);
        }
    };

    // Welcome Step
    const WelcomeStep = () => (
        <div className="text-center space-y-8">
            <div className="relative">
                <div className="text-8xl mb-6 animate-bounce">🎓</div>
                <div className="absolute -top-4 -right-4 text-4xl animate-pulse">✨</div>
            </div>
            <div>
                <h1 className="text-4xl font-bold font-display mb-4 bg-gradient-to-r from-white via-primary-light to-secondary bg-clip-text text-transparent">
                    Welcome, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-xl text-gray-300 mb-2">
                    Let's build your study abroad profile
                </p>
                <p className="text-gray-500">
                    This takes about 2 minutes and unlocks personalized guidance
                </p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {[
                    { icon: '🎯', label: 'Smart Matching' },
                    { icon: '🤖', label: 'AI Guidance' },
                    { icon: '📋', label: 'Action Plan' },
                ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="text-xs text-gray-400">{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Education Step
    const EducationStep = () => (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Tell us about yourself</h2>
                <p className="text-gray-400">Your educational background helps us find the right programs</p>
            </div>

            {/* Current Education */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                    Where are you in your academic journey?
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {EDUCATION_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            onClick={() => updateField('current_education_level', option.value)}
                            className={`group p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-[1.02] ${formData.current_education_level === option.value
                                ? 'border-primary bg-primary/20 shadow-lg shadow-primary/20'
                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                }`}
                        >
                            <div className="text-2xl mb-2">{option.icon}</div>
                            <div className="font-medium text-white">{option.value}</div>
                            <div className="text-xs text-gray-400 mt-1">{option.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Target Degree */}
            {formData.current_education_level && (
                <div className="animate-slide-up">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        What degree do you want to pursue?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {DEGREE_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                onClick={() => updateField('intended_degree', option.value)}
                                className={`group p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-[1.02] ${formData.intended_degree === option.value
                                    ? 'border-secondary bg-secondary/20 shadow-lg shadow-secondary/20'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-2xl mb-2">{option.icon}</div>
                                <div className="font-medium text-white">{option.label}</div>
                                <div className="text-xs text-gray-400 mt-1">{option.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* GPA */}
            {formData.intended_degree && (
                <div className="animate-slide-up">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Your Current GPA (Optional)
                    </label>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="10"
                                placeholder="e.g., 3.5"
                                value={formData.gpa}
                                onChange={(e) => updateField('gpa', e.target.value)}
                                className="input w-full"
                            />
                        </div>
                        <div className="w-24">
                            <select
                                value={formData.gpa_scale}
                                onChange={(e) => updateField('gpa_scale', e.target.value)}
                                className="input w-full"
                            >
                                <option value="4.0">/ 4.0</option>
                                <option value="10">/ 10</option>
                                <option value="100">/ 100</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">This helps us find universities matching your academic profile</p>
                </div>
            )}
        </div>
    );

    // Goals Step
    const GoalsStep = () => (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">What do you want to study?</h2>
                <p className="text-gray-400">Select your primary field of interest</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {FIELD_OPTIONS.map(field => (
                    <button
                        key={field.value}
                        onClick={() => updateField('field_of_study', field.value)}
                        className={`group p-4 rounded-2xl border-2 text-center transition-all duration-300 hover:scale-[1.02] ${formData.field_of_study === field.value
                            ? 'border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            }`}
                    >
                        <div className="text-3xl mb-2">{field.icon}</div>
                        <div className="text-sm font-medium text-white">{field.value}</div>
                    </button>
                ))}
            </div>

            {formData.field_of_study && (
                <div className="animate-slide-up">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        When do you want to start? (Optional)
                    </label>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="flex gap-2">
                                {['Fall', 'Spring'].map(season => (
                                    <button
                                        key={season}
                                        onClick={() => updateField('target_intake_season', season)}
                                        className={`flex-1 p-3 rounded-xl border transition-all ${formData.target_intake_season === season
                                            ? 'border-primary bg-primary/20'
                                            : 'border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {season}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex gap-2">
                                {[0, 1, 2].map(offset => {
                                    const year = new Date().getFullYear() + offset;
                                    return (
                                        <button
                                            key={year}
                                            onClick={() => updateField('target_intake_year', year)}
                                            className={`flex-1 p-3 rounded-xl border transition-all ${formData.target_intake_year === year
                                                ? 'border-primary bg-primary/20'
                                                : 'border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            {year}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Preferences Step
    const PreferencesStep = () => (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Where & How Much?</h2>
                <p className="text-gray-400">Select destinations and budget for your studies</p>
            </div>

            {/* Countries */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                    Preferred Countries <span className="text-gray-500">(select multiple)</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                    {COUNTRY_OPTIONS.map(country => (
                        <button
                            key={country.code}
                            onClick={() => toggleCountry(country.code)}
                            className={`group relative p-3 rounded-2xl border-2 text-center transition-all duration-300 hover:scale-105 ${formData.preferred_countries.includes(country.code)
                                ? 'border-amber-500 bg-amber-500/20 shadow-lg shadow-amber-500/20'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className="text-3xl mb-1">{country.flag}</div>
                            <div className="text-xs font-medium truncate">{country.name}</div>
                            {country.popular && (
                                <span className="absolute -top-1 -right-1 text-xs">⭐</span>
                            )}
                            {country.affordable && (
                                <span className="absolute -top-1 -right-1 text-xs">💚</span>
                            )}
                            {formData.preferred_countries.includes(country.code) && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-xs">
                                    ✓
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Budget */}
            {formData.preferred_countries.length > 0 && (
                <div className="animate-slide-up">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Annual Budget (Tuition + Living)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {BUDGET_OPTIONS.map(budget => (
                            <button
                                key={budget.label}
                                onClick={() => selectBudget(budget)}
                                className={`group p-4 rounded-2xl border-2 text-center transition-all duration-300 hover:scale-[1.02] ${formData.budget_range_min === budget.min
                                    ? 'border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/20'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="text-2xl mb-1">{budget.icon}</div>
                                <div className="font-bold text-white">{budget.label}</div>
                                <div className="text-xs text-gray-400">{budget.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Funding Plan */}
            {formData.budget_range_min && (
                <div className="animate-slide-up">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        How will you fund your studies?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { value: 'Self-funded', icon: '💰', desc: 'Personal/Family savings' },
                            { value: 'Loan', icon: '🏦', desc: 'Education loan' },
                            { value: 'Mix', icon: '⚖️', desc: 'Savings + Loan' },
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => updateField('funding_plan', option.value)}
                                className={`p-4 rounded-2xl border-2 text-center transition-all ${formData.funding_plan === option.value
                                    ? 'border-blue-500 bg-blue-500/20'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="text-2xl mb-1">{option.icon}</div>
                                <div className="font-medium text-white">{option.value}</div>
                                <div className="text-xs text-gray-400">{option.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // Readiness Step
    const ReadinessStep = () => (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">How prepared are you?</h2>
                <p className="text-gray-400">This helps us create your personalized action plan</p>
            </div>

            <div className="space-y-6">
                {/* IELTS/TOEFL */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">English Proficiency (IELTS/TOEFL)</span>
                        <span className="text-2xl">🗣️</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { value: 'not-started', label: 'Not Started', icon: '⏳' },
                            { value: 'preparing', label: 'Preparing', icon: '📖' },
                            { value: 'scheduled', label: 'Scheduled', icon: '📅' },
                            { value: 'completed', label: 'Done', icon: '✅' },
                        ].map(status => (
                            <button
                                key={status.value}
                                onClick={() => updateField('ielts_status', status.value)}
                                className={`p-3 rounded-xl border text-center transition-all ${formData.ielts_status === status.value
                                    ? 'border-primary bg-primary/20'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="text-xl">{status.icon}</div>
                                <div className="text-xs mt-1">{status.label}</div>
                            </button>
                        ))}
                    </div>
                    {formData.ielts_status === 'completed' && (
                        <div className="mt-3 animate-slide-up">
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="9"
                                placeholder="Your IELTS score (e.g., 7.5)"
                                value={formData.ielts_score}
                                onChange={(e) => updateField('ielts_score', e.target.value)}
                                className="input w-full"
                            />
                        </div>
                    )}
                </div>

                {/* GRE */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">GRE/GMAT Status</span>
                        <span className="text-2xl">📊</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { value: 'not-started', label: 'Not Started', icon: '⏳' },
                            { value: 'preparing', label: 'Preparing', icon: '📖' },
                            { value: 'completed', label: 'Done', icon: '✅' },
                            { value: 'not-required', label: 'Not Needed', icon: '➖' },
                        ].map(status => (
                            <button
                                key={status.value}
                                onClick={() => updateField('gre_status', status.value)}
                                className={`p-3 rounded-xl border text-center transition-all ${formData.gre_status === status.value
                                    ? 'border-primary bg-primary/20'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="text-xl">{status.icon}</div>
                                <div className="text-xs mt-1">{status.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* SOP */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Statement of Purpose</span>
                        <span className="text-2xl">✍️</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { value: 'not-started', label: 'Not Started', icon: '⏳' },
                            { value: 'draft', label: 'Draft Ready', icon: '📝' },
                            { value: 'ready', label: 'Finalized', icon: '✅' },
                        ].map(status => (
                            <button
                                key={status.value}
                                onClick={() => updateField('sop_status', status.value)}
                                className={`p-3 rounded-xl border text-center transition-all ${formData.sop_status === status.value
                                    ? 'border-primary bg-primary/20'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="text-xl">{status.icon}</div>
                                <div className="text-xs mt-1">{status.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // Complete Step
    const CompleteStep = () => {
        const summary = [
            { label: 'Education', value: formData.current_education_level, icon: '📚' },
            { label: 'Target', value: formData.intended_degree?.toUpperCase(), icon: '🎯' },
            { label: 'Field', value: formData.field_of_study, icon: '💡' },
            { label: 'Countries', value: formData.preferred_countries.length + ' selected', icon: '🌍' },
            { label: 'Budget', value: `$${(formData.budget_range_min / 1000).toFixed(0)}k - $${(formData.budget_range_max / 1000).toFixed(0)}k`, icon: '💰' },
        ];

        return (
            <div className="text-center space-y-8">
                <div className="relative inline-block">
                    <div className="text-8xl animate-bounce">🎉</div>
                    <div className="absolute -top-2 -left-4 text-3xl animate-pulse">✨</div>
                    <div className="absolute -top-2 -right-4 text-3xl animate-pulse delay-100">✨</div>
                </div>

                <div>
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-emerald-400 bg-clip-text text-transparent">
                        You're All Set!
                    </h2>
                    <p className="text-gray-400">
                        Your AI Counsellor is ready to guide you
                    </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-left max-w-md mx-auto">
                    <h3 className="font-semibold mb-4 text-center">Your Profile Summary</h3>
                    <div className="space-y-3">
                        {summary.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <span className="flex items-center gap-2 text-gray-400">
                                    <span>{item.icon}</span>
                                    {item.label}
                                </span>
                                <span className="font-medium text-white">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    {[
                        { icon: '🤖', label: 'AI Counsellor', desc: 'Unlocked' },
                        { icon: '🎓', label: 'Universities', desc: 'Ready' },
                        { icon: '📋', label: 'Tasks', desc: 'Generated' },
                    ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
                            <div className="text-2xl mb-1">{item.icon}</div>
                            <div className="text-sm font-medium">{item.label}</div>
                            <div className="text-xs text-emerald-400">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderStep = () => {
        const stepId = STEPS[currentStep].id;
        switch (stepId) {
            case 'welcome': return <WelcomeStep />;
            case 'education': return <EducationStep />;
            case 'goals': return <GoalsStep />;
            case 'preferences': return <PreferencesStep />;
            case 'readiness': return <ReadinessStep />;
            case 'complete': return <CompleteStep />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r ${STEPS[currentStep].color} opacity-20 rounded-full blur-3xl transition-all duration-1000`} />
                <div className={`absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-r ${STEPS[currentStep].color} opacity-20 rounded-full blur-3xl transition-all duration-1000`} />
            </div>

            {/* Progress Bar */}
            <div className="relative bg-dark-800/80 backdrop-blur-xl border-b border-white/10 p-4 z-10">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-full bg-gradient-to-r ${STEPS[currentStep].color} flex items-center justify-center text-sm`}>
                                {STEPS[currentStep].icon}
                            </span>
                            <span className="font-medium">{STEPS[currentStep].title}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                            {currentStep + 1} of {STEPS.length}
                        </span>
                    </div>
                    <div className="flex gap-1.5">
                        {STEPS.map((step, idx) => (
                            <div
                                key={idx}
                                className={`flex-1 h-2 rounded-full transition-all duration-500 ${idx < currentStep
                                    ? `bg-gradient-to-r ${step.color}`
                                    : idx === currentStep
                                        ? `bg-gradient-to-r ${step.color} animate-pulse`
                                        : 'bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className={`w-full max-w-2xl transition-all duration-300 ${animating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>
                    {error && <div className="alert alert-error mb-4">{error}</div>}
                    {renderStep()}
                </div>
            </div>

            {/* Navigation */}
            <div className="relative bg-dark-800/80 backdrop-blur-xl border-t border-white/10 p-4 z-10">
                <div className="max-w-2xl mx-auto flex gap-4">
                    {currentStep > 0 && (
                        <button
                            onClick={handleBack}
                            className="btn btn-secondary px-8"
                            disabled={animating}
                        >
                            ← Back
                        </button>
                    )}
                    <div className="flex-1" />
                    {currentStep < STEPS.length - 1 ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed() || animating}
                            className={`btn px-8 ${canProceed()
                                ? `bg-gradient-to-r ${STEPS[currentStep].color} hover:opacity-90`
                                : 'btn-secondary opacity-50'
                                }`}
                        >
                            {currentStep === 0 ? "Let's Go! →" : 'Continue →'}
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn bg-gradient-to-r from-primary via-secondary to-emerald-500 px-8 hover:opacity-90"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Launching...
                                </>
                            ) : (
                                'Launch Dashboard 🚀'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
