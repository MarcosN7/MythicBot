import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getRaceById } from '../data/races';
import Button from '../components/common/Button';
import RaceSelection from '../components/character/RaceSelection';
import ClassSelection from '../components/character/ClassSelection';
import StatAllocation from '../components/character/StatAllocation';
import SkillSelection from '../components/character/SkillSelection';
import PersonalityTraits from '../components/character/PersonalityTraits';
import BackgroundStory from '../components/character/BackgroundStory';
import CompanionSetup from '../components/character/CompanionSetup';
import FinalReview from '../components/character/FinalReview';

const STEPS = [
    { id: 1, name: 'Race', icon: '🧝' },
    { id: 2, name: 'Class', icon: '⚔️' },
    { id: 3, name: 'Stats', icon: '📊' },
    { id: 4, name: 'Skills', icon: '🎯' },
    { id: 5, name: 'Personality', icon: '💭' },
    { id: 6, name: 'Background', icon: '📖' },
    { id: 7, name: 'Companions', icon: '👥' },
    { id: 8, name: 'Review', icon: '✅' }
];

export default function CharacterCreator() {
    const navigate = useNavigate();
    const { state, setCharacterField, setCharacter, setStats, setSkills, setCompanions, setCurrentStep } = useGame();

    const [currentStep, setStep] = useState(1);
    const [errors, setErrors] = useState({});

    // Local state for wizard
    const [localData, setLocalData] = useState({
        race: state.character.race || null,
        class: state.character.class || null,
        stats: state.character.stats,
        skills: state.character.skills || [],
        personality: state.character.personality || '',
        traits: state.character.traits || '',
        name: state.character.name || '',
        background: state.character.background || '',
        companions: state.companions.length === 3 ? state.companions : [
            { name: '', race: '', class: '', personality: '' },
            { name: '', race: '', class: '', personality: '' },
            { name: '', race: '', class: '', personality: '' }
        ]
    });

    const updateLocalData = (field, value) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: null }));
    };

    const validateStep = () => {
        const newErrors = {};

        switch (currentStep) {
            case 1:
                if (!localData.race) newErrors.race = 'Please select a race';
                break;
            case 2:
                if (!localData.class) newErrors.class = 'Please select a class';
                break;
            case 3:
                // Stats are always valid with defaults
                break;
            case 4:
                // Skills are optional
                break;
            case 5:
                // Personality is optional
                break;
            case 6:
                // Background is optional
                break;
            case 7:
                // Check at least one companion has a name
                const hasCompanion = localData.companions.some(c => c.name && c.race && c.class);
                if (!hasCompanion) newErrors.companions = 'Create at least one companion';
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (currentStep < 8) {
                setStep(currentStep + 1);
            } else {
                handleFinish();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setStep(currentStep - 1);
        }
    };

    const handleFinish = () => {
        // Save all data to context
        setCharacter({
            name: localData.name,
            race: localData.race,
            class: localData.class,
            stats: localData.stats,
            skills: localData.skills,
            personality: localData.personality,
            traits: localData.traits,
            background: localData.background,
            hp: 10, // Will be calculated based on class
            maxHp: 10
        });
        setCompanions(localData.companions.filter(c => c.name && c.race && c.class));
        setCurrentStep(8);

        navigate('/adventure');
    };

    const handleSkip = () => {
        // Set dummy data for quick testing
        const dummyCharacter = {
            name: 'Test Hero',
            race: 'human',
            class: 'fighter',
            stats: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
            skills: ['athletics', 'perception'],
            personality: 'Brave and bold',
            traits: 'Never backs down from a challenge',
            background: 'A seasoned warrior seeking glory.',
            hp: 12,
            maxHp: 12
        };

        const dummyCompanions = [
            { name: 'Aria', race: 'elf', class: 'wizard', personality: 'Wise' },
            { name: 'Thorin', race: 'dwarf', class: 'cleric', personality: 'Grumpy' },
            { name: 'Shadow', race: 'halfling', class: 'rogue', personality: 'Mischievous' }
        ];

        setCharacter(dummyCharacter);
        setCompanions(dummyCompanions);
        setCurrentStep(8);
        navigate('/adventure');
    };

    const getRaceBonuses = () => {
        const race = getRaceById(localData.race);
        return race?.statBonuses || {};
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <RaceSelection
                        selectedRace={localData.race}
                        onSelect={(race) => updateLocalData('race', race)}
                    />
                );
            case 2:
                return (
                    <ClassSelection
                        selectedClass={localData.class}
                        onSelect={(cls) => updateLocalData('class', cls)}
                    />
                );
            case 3:
                return (
                    <StatAllocation
                        stats={localData.stats}
                        onStatsChange={(stats) => updateLocalData('stats', stats)}
                        raceBonuses={getRaceBonuses()}
                    />
                );
            case 4:
                return (
                    <SkillSelection
                        selectedClass={localData.class}
                        selectedSkills={localData.skills}
                        onSkillsChange={(skills) => updateLocalData('skills', skills)}
                    />
                );
            case 5:
                return (
                    <PersonalityTraits
                        name={localData.name}
                        personality={localData.personality}
                        traits={localData.traits}
                        onNameChange={(val) => updateLocalData('name', val)}
                        onPersonalityChange={(val) => updateLocalData('personality', val)}
                        onTraitsChange={(val) => updateLocalData('traits', val)}
                    />
                );
            case 6:
                return (
                    <BackgroundStory
                        background={localData.background}
                        onBackgroundChange={(val) => updateLocalData('background', val)}
                    />
                );
            case 7:
                return (
                    <CompanionSetup
                        companions={localData.companions}
                        onCompanionsChange={(companions) => updateLocalData('companions', companions)}
                    />
                );
            case 8:
                return (
                    <FinalReview
                        character={{ ...localData, stats: localData.stats }}
                        companions={localData.companions}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">Create Character</h1>
                        </div>
                        <button
                            onClick={handleSkip}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            Skip with Test Data
                        </button>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between overflow-x-auto pb-2">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <button
                                    onClick={() => step.id < currentStep && setStep(step.id)}
                                    className={`step-indicator ${step.id === currentStep ? 'active' :
                                        step.id < currentStep ? 'completed' : 'pending'
                                        }`}
                                    disabled={step.id > currentStep}
                                >
                                    {step.id < currentStep ? '✓' : step.icon}
                                </button>
                                {index < STEPS.length - 1 && (
                                    <div className={`w-8 md:w-12 h-0.5 mx-1 ${step.id < currentStep ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-600'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Step {currentStep} of 8</span>
                        <span>{STEPS[currentStep - 1].name}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Error display */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-red-700 dark:text-red-400 text-sm">
                            {Object.values(errors)[0]}
                        </p>
                    </div>
                )}

                {renderStep()}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200 dark:border-slate-700">
                    <Button
                        variant="secondary"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                    >
                        ← Back
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleNext}
                    >
                        {currentStep === 8 ? 'Finish & Continue' : 'Next →'}
                    </Button>
                </div>
            </main>
        </div>
    );
}

