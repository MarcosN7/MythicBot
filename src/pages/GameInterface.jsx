import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { generateDMResponse, generateOpeningNarrative } from '../services/aiService';
import soundService from '../services/soundService';
import ChatInterface from '../components/game/ChatInterface';
import CharacterSheet from '../components/game/CharacterSheet';
import Inventory from '../components/game/Inventory';
import DiceRoller from '../components/game/DiceRoller';
import SettingsModal from '../components/game/SettingsModal';

export default function GameInterface() {
    const navigate = useNavigate();
    const {
        state,
        addChatMessage,
        updateHp,
        addInventoryItem,
        removeInventoryItem,
        updateSettings,
        resetGame
    } = useGame();

    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [sidebarTab, setSidebarTab] = useState('character');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Initialize sound service and sync settings
    useEffect(() => {
        soundService.init();
    }, []);

    // Sync sound settings
    useEffect(() => {
        soundService.setEnabled(state.settings.soundEnabled);
    }, [state.settings.soundEnabled]);

    // Redirect if game not started
    useEffect(() => {
        if (!state.gameStarted || !state.adventure) {
            navigate('/');
        }
    }, [state.gameStarted, state.adventure, navigate]);

    // Generate opening narrative
    useEffect(() => {
        const initGame = async () => {
            if (state.gameStarted && state.chatHistory.length === 0 && state.adventure) {
                setIsLoading(true);
                const opening = await generateOpeningNarrative(state.adventure, state.character, state.settings.aiModel);
                addChatMessage({
                    type: 'ai',
                    text: opening,
                    timestamp: new Date().toISOString()
                });
                soundService.play('message');
                setIsLoading(false);
            }
        };
        initGame();
    }, [state.gameStarted, state.adventure]);

    const handleSendMessage = async (text) => {
        // Play click sound for user action
        soundService.play('click');

        // Add user message
        addChatMessage({
            type: 'user',
            text,
            timestamp: new Date().toISOString()
        });

        // Check if it's a dice roll
        if (text.includes('🎲') || text.toLowerCase().includes('roll')) {
            soundService.play('diceRoll');
        }

        // Generate AI response
        setIsLoading(true);
        try {
            const response = await generateDMResponse({
                character: state.character,
                companions: state.companions,
                previousTurns: state.chatHistory,
                action: text
            }, state.settings.aiModel);

            // Play appropriate sound based on roll result
            if (response.metadata?.roll) {
                if (response.metadata.roll === 20) {
                    soundService.play('critical');
                } else if (response.metadata.roll === 1) {
                    soundService.play('fumble');
                }
            }

            // Play message sound
            soundService.play('message');

            // Add DM message with companion responses attached
            addChatMessage({
                type: 'ai',
                text: response.message,
                roll: response.metadata?.roll,
                timestamp: response.metadata?.timestamp,
                companionMessages: response.companionResponses || []
            });
        } catch (error) {
            addChatMessage({
                type: 'ai',
                text: 'The Dungeon Master pauses... (An error occurred. Please try again.)',
                timestamp: new Date().toISOString()
            });
        }
        setIsLoading(false);
    };

    const handleResetGame = () => {
        resetGame();
        navigate('/');
    };

    if (!state.gameStarted) {
        return null;
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 shrink-0">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="font-display font-bold text-gray-900 dark:text-white">
                                {state.adventure?.name || 'Adventure'}
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{state.adventure?.setting}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mobile sidebar toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    <ChatInterface
                        messages={state.chatHistory}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        animationsEnabled={state.settings.animationsEnabled}
                    />
                </div>

                {/* Sidebar */}
                <aside className={`
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0
          fixed lg:relative right-0 top-0 h-full
          w-80 bg-white dark:bg-slate-800 border-l border-gray-100 dark:border-slate-700
          transition-transform duration-300 z-40
          flex flex-col
        `}>
                    {/* Mobile close button */}
                    <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
                        <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                            <svg className="w-5 h-5 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 dark:border-slate-700">
                        {[
                            { id: 'character', icon: '👤', label: 'Character' },
                            { id: 'inventory', icon: '🎒', label: 'Inventory' },
                            { id: 'dice', icon: '🎲', label: 'Dice' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSidebarTab(tab.id)}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${sidebarTab === tab.id
                                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <span className="mr-1">{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {sidebarTab === 'character' && (
                            <CharacterSheet
                                character={state.character}
                                onHpChange={(amount) => updateHp(amount)}
                            />
                        )}
                        {sidebarTab === 'inventory' && (
                            <Inventory
                                items={state.inventory}
                                onAddItem={addInventoryItem}
                                onRemoveItem={removeInventoryItem}
                            />
                        )}
                        {sidebarTab === 'dice' && (
                            <DiceRoller />
                        )}
                    </div>

                    {/* Companions */}
                    {state.companions.length > 0 && (
                        <div className="p-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Party</h4>
                            <div className="flex gap-2">
                                {state.companions.map((companion, index) => (
                                    <div
                                        key={index}
                                        className="flex-1 text-center p-2 bg-gray-50 rounded-lg"
                                        title={`${companion.name} - ${companion.race} ${companion.class}`}
                                    >
                                        <span className="text-xl">
                                            {companion.race === 'elf' ? '🧝' :
                                                companion.race === 'dwarf' ? '⛏️' :
                                                    companion.race === 'halfling' ? '🍀' :
                                                        companion.race === 'tiefling' ? '😈' :
                                                            companion.race === 'dragonborn' ? '🐉' :
                                                                '👤'}
                                        </span>
                                        <p className="text-xs font-medium text-gray-700 truncate">{companion.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Mobile overlay */}
                {isSidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/20 z-30"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </div>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                settings={state.settings}
                onSettingsChange={updateSettings}
                onResetGame={handleResetGame}
            />
        </div>
    );
}
