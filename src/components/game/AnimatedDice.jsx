import { useState, useEffect } from 'react';

// SVG dice faces for d6 (simplified representation for any dice)
const DiceFace = ({ value, sides, size = 48, color = '#6366f1' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" className="drop-shadow-lg">
            <defs>
                <linearGradient id={`diceGrad-${sides}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor={`${color}dd`} />
                </linearGradient>
            </defs>
            <rect
                x="2" y="2"
                width="44" height="44"
                rx="8" ry="8"
                fill={`url(#diceGrad-${sides})`}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
            />
            <text
                x="24" y="32"
                textAnchor="middle"
                fill="white"
                fontSize="20"
                fontWeight="bold"
                fontFamily="system-ui"
            >
                {value}
            </text>
            <text
                x="24" y="12"
                textAnchor="middle"
                fill="rgba(255,255,255,0.6)"
                fontSize="8"
                fontFamily="system-ui"
            >
                d{sides}
            </text>
        </svg>
    );
};

// Animated rolling dice
export function AnimatedDice({
    sides = 20,
    finalValue,
    isRolling,
    onRollComplete,
    size = 48,
    color
}) {
    const [displayValue, setDisplayValue] = useState(finalValue || sides);
    const [rotation, setRotation] = useState(0);

    // Get color based on dice type
    const getDiceColor = () => {
        if (color) return color;
        const colors = {
            4: '#ef4444',   // red
            6: '#f97316',   // orange
            8: '#eab308',   // yellow
            10: '#22c55e',  // green
            12: '#3b82f6',  // blue
            20: '#8b5cf6',  // purple
        };
        return colors[sides] || '#6366f1';
    };

    useEffect(() => {
        if (isRolling) {
            let count = 0;
            const maxRolls = 15;
            const interval = setInterval(() => {
                setDisplayValue(Math.floor(Math.random() * sides) + 1);
                setRotation(prev => prev + 45);
                count++;

                if (count >= maxRolls) {
                    clearInterval(interval);
                    setDisplayValue(finalValue);
                    setRotation(0);
                    onRollComplete?.();
                }
            }, 80);

            return () => clearInterval(interval);
        } else if (finalValue) {
            setDisplayValue(finalValue);
        }
    }, [isRolling, finalValue, sides, onRollComplete]);

    return (
        <div
            className="inline-flex items-center justify-center transition-transform duration-100"
            style={{
                transform: isRolling ? `rotate(${rotation}deg) scale(${1 + Math.sin(rotation * 0.1) * 0.1})` : 'none'
            }}
        >
            <DiceFace value={displayValue} sides={sides} size={size} color={getDiceColor()} />
        </div>
    );
}

// Interactive clickable dice for chat
export function ClickableDice({ sides = 20, onRoll, disabled }) {
    const [isRolling, setIsRolling] = useState(false);
    const [result, setResult] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const handleClick = () => {
        if (isRolling || disabled) return;

        const rollResult = Math.floor(Math.random() * sides) + 1;
        setResult(rollResult);
        setIsRolling(true);
        setShowResult(false);
    };

    const handleRollComplete = () => {
        setIsRolling(false);
        setShowResult(true);
        onRoll?.(result);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isRolling || disabled}
            className={`
        relative inline-flex flex-col items-center gap-1 p-3 rounded-xl
        bg-gradient-to-br from-gray-100 to-gray-200
        hover:from-gray-200 hover:to-gray-300
        active:scale-95 transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isRolling ? 'animate-pulse' : ''}
      `}
            title={`Roll d${sides}`}
        >
            <AnimatedDice
                sides={sides}
                finalValue={result}
                isRolling={isRolling}
                onRollComplete={handleRollComplete}
                size={56}
            />
            {!isRolling && !showResult && (
                <span className="text-xs text-gray-500 font-medium">Click to roll</span>
            )}
            {showResult && result && (
                <span className={`text-sm font-bold ${result === sides ? 'text-green-600' :
                        result === 1 ? 'text-red-600' :
                            'text-gray-700'
                    }`}>
                    {result === sides && '🎉 '}
                    {result === 1 && '💀 '}
                    You rolled {result}!
                </span>
            )}
        </button>
    );
}

// Inline roll result display with animation
export function RollResult({ value, sides = 20, label, animate = true }) {
    const [isAnimating, setIsAnimating] = useState(animate);
    const [displayValue, setDisplayValue] = useState(animate ? '?' : value);

    useEffect(() => {
        if (animate) {
            setIsAnimating(true);
            let count = 0;
            const interval = setInterval(() => {
                setDisplayValue(Math.floor(Math.random() * sides) + 1);
                count++;
                if (count >= 10) {
                    clearInterval(interval);
                    setDisplayValue(value);
                    setIsAnimating(false);
                }
            }, 60);
            return () => clearInterval(interval);
        }
    }, [value, sides, animate]);

    const isCritical = value === 20 && sides === 20;
    const isFumble = value === 1 && sides === 20;

    return (
        <div className={`
      inline-flex items-center gap-2 px-3 py-2 rounded-lg
      ${isCritical ? 'bg-green-100 border-2 border-green-400' :
                isFumble ? 'bg-red-100 border-2 border-red-400' :
                    'bg-gray-100 border border-gray-200'}
      ${isAnimating ? 'animate-pulse' : ''}
    `}>
            <AnimatedDice
                sides={sides}
                finalValue={value}
                isRolling={isAnimating}
                size={32}
            />
            <div className="flex flex-col">
                {label && <span className="text-xs text-gray-500">{label}</span>}
                <span className={`font-bold ${isCritical ? 'text-green-700' :
                        isFumble ? 'text-red-700' :
                            value >= 15 ? 'text-green-600' :
                                value <= 5 ? 'text-red-600' :
                                    'text-gray-800'
                    }`}>
                    {displayValue}
                    {!isAnimating && isCritical && ' Critical!'}
                    {!isAnimating && isFumble && ' Fumble!'}
                </span>
            </div>
        </div>
    );
}

// Roll prompt that appears in chat
export function RollPrompt({ action, sides = 20, onRoll, onSkip }) {
    const [isRolling, setIsRolling] = useState(false);
    const [result, setResult] = useState(null);

    const handleRoll = () => {
        if (isRolling) return;
        const rollResult = Math.floor(Math.random() * sides) + 1;
        setResult(rollResult);
        setIsRolling(true);
    };

    const handleRollComplete = () => {
        setIsRolling(false);
        onRoll?.(result);
    };

    if (result && !isRolling) {
        return null; // Hide after roll completes
    }

    return (
        <div className="flex justify-center my-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-sm w-full">
                <div className="text-center mb-4">
                    <span className="text-3xl mb-2 block">🎲</span>
                    <h4 className="font-semibold text-gray-900">Roll Required</h4>
                    <p className="text-sm text-gray-500">{action || 'Make your roll!'}</p>
                </div>

                <div className="flex justify-center mb-4">
                    <AnimatedDice
                        sides={sides}
                        finalValue={result}
                        isRolling={isRolling}
                        onRollComplete={handleRollComplete}
                        size={72}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleRoll}
                        disabled={isRolling}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isRolling ? 'Rolling...' : `Roll d${sides}`}
                    </button>
                    {onSkip && (
                        <button
                            onClick={onSkip}
                            disabled={isRolling}
                            className="py-3 px-4 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Skip
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AnimatedDice;
