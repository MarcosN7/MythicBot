import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useGame } from '../context/GameContext';

export default function LandingPage() {
    const navigate = useNavigate();
    const { state, resetGame } = useGame();

    const handleStartAdventure = () => {
        if (state.gameStarted) {
            navigate('/game');
        } else {
            navigate('/create');
        }
    };

    const handleNewAdventure = () => {
        resetGame();
        navigate('/create');
    };

    const features = [
        {
            icon: '🌌',
            title: 'Infinite Adventures',
            description: 'Explore countless procedurally generated quests and storylines that adapt to your choices.'
        },
        {
            icon: '🤖',
            title: 'AI Companions',
            description: 'Create and customize AI party members who fight alongside you with distinct personalities.'
        },
        {
            icon: '📖',
            title: 'Context-Aware Storytelling',
            description: 'Experience narratives that remember your actions and shape the world accordingly.'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-40 glass">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                            M
                        </div>
                        <span className="font-display font-bold text-xl text-gray-900">MythicBot</span>
                    </div>
                    {state.gameStarted && (
                        <Button variant="secondary" size="sm" onClick={() => navigate('/game')}>
                            Continue Game
                        </Button>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-8">
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                        AI-Powered Solo RPG
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gray-900 mb-6 leading-tight">
                        Your AI <span className="gradient-text">Dungeon Master</span> & Solo RPG Companion
                    </h1>

                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Create characters, embark on epic quests, and let AI guide your adventure.
                        No experience needed — just imagination.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button variant="primary" size="xl" onClick={handleStartAdventure}>
                            {state.gameStarted ? 'Continue Adventure' : 'Start Adventure'}
                            <span className="ml-2">→</span>
                        </Button>
                        {state.gameStarted && (
                            <Button variant="secondary" size="lg" onClick={handleNewAdventure}>
                                New Character
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                            Everything You Need for Solo Adventures
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            MythicBot combines the best of tabletop RPGs with modern AI to create
                            an unforgettable gaming experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                hover
                                className="text-center"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="text-5xl mb-6">{feature.icon}</div>
                                <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-12 text-center">
                        How It Works
                    </h2>

                    <div className="space-y-8">
                        {[
                            { step: 1, title: 'Create Your Hero', desc: 'Choose race, class, stats, and craft your backstory.' },
                            { step: 2, title: 'Select an Adventure', desc: 'Pick from pre-made quests or create your own.' },
                            { step: 3, title: 'Play Your Way', desc: 'Type actions, roll dice, and let the AI narrate.' }
                        ].map(item => (
                            <div key={item.step} className="flex items-start gap-6">
                                <div className="w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center font-bold shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="card p-12 bg-gradient-to-br from-primary-500 to-accent-600 text-white border-0">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                            Ready to Begin Your Quest?
                        </h2>
                        <p className="text-white/80 mb-8 max-w-xl mx-auto">
                            Your adventure awaits. Create your character and step into a world of endless possibilities.
                        </p>
                        <Button
                            variant="secondary"
                            size="xl"
                            onClick={handleStartAdventure}
                            className="bg-white text-primary-600 hover:bg-gray-100"
                        >
                            Start Now — It&apos;s Free
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-gray-100">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                            M
                        </div>
                        <span className="font-display font-semibold text-gray-700">MythicBot</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        © 2024 MythicBot. Built with ❤️ for solo adventurers.
                    </p>
                </div>
            </footer>
        </div>
    );
}
