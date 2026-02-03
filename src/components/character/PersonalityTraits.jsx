import Input, { Textarea } from '../common/Input';

const PERSONALITY_SUGGESTIONS = [
    'Brave and bold', 'Cautious and calculating', 'Curious explorer',
    'Honorable protector', 'Mischievous trickster', 'Silent observer'
];

const TRAIT_SUGGESTIONS = [
    'Always tells the truth', 'Secretly afraid of the dark', 'Loves to sing',
    'Collects unusual objects', 'Never backs down from a challenge', 'Fiercely loyal to friends'
];

export default function PersonalityTraits({ name, personality, traits, onNameChange, onPersonalityChange, onTraitsChange }) {
    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Personality & Traits</h2>
            <p className="text-gray-600 mb-8">Define who your character is beyond their abilities.</p>

            <div className="space-y-8">
                {/* Character Name - First! */}
                <Input
                    label="Character Name"
                    placeholder="Enter your character's name"
                    value={name || ''}
                    onChange={(e) => onNameChange(e.target.value)}
                />

                {/* Personality */}
                <div>
                    <Textarea
                        label="Personality"
                        placeholder="Describe your character's personality..."
                        value={personality || ''}
                        onChange={(e) => onPersonalityChange(e.target.value)}
                        rows={3}
                    />
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                            {PERSONALITY_SUGGESTIONS.map(suggestion => (
                                <button
                                    key={suggestion}
                                    onClick={() => onPersonalityChange(personality ? `${personality}, ${suggestion.toLowerCase()}` : suggestion)}
                                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Traits */}
                <div>
                    <Textarea
                        label="Character Traits"
                        placeholder="List notable traits, quirks, or habits..."
                        value={traits || ''}
                        onChange={(e) => onTraitsChange(e.target.value)}
                        rows={3}
                    />
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                            {TRAIT_SUGGESTIONS.map(suggestion => (
                                <button
                                    key={suggestion}
                                    onClick={() => onTraitsChange(traits ? `${traits}\n• ${suggestion}` : `• ${suggestion}`)}
                                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview */}
            {(name || personality || traits) && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-3">Character Preview</h3>
                    {name && (
                        <div className="mb-4">
                            <span className="text-sm text-gray-500">Name:</span>
                            <p className="text-gray-700 font-medium">{name}</p>
                        </div>
                    )}
                    {personality && (
                        <div className="mb-4">
                            <span className="text-sm text-gray-500">Personality:</span>
                            <p className="text-gray-700">{personality}</p>
                        </div>
                    )}
                    {traits && (
                        <div>
                            <span className="text-sm text-gray-500">Traits:</span>
                            <p className="text-gray-700 whitespace-pre-line">{traits}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

