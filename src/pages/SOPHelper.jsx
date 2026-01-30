import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI, shortlistAPI } from '../services/api';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';

const SOPHelper = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [sopType, setSopType] = useState('');
    const [university, setUniversity] = useState(null);
    const [universities, setUniversities] = useState([]);
    const [sopContent, setSopContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        fetchShortlistAndLockedUni();
    }, []);

    useEffect(() => {
        const words = sopContent.trim().split(/\s+/).filter(w => w.length > 0).length;
        setWordCount(words);
    }, [sopContent]);

    const fetchShortlistAndLockedUni = async () => {
        try {
            const res = await shortlistAPI.get();
            setUniversities(res.data.shortlists || res.data || []);

            // Check for locked university
            if (user?.locked_university_id) {
                const locked = (res.data.shortlists || res.data || []).find(u => u.id === user.locked_university_id);
                if (locked) {
                    setUniversity(locked);
                }
            }
        } catch (err) {
            console.error('Failed to fetch shortlist');
        } finally {
            setLoading(false);
        }
    };

    const generateSOP = async () => {
        setGenerating(true);
        setSopContent('');

        const prompt = `Generate a professional ${sopType} for ${user?.name || 'the student'} applying to ${university?.uni_name || 'their dream university'}. 

Student Profile:
- Target Degree: ${user?.profile_data?.target_degree || 'Not specified'}
- Field of Study: ${user?.profile_data?.field_of_study || 'Not specified'}
- GPA: ${user?.profile_data?.gpa || 'Not specified'}
- Background: Based on their goal to study abroad

Requirements:
- Write in first person
- Be specific and personal
- Show genuine motivation
- Highlight relevant experience
- Keep it professional yet engaging
- Around 500-700 words

Generate only the ${sopType} content, no titles or headers.`;

        try {
            await chatAPI.sendMessageStream(
                prompt,
                null,
                // onChunk
                (chunk) => {
                    setSopContent(prev => prev + chunk);
                },
                // onDone
                () => {
                    setGenerating(false);
                },
                // onError
                () => {
                    setGenerating(false);
                    setSopContent('Error generating SOP. Please try again.');
                },
                // onAction
                () => { }
            );
        } catch (err) {
            setGenerating(false);
            setSopContent('Error generating SOP. Please try again.');
        }
    };

    const improveSection = async (instruction) => {
        if (!sopContent) return;
        setGenerating(true);

        const prompt = `Here is a Statement of Purpose draft:

"${sopContent}"

${instruction}

Provide the improved version only, no explanations.`;

        try {
            let improvedContent = '';
            await chatAPI.sendMessageStream(
                prompt,
                null,
                (chunk) => {
                    improvedContent += chunk;
                    setSopContent(improvedContent);
                },
                () => setGenerating(false),
                () => {
                    setGenerating(false);
                },
                () => { }
            );
        } catch (err) {
            setGenerating(false);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxLineWidth = pageWidth - margin * 2;

        // Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(sopType || 'Statement of Purpose', margin, margin);

        // University
        if (university) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'italic');
            doc.text(`For: ${university.uni_name}`, margin, margin + 8);
        }

        // Content
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(sopContent, maxLineWidth);
        doc.text(lines, margin, margin + 20);

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(128);
        doc.text(`Generated with AI Counsellor • ${new Date().toLocaleDateString()}`, margin, doc.internal.pageSize.getHeight() - 10);

        doc.save(`${sopType?.replace(/\s+/g, '_') || 'SOP'}_${university?.uni_name?.replace(/\s+/g, '_') || 'Draft'}.pdf`);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sopContent);
    };

    const sopTypes = [
        { id: 'sop', name: 'Statement of Purpose', icon: '📝', desc: 'Academic and career goals' },
        { id: 'personal', name: 'Personal Statement', icon: '👤', desc: 'Your personal journey' },
        { id: 'motivation', name: 'Motivation Letter', icon: '💪', desc: 'Why this program' },
        { id: 'cover', name: 'Cover Letter', icon: '✉️', desc: 'Professional introduction' },
    ];

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold font-display text-themed mb-2">
                    ✍️ AI SOP Helper
                </h1>
                <p className="text-themed-secondary">
                    Generate and refine your Statement of Purpose with AI assistance
                </p>
            </div>

            {/* Check if locked university exists */}
            {!university && !loading ? (
                <div
                    className="rounded-2xl p-8 text-center"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <div className="text-5xl mb-4">🔒</div>
                    <h3 className="text-xl font-semibold text-themed mb-2">No Locked University Found</h3>
                    <p className="text-themed-secondary mb-6 max-w-lg mx-auto">
                        To generate a tailored SOP, you first need to lock a university in your shortlist.
                    </p>
                    <Link to="/shortlist" className="btn btn-primary">
                        Go to Shortlist
                    </Link>
                </div>
            ) : (
                <>
                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${step >= s ? 'bg-primary text-white' : 'text-themed-muted'}`}
                                    style={{ background: step >= s ? undefined : 'var(--bg-secondary)' }}
                                >
                                    {s}
                                </div>
                                {s < 2 && (
                                    <div className={`w-12 h-1 rounded-full ${step > s ? 'bg-primary' : ''}`}
                                        style={{ background: step > s ? undefined : 'var(--border-color)' }} />
                                )}
                            </div>
                        ))}
                        <span className="ml-2 text-sm text-themed-muted">
                            {step === 1 ? 'Select Type' : 'Generate & Edit'}
                        </span>
                    </div>

                    {/* Step 1: Select Type */}
                    {step === 1 && (
                        <div>
                            <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--bg-secondary)' }}>
                                <span className="text-2xl">🎓</span>
                                <div>
                                    <p className="text-sm text-themed-muted">Creating SOP for:</p>
                                    <p className="font-semibold text-themed">{university?.uni_name}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {sopTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setSopType(type.name);
                                            setStep(2);
                                        }}
                                        className="p-6 rounded-2xl text-left transition-all hover:shadow-md group"
                                        style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-color)'
                                        }}
                                    >
                                        <div className="text-3xl mb-3">{type.icon}</div>
                                        <h3 className="font-semibold text-themed group-hover:text-primary transition-colors">
                                            {type.name}
                                        </h3>
                                        <p className="text-sm text-themed-muted mt-1">{type.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Generate & Edit */}
                    {step === 2 && (
                        <div>
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm text-themed-muted hover:text-themed mb-4 flex items-center gap-1"
                            >
                                ← Back to type selection
                            </button>

                            {/* Info Bar */}
                            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📝</span>
                                    <div>
                                        <p className="font-medium text-themed text-sm">{sopType}</p>
                                        <p className="text-xs text-themed-muted">{university?.uni_name}</p>
                                    </div>
                                </div>
                                <div className="flex-1" />
                                <div className="text-sm">
                                    <span className={wordCount > 500 && wordCount < 800 ? 'text-emerald-500' : 'text-themed-secondary'}>
                                        {wordCount} words
                                    </span>
                                    <span className="text-themed-muted"> / 500-700 ideal</span>
                                </div>
                            </div>

                            {/* Generate Button */}
                            {!sopContent && !generating && (
                                <button
                                    onClick={generateSOP}
                                    className="btn btn-primary w-full py-4 mb-6"
                                >
                                    ✨ Generate {sopType} with AI
                                </button>
                            )}

                            {/* Editor */}
                            <div className="mb-6">
                                <textarea
                                    value={sopContent}
                                    onChange={(e) => setSopContent(e.target.value)}
                                    placeholder={generating ? "AI is writing..." : "Your SOP content will appear here..."}
                                    disabled={generating}
                                    className="w-full h-96 p-6 rounded-2xl text-themed resize-none focus:ring-2 focus:ring-primary transition-all"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)'
                                    }}
                                />
                            </div>

                            {/* AI Improvement Tools */}
                            {sopContent && !generating && (
                                <>
                                    <h4 className="font-medium text-themed mb-3">AI Improvements</h4>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <button
                                            onClick={() => improveSection('Make it more professional and formal.')}
                                            className="px-4 py-2 rounded-xl text-sm transition-all hover:shadow-md"
                                            style={{ background: 'var(--bg-secondary)' }}
                                        >
                                            🎩 More Professional
                                        </button>
                                        <button
                                            onClick={() => improveSection('Add more specific details and examples. Make it more personal.')}
                                            className="px-4 py-2 rounded-xl text-sm transition-all hover:shadow-md"
                                            style={{ background: 'var(--bg-secondary)' }}
                                        >
                                            ✨ Add Details
                                        </button>
                                        <button
                                            onClick={() => improveSection('Make it more concise and impactful. Remove fluff.')}
                                            className="px-4 py-2 rounded-xl text-sm transition-all hover:shadow-md"
                                            style={{ background: 'var(--bg-secondary)' }}
                                        >
                                            ✂️ Make Concise
                                        </button>
                                        <button
                                            onClick={() => improveSection('Fix grammar, spelling, and improve sentence structure.')}
                                            className="px-4 py-2 rounded-xl text-sm transition-all hover:shadow-md"
                                            style={{ background: 'var(--bg-secondary)' }}
                                        >
                                            📝 Fix Grammar
                                        </button>
                                        <button
                                            onClick={generateSOP}
                                            className="px-4 py-2 rounded-xl text-sm transition-all hover:shadow-md"
                                            style={{ background: 'var(--bg-secondary)' }}
                                        >
                                            🔄 Regenerate
                                        </button>
                                    </div>

                                    {/* Export Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={exportToPDF}
                                            className="btn btn-primary flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Export to PDF
                                        </button>
                                        <button
                                            onClick={copyToClipboard}
                                            className="btn border transition-all"
                                            style={{ borderColor: 'var(--border-color)' }}
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copy to Clipboard
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Loading State */}
                            {generating && (
                                <div className="flex items-center gap-3 text-primary">
                                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>AI is writing...</span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SOPHelper;
