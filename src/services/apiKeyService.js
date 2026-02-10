// API Key Management Service
// Stores user-provided Gemini API key in localStorage

const STORAGE_KEY = 'mythicbot_gemini_api_key';

const hasLocalStorage = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';


/**
 * Get the stored API key from localStorage
 * @returns {string|null} The stored API key or null
 */
export const getApiKey = () => {
    try {
        if (!hasLocalStorage()) return null;
        return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error reading API key from localStorage:', error);
        return null;
    }
};

/**
 * Store an API key in localStorage
 * @param {string} key - The API key to store
 */
export const setApiKey = (key) => {
    try {
        if (!hasLocalStorage()) return false;
        localStorage.setItem(STORAGE_KEY, key);
        return true;
    } catch (error) {
        console.error('Error saving API key to localStorage:', error);
        return false;
    }
};

/**
 * Remove the stored API key from localStorage
 */
export const clearApiKey = () => {
    try {
        if (!hasLocalStorage()) return false;
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing API key from localStorage:', error);
        return false;
    }
};

/**
 * Check if an API key is stored
 * @returns {boolean}
 */
export const hasApiKey = () => {
    const key = getApiKey();
    return key !== null && key.length > 0;
};

/**
 * Validate an API key by making a test request to Gemini
 * @param {string} key - The API key to validate
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export const validateApiKey = async (key) => {
    if (!key || key.trim().length === 0) {
        return { valid: false, error: 'API key cannot be empty' };
    }

    // Basic format validation (Gemini keys start with 'AIza')
    if (!key.startsWith('AIza')) {
        return { valid: false, error: 'Invalid API key format. Gemini API keys start with "AIza"' };
    }

    try {
        // Import the Gemini library dynamically
        const { GoogleGenerativeAI } = await import('@google/generative-ai');

        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Make a minimal test request
        const result = await model.generateContent('Say "ok" and nothing else.');
        const response = await result.response;
        const text = response.text();

        if (text) {
            return { valid: true };
        } else {
            return { valid: false, error: 'API key validation failed - no response received' };
        }
    } catch (error) {
        console.error('API key validation error:', error);

        // Parse common error messages
        if (error.message?.includes('API_KEY_INVALID')) {
            return { valid: false, error: 'Invalid API key. Please check and try again.' };
        }
        if (error.message?.includes('QUOTA_EXCEEDED')) {
            return { valid: false, error: 'API quota exceeded. The key is valid but has reached its limit.' };
        }
        if (error.message?.includes('PERMISSION_DENIED')) {
            return { valid: false, error: 'Permission denied. Make sure the Generative Language API is enabled.' };
        }

        return { valid: false, error: `Validation failed: ${error.message || 'Unknown error'}` };
    }
};
