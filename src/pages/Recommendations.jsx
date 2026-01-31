import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationsAPI, shortlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const Recommendations = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [addingToShortlist, setAddingToShortlist] = useState({});
    const [shortlistedNames, setShortlistedNames] = useState(new Set());
    const [showOverBudget, setShowOverBudget] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        country: 'all',
        acceptanceChance: 'all',
        minFitScore: 0,
        scholarshipOnly: false,
        sortBy: 'fit_score',
        sortOrder: 'desc'
    });

    // Get user's max budget
    const userBudget = user?.profile_data?.budget_range_max || null;

    useEffect(() => {
        fetchRecommendations();
        fetchShortlist();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const response = await recommendationsAPI.get();
            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    };

    // Fetch current shortlist to know what's already added
    const fetchShortlist = async () => {
        try {
            const response = await shortlistAPI.get();
            const shortlists = response.data.shortlists || response.data || [];
            const names = new Set(shortlists.map(s => s.uni_name?.toLowerCase()));
            setShortlistedNames(names);
        } catch {
            console.error('Failed to fetch shortlist');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await recommendationsAPI.refresh();
            await fetchRecommendations();
        } catch {
            setError('Failed to refresh recommendations');
        } finally {
            setRefreshing(false);
        }
    };

    const handleAddToShortlist = async (uni, category) => {
        setAddingToShortlist(prev => ({ ...prev, [uni.name]: true }));
        try {
            await shortlistAPI.add({
                uni_name: uni.name,
                country: uni.location?.split(', ').pop() || uni.location,
                category,
                why_fits: uni.why_fits,
                key_risks: uni.key_risks,
                acceptance_chance: uni.acceptance_chance,
                data: {
                    tuition_fee: uni.tuition_fee,
                    ranking: uni.ranking,
                    fit_score: uni.fit_score,
                }
            });
            // Mark as shortlisted permanently
            setShortlistedNames(prev => new Set([...prev, uni.name.toLowerCase()]));
            setAddingToShortlist(prev => ({ ...prev, [uni.name]: 'done' }));
        } catch {
            setError('Failed to add to shortlist');
            setAddingToShortlist(prev => ({ ...prev, [uni.name]: false }));
        }
    };

    // Parse tuition fee string to number for comparison
    const parseTuition = (tuitionStr) => {
        if (!tuitionStr) return 0;
        // Extract numbers from strings like "$45,000/year" or "45000"
        const match = tuitionStr.toString().replace(/,/g, '').match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    };

    // Check if university is over budget
    const isOverBudget = (uni) => {
        if (!userBudget) return false;
        const tuition = parseTuition(uni.tuition_fee);
        return tuition > userBudget;
    };

    // Extract country from location string
    const extractCountry = (location) => {
        if (!location) return 'Unknown';
        const parts = location.split(', ');
        return parts[parts.length - 1] || location;
    };

    // Get unique countries from all universities
    const getUniqueCountries = () => {
        if (!data) return [];
        const allUnis = [...(data.dream || []), ...(data.target || []), ...(data.safe || [])];
        const countries = [...new Set(allUnis.map(u => extractCountry(u.location)))].filter(Boolean);
        return countries.sort();
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            country: 'all',
            acceptanceChance: 'all',
            minFitScore: 0,
            scholarshipOnly: false,
            sortBy: 'fit_score',
            sortOrder: 'desc'
        });
        setShowOverBudget(false);
    };

    // Count active filters
    const activeFilterCount = [
        filters.country !== 'all',
        filters.acceptanceChance !== 'all',
        filters.minFitScore > 0,
        filters.scholarshipOnly,
        !showOverBudget && userBudget
    ].filter(Boolean).length;

    if (loading) return <Loader />;

    const categories = [
        { id: 'all', label: 'All', icon: '🌟' },
        { id: 'dream', label: 'Dream', icon: '✨', color: 'dream' },
        { id: 'target', label: 'Target', icon: '🎯', color: 'target' },
        { id: 'safe', label: 'Safe', icon: '🛡️', color: 'safe' },
    ];

    const getUniversities = () => {
        if (!data) return [];
        let unis = [];
        if (activeTab === 'all') {
            unis = [
                ...(data.dream || []).map(u => ({ ...u, category: 'Dream' })),
                ...(data.target || []).map(u => ({ ...u, category: 'Target' })),
                ...(data.safe || []).map(u => ({ ...u, category: 'Safe' })),
            ];
        } else {
            unis = (data[activeTab] || []).map(u => ({ ...u, category: activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }));
        }

        // Filter by budget if toggle is off
        if (!showOverBudget && userBudget) {
            unis = unis.filter(uni => !isOverBudget(uni));
        }

        // Apply country filter
        if (filters.country !== 'all') {
            unis = unis.filter(uni => extractCountry(uni.location) === filters.country);
        }

        // Apply acceptance chance filter
        if (filters.acceptanceChance !== 'all') {
            unis = unis.filter(uni => uni.acceptance_chance === filters.acceptanceChance);
        }

        // Apply fit score filter
        if (filters.minFitScore > 0) {
            unis = unis.filter(uni => (uni.fit_score || 0) >= filters.minFitScore);
        }

        // Apply scholarship filter
        if (filters.scholarshipOnly) {
            unis = unis.filter(uni => uni.scholarship_available);
        }

        // Apply sorting
        unis.sort((a, b) => {
            let aVal, bVal;
            switch (filters.sortBy) {
                case 'fit_score':
                    aVal = a.fit_score || 0;
                    bVal = b.fit_score || 0;
                    break;
                case 'tuition':
                    aVal = parseTuition(a.tuition_fee);
                    bVal = parseTuition(b.tuition_fee);
                    break;
                case 'name':
                    aVal = a.name?.toLowerCase() || '';
                    bVal = b.name?.toLowerCase() || '';
                    return filters.sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                default:
                    aVal = a.fit_score || 0;
                    bVal = b.fit_score || 0;
            }
            return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return unis;
    };

    const universities = getUniversities();

    // Count over-budget universities
    const getAllUnis = () => {
        if (!data) return [];
        return [
            ...(data.dream || []).map(u => ({ ...u, category: 'Dream' })),
            ...(data.target || []).map(u => ({ ...u, category: 'Target' })),
            ...(data.safe || []).map(u => ({ ...u, category: 'Safe' })),
        ];
    };
    const overBudgetCount = userBudget ? getAllUnis().filter(isOverBudget).length : 0;

    return (
        <div className="space-y-6 pb-20 md:pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display">University Recommendations</h1>
                    <p className="text-gray-400 mt-1">
                        AI-curated universities based on your profile ({data?.metadata?.total_universities || 0} total)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link to="/shortlist" className="btn btn-secondary">
                        ⭐ View Shortlist ({shortlistedNames.size})
                    </Link>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="btn btn-primary"
                    >
                        {refreshing ? (
                            <>
                                <span className="spinner"></span>
                                Refreshing...
                            </>
                        ) : (
                            <>🔄 Refresh</>
                        )}
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Budget Filter */}
            {userBudget && overBudgetCount > 0 && (
                <div className="card bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💰</span>
                            <div>
                                <p className="font-medium">Your Budget: ${userBudget.toLocaleString()}/year</p>
                                <p className="text-sm text-gray-400">
                                    {overBudgetCount} universities are above your budget
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowOverBudget(!showOverBudget)}
                            className={`btn ${showOverBudget ? 'btn-secondary' : 'btn-ghost border border-amber-500/30'} text-sm`}
                        >
                            {showOverBudget ? '🛡️ Hide Over Budget' : `💸 Show Over Budget (${overBudgetCount})`}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs and Filter Toggle */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map(({ id, label, icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === id
                                ? 'bg-gradient-to-r from-primary to-secondary text-white'
                                : 'text-themed-secondary hover:text-themed'
                                }`}
                            style={{
                                background: activeTab === id ? undefined : 'var(--bg-secondary)'
                            }}
                        >
                            <span>{icon}</span>
                            <span>{label}</span>
                            {id !== 'all' && (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === id ? 'bg-white/20' : ''}`}
                                    style={{ background: activeTab === id ? undefined : 'var(--bg-card)' }}>
                                    {(data?.[id] || []).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} text-sm flex items-center gap-2`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{activeFilterCount}</span>
                    )}
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div
                    className="rounded-2xl p-5 space-y-4 animate-fade-in"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-themed flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Filter & Sort
                        </h3>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={resetFilters}
                                className="text-sm text-primary hover:text-primary-dark transition-colors"
                            >
                                Reset All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Country Filter */}
                        <div>
                            <label className="label">Country</label>
                            <select
                                value={filters.country}
                                onChange={(e) => setFilters(f => ({ ...f, country: e.target.value }))}
                                className="input text-sm"
                            >
                                <option value="all">All Countries</option>
                                {getUniqueCountries().map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        {/* Acceptance Chance Filter */}
                        <div>
                            <label className="label">Acceptance Chance</label>
                            <select
                                value={filters.acceptanceChance}
                                onChange={(e) => setFilters(f => ({ ...f, acceptanceChance: e.target.value }))}
                                className="input text-sm"
                            >
                                <option value="all">Any Chance</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="label">Sort By</label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                                className="input text-sm"
                            >
                                <option value="fit_score">Fit Score</option>
                                <option value="tuition">Tuition Fee</option>
                                <option value="name">Name</option>
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="label">Order</label>
                            <select
                                value={filters.sortOrder}
                                onChange={(e) => setFilters(f => ({ ...f, sortOrder: e.target.value }))}
                                className="input text-sm"
                            >
                                <option value="desc">Highest First</option>
                                <option value="asc">Lowest First</option>
                            </select>
                        </div>
                    </div>

                    {/* Second Row - Sliders and Toggles */}
                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        {/* Min Fit Score Slider */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="label flex justify-between">
                                <span>Min Fit Score</span>
                                <span className="text-primary font-semibold">{filters.minFitScore}/10</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="1"
                                value={filters.minFitScore}
                                onChange={(e) => setFilters(f => ({ ...f, minFitScore: parseInt(e.target.value) }))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, var(--color-primary) ${filters.minFitScore * 10}%, var(--bg-secondary) ${filters.minFitScore * 10}%)`
                                }}
                            />
                        </div>

                        {/* Scholarship Toggle */}
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={filters.scholarshipOnly}
                                    onChange={(e) => setFilters(f => ({ ...f, scholarshipOnly: e.target.checked }))}
                                    className="sr-only"
                                />
                                <div className={`w-11 h-6 rounded-full transition-colors ${filters.scholarshipOnly ? 'bg-primary' : ''}`}
                                    style={{ background: filters.scholarshipOnly ? undefined : 'var(--bg-secondary)' }}>
                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${filters.scholarshipOnly ? 'translate-x-5' : ''}`} />
                                </div>
                            </div>
                            <span className="text-sm text-themed-secondary">Scholarship Available</span>
                        </label>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <p className="text-sm text-themed-muted">
                            Showing <span className="font-semibold text-themed">{universities.length}</span> of {getAllUnis().length} universities
                        </p>
                        {activeFilterCount > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* University Grid */}
            {universities.length === 0 ? (
                <div className="card text-center py-12">
                    <div className="text-5xl mb-4">🎓</div>
                    <h3 className="text-lg font-semibold mb-2">
                        {data && getAllUnis().length > 0
                            ? 'All universities exceed your budget'
                            : 'No Recommendations Yet'
                        }
                    </h3>
                    <p className="text-gray-400 mb-4">
                        {data && getAllUnis().length > 0
                            ? 'Try increasing your budget or click "Show Over Budget" to see all options'
                            : 'Complete your profile to get personalized university recommendations'
                        }
                    </p>
                    {data && getAllUnis().length > 0 ? (
                        <button onClick={() => setShowOverBudget(true)} className="btn btn-primary">
                            💸 Show Over Budget Universities
                        </button>
                    ) : (
                        <Link to="/profile" className="btn btn-primary">
                            Complete Profile
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {universities.map((uni, idx) => (
                        <UniversityCard
                            key={`${uni.name}-${idx}`}
                            university={uni}
                            onAddToShortlist={() => handleAddToShortlist(uni, uni.category)}
                            isAdding={addingToShortlist[uni.name]}
                            isShortlisted={shortlistedNames.has(uni.name.toLowerCase())}
                            isOverBudget={isOverBudget(uni)}
                            userBudget={userBudget}
                        />
                    ))}
                </div>
            )}

            {/* Cached Info */}
            {data?.cached && (
                <p className="text-center text-gray-500 text-sm">
                    Showing cached recommendations from {new Date(data.generated_at).toLocaleDateString()}
                </p>
            )}
        </div>
    );
};

// University Card Component
const UniversityCard = ({ university, onAddToShortlist, isAdding, isShortlisted, isOverBudget, userBudget }) => {
    const [expanded, setExpanded] = useState(false);

    const categoryStyles = {
        Dream: { badge: 'badge-dream', border: 'hover:border-amber-500/30' },
        Target: { badge: 'badge-target', border: 'hover:border-blue-500/30' },
        Safe: { badge: 'badge-safe', border: 'hover:border-emerald-500/30' },
    };

    const chanceColors = {
        Low: 'text-red-400',
        Medium: 'text-amber-400',
        High: 'text-emerald-400',
    };

    const style = categoryStyles[university.category] || categoryStyles.Target;
    const alreadyShortlisted = isShortlisted || isAdding === 'done';

    return (
        <div className={`card ${style.border} transition-all relative ${alreadyShortlisted ? 'border-emerald-500/30 bg-emerald-500/5' : ''} ${isOverBudget ? 'border-amber-500/20' : ''}`}>
            {/* Over Budget Badge */}
            {isOverBudget && (
                <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    💸 Over Budget
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                    <h3 className="font-semibold text-lg leading-tight">{university.name}</h3>
                    <p className="text-sm text-gray-400">{university.location}</p>
                </div>
                <div className="flex gap-1">
                    {alreadyShortlisted && <span className="badge badge-success text-xs">⭐ Saved</span>}
                    <span className={`badge ${style.badge}`}>{university.category}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/10">
                <div className="text-center">
                    <p className="text-lg font-semibold">{university.fit_score}/10</p>
                    <p className="text-xs text-gray-500">Fit Score</p>
                </div>
                <div className="text-center">
                    <p className={`text-lg font-semibold ${chanceColors[university.acceptance_chance]}`}>
                        {university.acceptance_chance}
                    </p>
                    <p className="text-xs text-gray-500">Chance</p>
                </div>
                <div className="text-center">
                    <p className={`text-lg font-semibold ${isOverBudget ? 'text-amber-400' : 'text-gray-300'}`}>
                        {university.tuition_fee}
                    </p>
                    <p className="text-xs text-gray-500">Tuition</p>
                </div>
            </div>

            {/* Over Budget Warning */}
            {isOverBudget && userBudget && (
                <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                    <p className="text-amber-400">
                        ⚠️ Exceeds your ${userBudget.toLocaleString()} budget. Consider scholarships or funding options.
                    </p>
                </div>
            )}

            {/* Fit Score Bar */}
            <div className="my-3">
                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                        style={{ width: `${(university.fit_score / 10) * 100}%` }}
                    />
                </div>
            </div>

            {/* Why Fits */}
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                {university.why_fits}
            </p>

            {/* Expanded Content */}
            {expanded && (
                <div className="space-y-3 mb-3 animate-fade-in">
                    {/* Risks */}
                    {university.key_risks && university.key_risks.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Key Risks:</p>
                            <ul className="space-y-1">
                                {university.key_risks.map((risk, i) => (
                                    <li key={i} className="text-sm text-amber-400/80 flex items-start gap-2">
                                        <span>⚠️</span>
                                        <span>{risk}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-500">Ranking: </span>
                            <span className="text-gray-300">{university.ranking}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Scholarship: </span>
                            <span className={university.scholarship_available ? 'text-emerald-400' : 'text-gray-500'}>
                                {university.scholarship_available ? 'Available' : 'Limited'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-3">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="btn btn-ghost flex-1 text-sm py-2"
                >
                    {expanded ? 'Show Less' : 'Show More'}
                </button>
                {alreadyShortlisted ? (
                    <Link to="/shortlist" className="btn btn-secondary flex-1 text-sm py-2">
                        ✓ View in Shortlist
                    </Link>
                ) : (
                    <button
                        onClick={onAddToShortlist}
                        disabled={isAdding === true}
                        className="btn btn-primary flex-1 text-sm py-2"
                    >
                        {isAdding === true ? (
                            <span className="spinner"></span>
                        ) : (
                            '⭐ Shortlist'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Recommendations;
