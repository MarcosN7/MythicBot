import { getRaceById } from '../../data/races';
import { getClassById } from '../../data/classes';
import { getSkillById } from '../../data/skills';

export default function CharacterSheet({ character, onHpChange }) {
    const race = getRaceById(character.race);
    const cls = getClassById(character.class);

    const getModifier = (score) => {
        const mod = Math.floor((score - 10) / 2);
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    const hpPercentage = (character.hp / character.maxHp) * 100;
    const hpColor = hpPercentage > 50 ? 'bg-green-500' : hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="space-y-6">
            {/* Character Header */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl shadow-lg">
                    {race?.icon || '👤'}
                </div>
                <div>
                    <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                        {character.name || 'Hero'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Level {character.level} {race?.name} {cls?.name}
                    </p>
                </div>
            </div>

            {/* HP Bar */}
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hit Points</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {character.hp} / {character.maxHp}
                    </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${hpColor} transition-all duration-300`}
                        style={{ width: `${hpPercentage}%` }}
                    />
                </div>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={() => onHpChange(-1)}
                        className="flex-1 py-1 text-sm bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                    >
                        -1 HP
                    </button>
                    <button
                        onClick={() => onHpChange(1)}
                        className="flex-1 py-1 text-sm bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-900/60 text-green-700 dark:text-green-400 rounded-lg transition-colors"
                    >
                        +1 HP
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Ability Scores</h4>
                <div className="grid grid-cols-3 gap-2">
                    {Object.entries(character.stats).map(([ability, score]) => (
                        <div key={ability} className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <span className="text-xs uppercase text-gray-500 dark:text-gray-400">{ability.slice(0, 3)}</span>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{score}</p>
                            <span className="text-sm text-primary-600 dark:text-primary-400">{getModifier(score)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            {character.skills?.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Proficient Skills</h4>
                    <div className="flex flex-wrap gap-2">
                        {character.skills.map(skillId => {
                            const skill = getSkillById(skillId);
                            return (
                                <span
                                    key={skillId}
                                    className="px-3 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-xs"
                                >
                                    {skill?.name}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Class Info */}
            <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{cls?.name}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Hit Dice:</span>
                        <p className="font-medium dark:text-gray-200">{cls?.hitDice}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Speed:</span>
                        <p className="font-medium dark:text-gray-200">{race?.speed || 30} ft</p>
                    </div>
                </div>
            </div>

            {/* Racial Traits */}
            {race?.traits && (
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Racial Traits</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {race.traits.map(trait => (
                            <li key={trait} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                                {trait}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

