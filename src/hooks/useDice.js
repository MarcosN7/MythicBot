import { useCallback } from 'react';

/**
 * Custom hook for dice rolling logic
 * @returns {Object} Object containing roll functions
 */
export function useDice() {
    /**
     * Roll a die with a specific number of sides
     * @param {number} sides - Number of sides (default 20)
     * @returns {Object} Result object with { value, text, isCritical, isFumble }
     */
    const rollDie = useCallback((sides = 20) => {
        const value = Math.floor(Math.random() * sides) + 1;
        const isCritical = value === sides;
        const isFumble = value === 1;

        return {
            value,
            sides,
            isCritical,
            isFumble,
            timestamp: new Date().toISOString()
        };
    }, []);

    /**
     * Format a roll result into a text message
     * @param {Object} rollResult - Result from rollDie
     * @returns {string} Formatted text description
     */
    const formatRollMessage = useCallback((rollResult) => {
        const { value, sides, isCritical, isFumble } = rollResult;
        let suffix = '';
        if (isCritical) suffix = ' Critical!';
        if (isFumble) suffix = ' Fumble!';

        return `🎲 I roll a d${sides}... [${value}]${suffix}`;
    }, []);

    return {
        rollDie,
        formatRollMessage
    };
}
