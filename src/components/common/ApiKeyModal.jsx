import { useState, useEffect } from 'react';
import Button from './Button';
import { validateApiKey, setApiKey, getApiKey, clearApiKey, hasApiKey } from '../../services/apiKeyService';

export default function ApiKeyModal({ isOpen, onClose, onKeySet }) {
    const [apiKey, setApiKeyValue] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [existingKey, setExistingKey] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setExistingKey(hasApiKey());
            setApiKeyValue('');
            setError('');
            setSuccess(false);
        }
    }, [isOpen]);

    const handleValidateAndSave = async () => {
        setError('');
        setIsValidating(true);

        const result = await validateApiKey(apiKey);

        if (result.valid) {
            const saved = setApiKey(apiKey);
            if (saved) {
                setSuccess(true);
                setTimeout(() => {
                    onKeySet?.();
                    onClose();
                }, 1500);
            } else {
                setError('Failed to save API key. Please try again.');
            }
        } else {
            setError(result.error || 'Invalid API key');
        }

        setIsValidating(false);
    };

    const handleClearKey = () => {
        clearApiKey();
        setExistingKey(false);
        setApiKeyValue('');
        onKeySet?.();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-2xl">🔑</span>
                        Gemini API Key Setup
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="text-gray-500 dark:text-gray-400 text-xl">×</span>
                    </button>
                </div>

                {/* Instructions */}
                <div className="mb-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        To use Gemini AI for immersive storytelling, you need your own free API key:
                    </p>
                    <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
                        <li>Visit <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                            Google AI Studio
                        </a></li>
                        <li>Sign in with your Google account</li>
                        <li>Click "Create API key"</li>
                        <li>Copy and paste the key below</li>
                    </ol>
                </div>

                {/* Existing Key Status */}
                {existingKey && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span className="text-sm text-green-700 dark:text-green-300">API key is set</span>
                        </div>
                        <button
                            onClick={handleClearKey}
                            className="text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                            Clear key
                        </button>
                    </div>
                )}

                {/* API Key Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {existingKey ? 'Enter new API key (optional):' : 'Enter your API key:'}
                    </label>
                    <div className="relative">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => {
                                setApiKeyValue(e.target.value);
                                setError('');
                                setSuccess(false);
                            }}
                            placeholder="AIza..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                            disabled={isValidating || success}
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            {showKey ? '🙈' : '👁️'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <span>⚠️</span>
                            {error}
                        </p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                            <span>✅</span>
                            API key validated and saved successfully!
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isValidating}
                    >
                        {existingKey ? 'Keep Current' : 'Cancel'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleValidateAndSave}
                        className="flex-1"
                        disabled={!apiKey.trim() || isValidating || success}
                    >
                        {isValidating ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⏳</span>
                                Validating...
                            </span>
                        ) : success ? (
                            <span className="flex items-center gap-2">
                                <span>✅</span>
                                Saved!
                            </span>
                        ) : (
                            'Validate & Save'
                        )}
                    </Button>
                </div>

                {/* Security Note */}
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                    🔒 Your key is stored locally in your browser only. It never leaves your device.
                </p>
            </div>
        </div>
    );
}
