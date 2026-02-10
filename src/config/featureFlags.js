const viteEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

const envFlag = (value, fallback = false) => {
    if (value === undefined) return fallback;
    return String(value).toLowerCase() === 'true';
};

export const featureFlags = {
    structuredAiOutput: envFlag(viteEnv.VITE_FF_STRUCTURED_AI_OUTPUT, true),
    aiRateLimiting: envFlag(viteEnv.VITE_FF_AI_RATE_LIMITING, true),
    telemetry: envFlag(viteEnv.VITE_FF_TELEMETRY, true)
};

export const isFeatureEnabled = (flagName) => Boolean(featureFlags[flagName]);
