import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { adventures } from '../data/adventures';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input, { Textarea } from '../components/common/Input';

export default function AdventureSelection() {
    const navigate = useNavigate();
    const { setAdventure, startGame, state } = useGame();

    const [selectedType, setSelectedType] = useState(null);
    const [selectedAdventure, setSelectedAdventure] = useState(null);
    const [customSettings, setCustomSettings] = useState({
        setting: '',
        theme: '',
        difficulty: 'normal',
        tags: ''
    });
    const [importCode, setImportCode] = useState('');
    const [error, setError] = useState('');

    const handleStartAdventure = () => {
        if (selectedType === 'premade' && selectedAdventure) {
            setAdventure(selectedAdventure);
            startGame();
            navigate('/game');
        } else if (selectedType === 'custom') {
            if (!customSettings.setting || !customSettings.theme) {
                setError('Please fill in setting and theme for your custom adventure');
                return;
            }
            const customAdventure = {
                id: 'custom-' + Date.now(),
                name: 'Custom Adventure',
                description: `A ${customSettings.theme} adventure in ${customSettings.setting}`,
                difficulty: customSettings.difficulty,
                tags: customSettings.tags.split(',').map(t => t.trim()).filter(Boolean),
                setting: customSettings.setting,
                openingNarrative: `You find yourself in ${customSettings.setting}. The air is thick with anticipation as your ${customSettings.theme} adventure begins.

What legends will you forge in this world? What challenges await around every corner?

The choice is yours. What do you do?`,
                icon: '🌟'
            };
            setAdventure(customAdventure);
            startGame();
            navigate('/game');
        } else if (selectedType === 'import') {
            try {
                const imported = JSON.parse(importCode);
                if (!imported.name || !imported.openingNarrative) {
                    throw new Error('Invalid adventure format');
                }
                setAdventure(imported);
                startGame();
                navigate('/game');
            } catch {
                setError('Invalid adventure code. Please check the format.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/create')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">Choose Your Adventure</h1>
                    </div>
                </div>
            </header>

            {/* Character Summary */}
            <div className="bg-primary-50 dark:bg-primary-900/30 border-b border-primary-100 dark:border-primary-800">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl">
                            👤
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {state.character.name || 'Your Hero'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                                {state.character.race} {state.character.class}
                                {state.companions.length > 0 && ` • ${state.companions.length} companions`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Adventure Type Selection */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {[
                        { id: 'premade', icon: '📜', title: 'Pre-made Adventure', desc: 'Classic quests ready to play' },
                        { id: 'custom', icon: '✨', title: 'Custom Adventure', desc: 'Create your own setting' },
                        { id: 'import', icon: '📥', title: 'Import Adventure', desc: 'Load from adventure code' }
                    ].map(type => (
                        <Card
                            key={type.id}
                            hover
                            onClick={() => {
                                setSelectedType(type.id);
                                setSelectedAdventure(null);
                                setError('');
                            }}
                            className={`text-center cursor-pointer ${selectedType === type.id ? 'ring-2 ring-primary-500 border-primary-200 dark:border-primary-600' : ''
                                }`}
                        >
                            <div className="text-4xl mb-3">{type.icon}</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{type.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{type.desc}</p>
                        </Card>
                    ))}
                </div>

                {/* Pre-made Adventures */}
                {selectedType === 'premade' && (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-4">Select a Quest</h2>
                        <div className="space-y-4">
                            {adventures.map(adventure => (
                                <Card
                                    key={adventure.id}
                                    hover
                                    onClick={() => setSelectedAdventure(adventure)}
                                    className={`cursor-pointer ${selectedAdventure?.id === adventure.id
                                        ? 'ring-2 ring-primary-500 border-primary-200 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                                        : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-4xl">{adventure.icon}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{adventure.name}</h3>
                                                <span className={`text-xs px-2 py-1 rounded-full ${adventure.difficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                                                    adventure.difficulty === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' :
                                                        'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                                                    }`}>
                                                    {adventure.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{adventure.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {adventure.tags.map(tag => (
                                                    <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                                <span className="text-xs text-gray-400 dark:text-gray-500">• {adventure.estimatedTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Custom Adventure */}
                {selectedType === 'custom' && (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-4">Design Your Adventure</h2>
                        <Card padding="lg">
                            <div className="space-y-4">
                                <Input
                                    label="Setting"
                                    placeholder="e.g., A dark forest, A floating city, An ancient dungeon..."
                                    value={customSettings.setting}
                                    onChange={(e) => setCustomSettings({ ...customSettings, setting: e.target.value })}
                                />
                                <Input
                                    label="Theme"
                                    placeholder="e.g., Horror, Mystery, Epic Fantasy, Comedy..."
                                    value={customSettings.theme}
                                    onChange={(e) => setCustomSettings({ ...customSettings, theme: e.target.value })}
                                />
                                <div>
                                    <label className="label dark:text-gray-300">Difficulty</label>
                                    <div className="flex gap-2">
                                        {['easy', 'normal', 'hard'].map(diff => (
                                            <button
                                                key={diff}
                                                onClick={() => setCustomSettings({ ...customSettings, difficulty: diff })}
                                                className={`flex-1 py-2 rounded-lg capitalize transition-all ${customSettings.difficulty === diff
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                                    }`}
                                            >
                                                {diff}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Input
                                    label="Tags (optional)"
                                    placeholder="e.g., Dragons, Politics, Romance (comma separated)"
                                    value={customSettings.tags}
                                    onChange={(e) => setCustomSettings({ ...customSettings, tags: e.target.value })}
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Import Adventure */}
                {selectedType === 'import' && (
                    <div className="animate-fade-in">
                        <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-4">Import Adventure</h2>
                        <Card padding="lg">
                            <Textarea
                                label="Adventure Code (JSON)"
                                placeholder='{"name": "My Adventure", "openingNarrative": "...", "setting": "..."}'
                                value={importCode}
                                onChange={(e) => setImportCode(e.target.value)}
                                rows={8}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Paste a valid JSON adventure code to import a custom adventure.
                            </p>
                        </Card>
                    </div>
                )}

                {/* Start Button */}
                {selectedType && (
                    <div className="mt-8 text-center">
                        <Button
                            variant="primary"
                            size="xl"
                            onClick={handleStartAdventure}
                            disabled={
                                (selectedType === 'premade' && !selectedAdventure) ||
                                (selectedType === 'import' && !importCode)
                            }
                        >
                            Begin Adventure →
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

