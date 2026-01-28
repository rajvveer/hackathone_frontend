import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-dark-900 text-gray-100">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900 border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-display font-bold text-xl">
                        <span className="text-2xl">🎓</span>
                        <span>AI Counsellor</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="btn btn-primary transition-transform duration-150 hover:-translate-y-0.5"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="btn btn-ghost transition-transform duration-150 hover:-translate-y-0.5"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn btn-primary transition-transform duration-150 hover:-translate-y-0.5"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Simple status pill */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 border border-white/10 rounded-full text-sm text-gray-400 mb-8 animate-fade-in">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Powered by AI
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display leading-tight mb-6 animate-slide-up">
                        Your Personal
                        <span className="block text-primary-light mt-1">
                            Study Abroad Counsellor
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up">
                        Get AI-powered university recommendations, personalized guidance, and
                        step-by-step support for your international education journey.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
                        <Link
                            to="/register"
                            className="btn btn-primary text-lg px-8 py-4 transition-transform transition-shadow duration-150 hover:-translate-y-1 hover:shadow-lg"
                        >
                            Start Your Journey →
                        </Link>
                        <Link
                            to="/login"
                            className="btn btn-secondary text-lg px-8 py-4 transition-transform transition-shadow duration-150 hover:-translate-y-1 hover:shadow-lg"
                        >
                            Already have an account
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-white/10 animate-fade-in">
                        <div className="space-y-1">
                            <div className="text-3xl md:text-4xl font-bold text-primary-light">
                                500+
                            </div>
                            <div className="text-gray-500 text-sm">Universities</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl md:text-4xl font-bold text-primary-light">
                                8+
                            </div>
                            <div className="text-gray-500 text-sm">Countries</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl md:text-4xl font-bold text-primary-light">
                                24/7
                            </div>
                            <div className="text-gray-500 text-sm">AI Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-dark-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            From profile building to application submission, we guide you
                            through every step.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: '🤖',
                                title: 'AI Counsellor',
                                desc: 'Chat with an intelligent counsellor that understands your profile and goals',
                            },
                            {
                                icon: '🎯',
                                title: 'Smart Recommendations',
                                desc: 'Get Dream, Target, and Safe university suggestions based on your profile',
                            },
                            {
                                icon: '📊',
                                title: 'Profile Analysis',
                                desc: 'Understand your strengths and gaps with detailed profile insights',
                            },
                            {
                                icon: '✅',
                                title: 'Task Management',
                                desc: 'Stay on track with AI-generated tasks and deadlines',
                            },
                            {
                                icon: '📝',
                                title: 'Application Guidance',
                                desc: 'Step-by-step guidance for SOP, LORs, and document preparation',
                            },
                            {
                                icon: '🌍',
                                title: 'Global Coverage',
                                desc: 'Explore universities across USA, UK, Canada, Australia, and more',
                            },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="card border border-white/10 bg-dark-900/60 hover:border-primary/60 transition-transform transition-shadow duration-150 hover:-translate-y-1 hover:shadow-lg animate-fade-in"
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
                            How It Works
                        </h2>
                        <p className="text-gray-400">
                            Four simple steps to your dream university
                        </p>
                    </div>

                    <div className="space-y-8">
                        {[
                            {
                                step: 1,
                                title: 'Create Profile',
                                desc: 'Tell us about your education, goals, and preferences',
                            },
                            {
                                step: 2,
                                title: 'Get Recommendations',
                                desc: 'Receive AI-curated university suggestions',
                            },
                            {
                                step: 3,
                                title: 'Build Shortlist',
                                desc: 'Compare and finalize your target universities',
                            },
                            {
                                step: 4,
                                title: 'Apply with Guidance',
                                desc: 'Follow personalized application steps',
                            },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className="flex items-start gap-6 animate-slide-up"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl font-bold shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="card border border-primary/40 bg-dark-800 text-center py-12 animate-fade-in">
                        <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                            Join thousands of students who are using AI to navigate their
                            study abroad journey.
                        </p>
                        <Link
                            to="/register"
                            className="btn btn-primary text-lg px-8 py-4 transition-transform transition-shadow duration-150 hover:-translate-y-1 hover:shadow-lg"
                        >
                            Get Started for Free →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-gray-500">
                        <span className="text-xl">🎓</span>
                        <span>AI Counsellor © 2025</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-gray-300 transition-colors">
                            Privacy
                        </a>
                        <a href="#" className="hover:text-gray-300 transition-colors">
                            Terms
                        </a>
                        <a href="#" className="hover:text-gray-300 transition-colors">
                            Contact
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
