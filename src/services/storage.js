// LocalStorage utilities for game state persistence

const STORAGE_KEY = 'mythicbot_game_state';
const STATE_SCHEMA_VERSION = 2;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isVersionedPayload = (value) => (
    isObject(value)
    && Number.isInteger(value.schemaVersion)
    && isObject(value.state)
);

const normalizeLoadedState = (parsed) => {
    // Backward compatibility with legacy payloads (raw state object only)
    if (isObject(parsed) && !isVersionedPayload(parsed)) {
        return {
            schemaVersion: 1,
            state: parsed
        };
    }

    if (isVersionedPayload(parsed)) {
        return parsed;
    }

    return null;
};

const migrateState = (payload) => {
    if (!payload) return null;

    const { schemaVersion, state } = payload;

    if (!isObject(state)) return null;

    // v1 -> v2 migration: ensure settings object exists and has safe defaults
    if (schemaVersion < 2) {
        return {
            schemaVersion: STATE_SCHEMA_VERSION,
            state: {
                ...state,
                settings: {
                    aiModel: 'mock',
                    darkMode: true,
                    soundEnabled: true,
                    animationsEnabled: true,
                    ...(isObject(state.settings) ? state.settings : {})
                }
            }
        };
    }

    // Current or future compatible schema
    return {
        schemaVersion,
        state
    };
};

export const saveGameState = (state) => {
    try {
        const payload = {
            schemaVersion: STATE_SCHEMA_VERSION,
            savedAt: new Date().toISOString(),
            state
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
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

        const parsed = JSON.parse(serialized);
        const normalized = normalizeLoadedState(parsed);
        const migrated = migrateState(normalized);

        if (!migrated) {
            console.warn('Discarding invalid saved state payload.');
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        if (migrated.schemaVersion !== normalized.schemaVersion) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                schemaVersion: migrated.schemaVersion,
                savedAt: new Date().toISOString(),
                state: migrated.state
            }));
        }

        return migrated.state;
    } catch (error) {
        console.error('Failed to load game state:', error);
        localStorage.removeItem(STORAGE_KEY);
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
