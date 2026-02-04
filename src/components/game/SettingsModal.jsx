import Modal from '../common/Modal';
import Button from '../common/Button';
import { AI_MODELS } from '../../services/aiService';

export default function SettingsModal({ isOpen, onClose, settings, onSettingsChange, onResetGame }) {
    const handleModelChange = (modelId) => {
        onSettingsChange({ ...settings, aiModel: modelId });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
            <div className="space-y-6">
                {/* AI Model Selection */}
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">AI Model</h4>
                    <div className="space-y-2">
                        {Object.values(AI_MODELS).map(model => (
                            <button
                                key={model.id}
                                onClick={() => model.available && handleModelChange(model.id)}
                                disabled={!model.available}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${settings.aiModel === model.id
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                    : model.available
                                        ? 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                                        : 'border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-white">{model.name}</span>
                                    {!model.available && (
                                        <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-full">
                                            Coming Soon
                                        </span>
                                    )}
                                    {settings.aiModel === model.id && model.available && (
                                        <span className="text-xs px-2 py-1 bg-primary-500 text-white rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        API integration for Gemini and OpenAI coming soon!
                    </p>
                </div>

                {/* Other Settings */}
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Preferences</h4>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🌙</span>
                                <span className="text-gray-700 dark:text-gray-200">Dark Mode</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.darkMode}
                                onChange={(e) => {
                                    onSettingsChange({ ...settings, darkMode: e.target.checked });
                                    // Toggle dark class on document
                                    if (e.target.checked) {
                                        document.documentElement.classList.add('dark');
                                    } else {
                                        document.documentElement.classList.remove('dark');
                                    }
                                }}
                                className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                            />
                        </label>
                        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🔊</span>
                                <span className="text-gray-700 dark:text-gray-200">Sound Effects</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.soundEnabled}
                                onChange={(e) => onSettingsChange({ ...settings, soundEnabled: e.target.checked })}
                                className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                            />
                        </label>
                        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">✨</span>
                                <span className="text-gray-700 dark:text-gray-200">Animations</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.animationsEnabled}
                                onChange={(e) => onSettingsChange({ ...settings, animationsEnabled: e.target.checked })}
                                className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                            />
                        </label>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3">Danger Zone</h4>
                    <Button
                        variant="secondary"
                        className="w-full border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                        onClick={() => {
                            if (confirm('Are you sure you want to reset? All progress will be lost.')) {
                                onResetGame();
                                onClose();
                            }
                        }}
                    >
                        Reset Game & Clear Data
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
