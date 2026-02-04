import { useState } from 'react';
import Button from '../common/Button';

export default function Inventory({ items, onAddItem, onRemoveItem }) {
    const [newItem, setNewItem] = useState('');
    const [showAdd, setShowAdd] = useState(false);

    const handleAdd = () => {
        if (newItem.trim()) {
            onAddItem({ name: newItem.trim(), quantity: 1 });
            setNewItem('');
            setShowAdd(false);
        }
    };

    const getItemIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('sword') || lower.includes('weapon')) return '⚔️';
        if (lower.includes('shield')) return '🛡️';
        if (lower.includes('potion')) return '🧪';
        if (lower.includes('gold') || lower.includes('coin')) return '💰';
        if (lower.includes('key')) return '🔑';
        if (lower.includes('torch')) return '🔥';
        if (lower.includes('food') || lower.includes('ration')) return '🍖';
        if (lower.includes('scroll')) return '📜';
        if (lower.includes('book')) return '📕';
        if (lower.includes('ring')) return '💍';
        if (lower.includes('armor')) return '🦺';
        if (lower.includes('bow') || lower.includes('arrow')) return '🏹';
        if (lower.includes('staff') || lower.includes('wand')) return '🪄';
        return '📦';
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Inventory</h4>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 hover:bg-primary-200 dark:hover:bg-primary-900/60 text-primary-600 dark:text-primary-400 flex items-center justify-center transition-colors"
                >
                    {showAdd ? '×' : '+'}
                </button>
            </div>

            {/* Add Item Form */}
            {showAdd && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg animate-fade-in">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Item name..."
                        className="input text-sm mb-2"
                        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <Button size="sm" variant="primary" onClick={handleAdd} className="w-full">
                        Add Item
                    </Button>
                </div>
            )}

            {/* Items List */}
            <div className="space-y-2">
                {items.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No items yet</p>
                ) : (
                    items.map(item => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg group hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{getItemIcon(item.name)}</span>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                                    {item.quantity > 1 && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">×{item.quantity}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => onRemoveItem(item.id)}
                                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-all"
                                title="Remove item"
                            >
                                <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Weight/Capacity */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Items:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{items.length}</span>
                </div>
            </div>
        </div>
    );
}

