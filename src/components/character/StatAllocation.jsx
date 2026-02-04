import { useState } from 'react';
import Button from '../common/Button';

const ABILITIES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const POINT_BUY_DEFAULT = { strength: 8, dexterity: 8, constitution: 8, intelligence: 8, wisdom: 8, charisma: 8 };
const POINT_BUY_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const POINT_BUY_MAX = 27;

function rollDice(count, sides) {
    const rolls = [];
    for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    return rolls;
}

function roll4d6DropLowest() {
    const rolls = rollDice(4, 6);
    rolls.sort((a, b) => b - a);
    return rolls.slice(0, 3).reduce((a, b) => a + b, 0);
}

export default function StatAllocation({ stats, onStatsChange, raceBonuses = {} }) {
    const [method, setMethod] = useState('standard');
    const [standardAssignments, setStandardAssignments] = useState({});
    const [rolledStats, setRolledStats] = useState(null);
    const [pointBuyStats, setPointBuyStats] = useState(POINT_BUY_DEFAULT);

    const methods = [
        { id: 'standard', name: 'Standard Array', desc: 'Use preset values: 15, 14, 13, 12, 10, 8' },
        { id: 'pointbuy', name: 'Point Buy', desc: 'Customize stats with 27 points' },
        { id: 'roll', name: 'Roll 4d6', desc: 'Roll 4d6 and drop the lowest for each stat' }
    ];

    const handleMethodChange = (newMethod) => {
        setMethod(newMethod);
        if (newMethod === 'standard') {
            applyStandardArray(standardAssignments);
        } else if (newMethod === 'pointbuy') {
            applyPointBuy(pointBuyStats);
        } else if (newMethod === 'roll' && rolledStats) {
            onStatsChange(rolledStats);
        }
    };

    const applyStandardArray = (assignments) => {
        const newStats = { ...POINT_BUY_DEFAULT };
        Object.entries(assignments).forEach(([ability, value]) => {
            if (value) newStats[ability] = value;
        });
        onStatsChange(newStats);
    };

    const handleStandardAssign = (ability, value) => {
        const newAssignments = { ...standardAssignments };
        // Remove this value from any other ability
        Object.keys(newAssignments).forEach(key => {
            if (newAssignments[key] === value) delete newAssignments[key];
        });
        newAssignments[ability] = value;
        setStandardAssignments(newAssignments);
        applyStandardArray(newAssignments);
    };

    const applyPointBuy = (pbStats) => {
        onStatsChange(pbStats);
    };

    const getPointsSpent = () => {
        return Object.values(pointBuyStats).reduce((total, val) => total + (POINT_BUY_COSTS[val] || 0), 0);
    };

    const handlePointBuyChange = (ability, delta) => {
        const current = pointBuyStats[ability];
        const newValue = current + delta;
        if (newValue < 8 || newValue > 15) return;

        const newStats = { ...pointBuyStats, [ability]: newValue };
        const newTotal = Object.values(newStats).reduce((t, v) => t + (POINT_BUY_COSTS[v] || 0), 0);
        if (newTotal > POINT_BUY_MAX) return;

        setPointBuyStats(newStats);
        applyPointBuy(newStats);
    };

    const handleRollStats = () => {
        const rolled = {};
        ABILITIES.forEach(ability => {
            rolled[ability] = roll4d6DropLowest();
        });
        setRolledStats(rolled);
        onStatsChange(rolled);
    };

    const getModifier = (score) => {
        const mod = Math.floor((score - 10) / 2);
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    const getFinalStat = (ability) => {
        const base = stats[ability] || 8;
        const bonus = raceBonuses[ability] || 0;
        return base + bonus;
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Allocate Ability Scores</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Choose how you want to determine your stats.</p>

            {/* Method Selection */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                {methods.map(m => (
                    <button
                        key={m.id}
                        onClick={() => handleMethodChange(m.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${method === m.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                            : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                            }`}
                    >
                        <h4 className="font-semibold text-gray-900 dark:text-white">{m.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{m.desc}</p>
                    </button>
                ))}
            </div>

            {/* Standard Array */}
            {method === 'standard' && (
                <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Assign each value to an ability:</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {STANDARD_ARRAY.map(value => {
                            const used = Object.values(standardAssignments).includes(value);
                            return (
                                <span
                                    key={value}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${used ? 'bg-gray-200 dark:bg-slate-600 text-gray-400 dark:text-gray-500' : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                                        }`}
                                >
                                    {value}
                                </span>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {ABILITIES.map(ability => (
                            <div key={ability} className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-lg">
                                <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{ability}</span>
                                <select
                                    value={standardAssignments[ability] || ''}
                                    onChange={(e) => handleStandardAssign(ability, parseInt(e.target.value))}
                                    className="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-600 dark:text-white text-sm"
                                >
                                    <option value="">--</option>
                                    {STANDARD_ARRAY.filter(v =>
                                        !Object.values(standardAssignments).includes(v) || standardAssignments[ability] === v
                                    ).map(v => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Point Buy */}
            {method === 'pointbuy' && (
                <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Points remaining:</p>
                        <span className={`px-4 py-1 rounded-full font-bold ${getPointsSpent() <= POINT_BUY_MAX ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                            }`}>
                            {POINT_BUY_MAX - getPointsSpent()} / {POINT_BUY_MAX}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {ABILITIES.map(ability => (
                            <div key={ability} className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-lg">
                                <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{ability}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePointBuyChange(ability, -1)}
                                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 font-bold dark:text-white"
                                        disabled={pointBuyStats[ability] <= 8}
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-semibold dark:text-white">{pointBuyStats[ability]}</span>
                                    <button
                                        onClick={() => handlePointBuyChange(ability, 1)}
                                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 font-bold dark:text-white"
                                        disabled={pointBuyStats[ability] >= 15}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Roll 4d6 */}
            {method === 'roll' && (
                <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl text-center">
                    <Button variant="accent" onClick={handleRollStats} className="mb-6">
                        🎲 Roll Stats
                    </Button>
                    {rolledStats && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {ABILITIES.map(ability => (
                                <div key={ability} className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                                    <span className="capitalize text-sm text-gray-500 dark:text-gray-400">{ability}</span>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{rolledStats[ability]}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Final Stats Preview */}
            <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Final Ability Scores (with race bonuses)</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {ABILITIES.map(ability => {
                        const final = getFinalStat(ability);
                        const bonus = raceBonuses[ability] || 0;
                        return (
                            <div key={ability} className="text-center">
                                <span className="text-xs uppercase text-gray-500 dark:text-gray-400">{ability.slice(0, 3)}</span>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{final}</p>
                                <span className="text-sm text-primary-600 dark:text-primary-400">{getModifier(final)}</span>
                                {bonus > 0 && (
                                    <span className="text-xs text-green-600 dark:text-green-400 block">+{bonus} race</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

