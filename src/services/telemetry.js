import { isFeatureEnabled } from '../config/featureFlags.js';

const EVENT_LIMIT = 200;
const STORAGE_KEY = 'mythicbot_telemetry_events';

const persistEvent = (event) => {
    try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const next = [...existing.slice(-EVENT_LIMIT + 1), event];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // ignore storage issues
    }
};

export const logEvent = (name, metadata = {}) => {
    if (!isFeatureEnabled('telemetry')) return;

    const event = {
        name,
        metadata,
        timestamp: new Date().toISOString()
    };

    persistEvent(event);
    console.info(`[telemetry] ${name}`, metadata);
};

export const logError = (name, error, metadata = {}) => {
    const normalizedError = error instanceof Error ? error.message : String(error || 'unknown');
    logEvent(name, { ...metadata, error: normalizedError });
};

export const readTelemetryEvents = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
};
