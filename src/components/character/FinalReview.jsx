import { getRaceById } from '../../data/races';
import { getClassById } from '../../data/classes';
import { getSkillById } from '../../data/skills';
import Card from '../common/Card';

export default function FinalReview({ character, companions }) {
    const race = getRaceById(character.race);
    const cls = getClassById(character.class);

    const getModifier = (score) => {
        const mod = Math.floor((score - 10) / 2);
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Review Your Character</h2>
            <p className="text-gray-600 mb-8">Make sure everything looks good before starting your adventure!</p>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Character Summary */}
                <Card padding="lg">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl">
                            {race?.icon || '👤'}
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-bold text-gray-900">
                                {character.name || 'Unnamed Hero'}
                            </h3>
                            <p className="text-gray-600">
                                {race?.name} {cls?.name}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Ability Scores</h4>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.entries(character.stats).map(([ability, score]) => (
                                <div key={ability} className="text-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-xs uppercase text-gray-500">{ability.slice(0, 3)}</span>
                                    <p className="text-xl font-bold text-gray-900">{score}</p>
                                    <span className="text-sm text-primary-600">{getModifier(score)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    {character.skills?.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {character.skills.map(skillId => {
                                    const skill = getSkillById(skillId);
                                    return (
                                        <span key={skillId} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                                            {skill?.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Traits */}
                    {(character.personality || character.traits) && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Personality & Traits</h4>
                            {character.personality && (
                                <p className="text-sm text-gray-600 mb-2">
                                    <span className="text-gray-500">Personality:</span> {character.personality}
                                </p>
                            )}
                            {character.traits && (
                                <p className="text-sm text-gray-600 whitespace-pre-line">
                                    <span className="text-gray-500">Traits:</span> {character.traits}
                                </p>
                            )}
                        </div>
                    )}
                </Card>

                {/* Companions & Background */}
                <div className="space-y-6">
                    {/* Companions */}
                    <Card padding="lg">
                        <h4 className="font-semibold text-gray-900 mb-4">Your Party</h4>
                        <div className="space-y-3">
                            {companions.map((companion, index) => {
                                const compRace = getRaceById(companion.race);
                                const compClass = getClassById(companion.class);
                                return (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <span className="text-2xl">{compRace?.icon || '❓'}</span>
                                        <div>
                                            <p className="font-medium text-gray-900">{companion.name || 'Unknown'}</p>
                                            <p className="text-sm text-gray-500">
                                                {compRace?.name} {compClass?.name}
                                                {companion.personality && ` • ${companion.personality}`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Background */}
                    {character.background && (
                        <Card padding="lg">
                            <h4 className="font-semibold text-gray-900 mb-2">Background</h4>
                            <p className="text-sm text-gray-600 line-clamp-6">{character.background}</p>
                        </Card>
                    )}

                    {/* Race & Class Details */}
                    <Card padding="lg" className="bg-primary-50 border-primary-100">
                        <h4 className="font-semibold text-gray-900 mb-3">Character Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Hit Dice:</span>
                                <p className="font-medium text-gray-900">{cls?.hitDice}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Speed:</span>
                                <p className="font-medium text-gray-900">{race?.speed} ft</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Primary Ability:</span>
                                <p className="font-medium text-gray-900">{cls?.primaryAbility}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Racial Traits:</span>
                                <p className="font-medium text-gray-900">{race?.traits?.length || 0}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                <div className="text-4xl mb-3">⚔️</div>
                <h3 className="text-xl font-display font-bold text-green-800 mb-2">Ready for Adventure!</h3>
                <p className="text-green-700">Click "Finish" to proceed to adventure selection.</p>
            </div>
        </div>
    );
}
