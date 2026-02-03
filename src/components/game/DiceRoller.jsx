import { useState } from 'react';
import { AnimatedDice } from './AnimatedDice';

const DICE_TYPES = [
    { sides: 4, color: '#ef4444', label: 'd4' },
    { sides: 6, color: '#f97316', label: 'd6' },
    { sides: 8, color: '#eab308', label: 'd8' },
    { sides: 10, color: '#22c55e', label: 'd10' },
    { sides: 12, color: '#3b82f6', label: 'd12' },
    { sides: 20, color: '#8b5cf6', label: 'd20' }
];

export default function DiceRoller() {
    const [results, setResults] = useState([]);
    const [rolling, setRolling] = useState(null);
    const [currentRoll, setCurrentRoll] = useState(null);
    const [finalValue, setFinalValue] = useState(null);

    const rollDice = (sides) => {
        if (rolling) return;

        const result = Math.floor(Math.random() * sides) + 1;
        setCurrentRoll({ sides, result });
        setFinalValue(result);
        setRolling(sides);
    };

    const handleRollComplete = () => {
        if (currentRoll) {
            const newResult = {
                sides: currentRoll.sides,
                result: currentRoll.result,
                timestamp: Date.now(),
                isCritical: currentRoll.sides === 20 && currentRoll.result === 20,
                isFumble: currentRoll.sides === 20 && currentRoll.result === 1
            };
            setResults(prev => [newResult, ...prev].slice(0, 10));
        }
        setRolling(null);
    };

    const clearResults = () => setResults([]);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Dice Roller</h4>
                {results.length > 0 && (
                    <button
                        onClick={clearResults}
                        className="text-xs text-gray-500 hover:text-gray-700"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Current Roll Display */}
            {rolling && currentRoll && (
                <div className="flex justify-center mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <AnimatedDice
                        sides={currentRoll.sides}
                        finalValue={finalValue}
                        isRolling={true}
                        onRollComplete={handleRollComplete}
                        size={64}
                    />
                </div>
            )}

            {/* Last Result */}
            {!rolling && results.length > 0 && (
                <div className={`flex justify-center items-center gap-3 mb-4 p-4 rounded-xl ${results[0].isCritical ? 'bg-green-100' :
                        results[0].isFumble ? 'bg-red-100' :
                            'bg-gray-50'
                    }`}>
                    <AnimatedDice
                        sides={results[0].sides}
                        finalValue={results[0].result}
                        isRolling={false}
                        size={48}
                    />
                    <div>
                        <span className="text-xs text-gray-500">Last Roll</span>
                        <p className={`text-2xl font-bold ${results[0].isCritical ? 'text-green-600' :
                                results[0].isFumble ? 'text-red-600' :
                                    'text-gray-800'
                            }`}>
                            {results[0].result}
                            {results[0].isCritical && ' 🎉'}
                            {results[0].isFumble && ' 💀'}
                        </p>
                    </div>
                </div>
            )}

            {/* Dice Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {DICE_TYPES.map(die => (
                    <button
                        key={die.sides}
                        onClick={() => rollDice(die.sides)}
                        disabled={rolling !== null}
                        className={`
                            relative p-3 rounded-xl font-bold text-white
                            transition-all duration-200 active:scale-95
                            ${rolling !== null ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:scale-105'}
                        `}
                        style={{
                            background: `linear-gradient(135deg, ${die.color}, ${die.color}dd)`,
                            boxShadow: `0 4px 12px ${die.color}40`
                        }}
                    >
                        {die.label}
                    </button>
                ))}
            </div>

            {/* Results History */}
            {results.length > 1 && (
                <div className="space-y-2">
                    <span className="text-xs text-gray-500">History:</span>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                        {results.slice(1).map((roll) => (
                            <div
                                key={roll.timestamp}
                                className={`flex items-center justify-between p-2 rounded-lg text-sm bg-gray-50
                                    ${roll.isCritical ? 'ring-1 ring-green-400' : ''} 
                                    ${roll.isFumble ? 'ring-1 ring-red-400' : ''}`}
                            >
                                <span className="text-gray-500">d{roll.sides}</span>
                                <span className={`font-bold ${roll.isCritical ? 'text-green-600' :
                                        roll.isFumble ? 'text-red-600' :
                                            'text-gray-700'
                                    }`}>
                                    {roll.result}
                                    {roll.isCritical && ' 🎉'}
                                    {roll.isFumble && ' 💀'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Roll */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Quick Roll:</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => rollDice(20)}
                        disabled={rolling !== null}
                        className="flex-1 py-2 px-3 bg-accent-100 hover:bg-accent-200 text-accent-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        🎯 Attack
                    </button>
                    <button
                        onClick={() => rollDice(20)}
                        disabled={rolling !== null}
                        className="flex-1 py-2 px-3 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        🛡️ Save
                    </button>
                </div>
            </div>
        </div>
    );
}

