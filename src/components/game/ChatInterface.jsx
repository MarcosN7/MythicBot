import { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import { RollResult, RollPrompt, ClickableDice } from './AnimatedDice';

// Get race emoji for companion avatar
const getRaceEmoji = (race) => {
    const raceEmojis = {
        'human': '👤',
        'elf': '🧝',
        'dwarf': '⛏️',
        'halfling': '🍀',
        'tiefling': '😈',
        'dragonborn': '🐉',
        'gnome': '🔧',
        'half-orc': '💪'
    };
    return raceEmojis[race] || '👤';
};

// Get personality color for companion bubble
const getPersonalityColor = (personality) => {
    const colors = {
        'Cheerful': 'from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/30 dark:to-orange-900/30 dark:border-yellow-700',
        'Stoic': 'from-slate-50 to-gray-100 border-slate-200 dark:from-slate-800 dark:to-gray-800 dark:border-slate-600',
        'Sarcastic': 'from-purple-50 to-pink-50 border-purple-200 dark:from-purple-900/30 dark:to-pink-900/30 dark:border-purple-700',
        'Wise': 'from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/30 dark:to-indigo-900/30 dark:border-blue-700',
        'Impulsive': 'from-red-50 to-orange-50 border-red-200 dark:from-red-900/30 dark:to-orange-900/30 dark:border-red-700',
        'Cautious': 'from-green-50 to-teal-50 border-green-200 dark:from-green-900/30 dark:to-teal-900/30 dark:border-green-700',
        'Grumpy': 'from-gray-100 to-slate-100 border-gray-300 dark:from-gray-800 dark:to-slate-800 dark:border-gray-600',
        'Mischievous': 'from-pink-50 to-purple-50 border-pink-200 dark:from-pink-900/30 dark:to-purple-900/30 dark:border-pink-700'
    };
    return colors[personality] || 'from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600';
};

export default function ChatInterface({ messages, onSendMessage, isLoading, animationsEnabled = true }) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: animationsEnabled ? 'smooth' : 'auto' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const quickActions = [
        'Look around',
        'Check inventory',
        'Talk to companion',
        'Search for clues'
    ];

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-slate-900 ${animationsEnabled ? 'transition-colors' : ''}`}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                        <div className="text-5xl mb-4">📖</div>
                        <p>Your adventure begins here...</p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div key={index}>
                        {/* User message */}
                        {message.type === 'user' && (
                            <div className="flex justify-end">
                                <div className="chat-bubble user">
                                    <p className="whitespace-pre-line">{message.text}</p>
                                    <span className="text-xs opacity-50 block mt-1">
                                        {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* AI/DM message */}
                        {message.type === 'ai' && (
                            <div className="flex justify-start">
                                <div className="chat-bubble ai dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-700 dark:border-slate-600 dark:text-gray-100">
                                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs">
                                            DM
                                        </span>
                                        Dungeon Master
                                    </div>
                                    <p className="whitespace-pre-line">{message.text}</p>
                                    {message.roll && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                                            <RollResult
                                                value={message.roll}
                                                sides={20}
                                                label="Dungeon Master Roll"
                                                animate={message.animateRoll !== false}
                                            />
                                        </div>
                                    )}
                                    <span className="text-xs opacity-50 block mt-1">
                                        {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Companion messages - shown after DM message if present */}
                        {message.type === 'ai' && message.companionMessages && message.companionMessages.length > 0 && (
                            <div className="mt-3 space-y-2 pl-4">
                                {message.companionMessages.map((companion, cIndex) => (
                                    <div
                                        key={cIndex}
                                        className="flex justify-start animate-fade-in"
                                        style={{ animationDelay: `${(cIndex + 1) * 200}ms` }}
                                    >
                                        <div className={`px-4 py-3 rounded-2xl max-w-[75%] bg-gradient-to-br ${getPersonalityColor(companion.personality)} border shadow-sm`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">{getRaceEmoji(companion.companionRace)}</span>
                                                <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{companion.companionName}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">• {companion.companionClass}</span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-200 text-sm italic">"{companion.text}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Companion standalone message type */}
                        {message.type === 'companion' && (
                            <div className="flex justify-start animate-fade-in">
                                <div className={`px-4 py-3 rounded-2xl max-w-[75%] bg-gradient-to-br ${getPersonalityColor(message.personality)} border shadow-sm`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{getRaceEmoji(message.companionRace)}</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{message.companionName}</span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">• {message.companionClass}</span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-200 text-sm italic">"{message.text}"</p>
                                    <span className="text-xs opacity-50 block mt-1">
                                        {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="chat-bubble ai dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-700 dark:border-slate-600">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs animate-pulse">
                                    DM
                                </span>
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {quickActions.map((action) => (
                        <button
                            key={action}
                            onClick={() => setInput(action)}
                            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full text-gray-600 dark:text-gray-300 whitespace-nowrap transition-colors"
                        >
                            {action}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors">
                <div className="flex gap-2 items-center">
                    {/* Quick Dice Roll Button */}
                    <button
                        type="button"
                        onClick={() => {
                            const roll = Math.floor(Math.random() * 20) + 1;
                            const rollText = `🎲 I roll a d20... [${roll}]${roll === 20 ? ' Critical!' : roll === 1 ? ' Fumble!' : ''}`;
                            onSendMessage(rollText);
                        }}
                        disabled={isLoading}
                        className="p-3 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/50 dark:to-accent-900/50 hover:from-primary-200 hover:to-accent-200 dark:hover:from-primary-800/50 dark:hover:to-accent-800/50 rounded-xl text-xl transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
                        title="Roll d20"
                    >
                        🎲
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="What do you do?"
                        className="input flex-1"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!input.trim() || isLoading}
                        loading={isLoading}
                    >
                        Send
                    </Button>
                </div>
            </form>
        </div>
    );
}

