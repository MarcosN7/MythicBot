// LocalStorage utilities for game state persistence

const STORAGE_KEY = 'mythicbot_game_state';

export const saveGameState = (state) => {
    try {
        const serialized = JSON.stringify(state);
        localStorage.setItem(STORAGE_KEY, serialized);
        return true;
    } catch (error) {
        console.error('Failed to save game state:', error);
        return false;
    }
};

export const loadGameState = () => {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (!serialized) return null;
        return JSON.parse(serialized);
    } catch (error) {
        console.error('Failed to load game state:', error);
        return null;
    }
};

export const clearGameState = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear game state:', error);
        return false;
    }
};

export const hasGameState = () => {
    return localStorage.getItem(STORAGE_KEY) !== null;
};
