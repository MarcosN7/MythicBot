import { useState } from 'react';
import { races } from '../../data/races';
import { classes } from '../../data/classes';
import Input from '../common/Input';
import Button from '../common/Button';

const DEFAULT_COMPANION = { name: '', race: '', class: '', personality: '' };

export default function CompanionSetup({ companions, onCompanionsChange }) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Initialize with 3 empty companions if not set
    const currentCompanions = companions.length === 3
        ? companions
        : [DEFAULT_COMPANION, DEFAULT_COMPANION, DEFAULT_COMPANION];

    const updateCompanion = (index, field, value) => {
        const updated = [...currentCompanions];
        updated[index] = { ...updated[index], [field]: value };
        onCompanionsChange(updated);
    };

    const randomizeName = (index) => {
        const names = [
            'Althea', 'Brom', 'Celeste', 'Dorian', 'Elena', 'Finn',
            'Gwen', 'Hugo', 'Iris', 'Jasper', 'Kira', 'Leo',
            'Mira', 'Nolan', 'Ophelia', 'Percy', 'Quinn', 'Rowan'
        ];
        const randomName = names[Math.floor(Math.random() * names.length)];
        updateCompanion(index, 'name', randomName);
    };

    const randomizeCompanion = (index) => {
        const randomRace = races[Math.floor(Math.random() * races.length)];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        const personalities = ['Cheerful', 'Stoic', 'Sarcastic', 'Wise', 'Impulsive', 'Cautious'];
        const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)];

        const names = ['Althea', 'Brom', 'Celeste', 'Dorian', 'Elena', 'Finn', 'Gwen', 'Hugo'];
        const randomName = names[Math.floor(Math.random() * names.length)];

        const updated = [...currentCompanions];
        updated[index] = {
            name: randomName,
            race: randomRace.id,
            class: randomClass.id,
            personality: randomPersonality
        };
        onCompanionsChange(updated);
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Create Your Companions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Build your party of 3 AI companions to join you on your adventure.</p>

            {/* Companion Tabs */}
            <div className="flex gap-2 mb-6">
                {[0, 1, 2].map(index => {
                    const companion = currentCompanions[index];
                    const isComplete = companion.name && companion.race && companion.class;

                    return (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all ${activeIndex === index
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {companion.name || `Companion ${index + 1}`}
                                </span>
                                {isComplete && (
                                    <span className="text-green-500">✓</span>
                                )}
                            </div>
                            {companion.race && companion.class && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {races.find(r => r.id === companion.race)?.name} {' '}
                                    {classes.find(c => c.id === companion.class)?.name}
                                </p>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Active Companion Form */}
            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Companion {activeIndex + 1}</h3>
                    <Button variant="secondary" size="sm" onClick={() => randomizeCompanion(activeIndex)}>
                        🎲 Randomize
                    </Button>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            label="Name"
                            placeholder="Enter companion name"
                            value={currentCompanions[activeIndex].name}
                            onChange={(e) => updateCompanion(activeIndex, 'name', e.target.value)}
                            className="flex-1"
                        />
                        <button
                            onClick={() => randomizeName(activeIndex)}
                            className="self-end px-4 py-3 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 rounded-xl transition-colors dark:text-white"
                            title="Random name"
                        >
                            🎲
                        </button>
                    </div>

                    <div>
                        <label className="label dark:text-gray-300">Race</label>
                        <div className="grid grid-cols-4 gap-2">
                            {races.slice(0, 8).map(race => (
                                <button
                                    key={race.id}
                                    onClick={() => updateCompanion(activeIndex, 'race', race.id)}
                                    className={`p-2 rounded-lg text-center transition-all ${currentCompanions[activeIndex].race === race.id
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-primary-300 dark:text-white'
                                        }`}
                                >
                                    <span className="text-xl">{race.icon}</span>
                                    <p className="text-xs mt-1">{race.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="label dark:text-gray-300">Class</label>
                        <div className="grid grid-cols-4 gap-2">
                            {classes.map(cls => (
                                <button
                                    key={cls.id}
                                    onClick={() => updateCompanion(activeIndex, 'class', cls.id)}
                                    className={`p-2 rounded-lg text-center transition-all ${currentCompanions[activeIndex].class === cls.id
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-primary-300 dark:text-white'
                                        }`}
                                >
                                    <span className="text-xl">{cls.icon}</span>
                                    <p className="text-xs mt-1">{cls.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Input
                        label="Personality (optional)"
                        placeholder="e.g., Cheerful, Stoic, Sarcastic..."
                        value={currentCompanions[activeIndex].personality}
                        onChange={(e) => updateCompanion(activeIndex, 'personality', e.target.value)}
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Your Party</h4>
                <div className="flex gap-4">
                    {currentCompanions.map((companion, index) => {
                        const race = races.find(r => r.id === companion.race);
                        const cls = classes.find(c => c.id === companion.class);
                        return (
                            <div key={index} className="flex-1 text-center">
                                <div className="text-3xl mb-1">{race?.icon || '❓'}</div>
                                <p className="font-medium text-sm dark:text-white">{companion.name || '???'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{cls?.name || 'No class'}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
