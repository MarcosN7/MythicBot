import { createContext, useContext, useReducer, useEffect } from 'react';
import { saveGameState, loadGameState } from '../services/storage';

// Initial state
const initialState = {
    // Character data
    character: {
        name: '',
        race: null,
        class: null,
        stats: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        },
        skills: [],
        personality: '',
        traits: '',
        background: '',
        hp: 10,
        maxHp: 10,
        level: 1,
        experience: 0
    },

    // Companions (3 AI party members)
    companions: [],

    // Current adventure
    adventure: null,

    // Chat history
    chatHistory: [],

    // Inventory items
    inventory: [
        { id: 1, name: 'Backpack', quantity: 1 },
        { id: 2, name: 'Torch', quantity: 3 },
        { id: 3, name: 'Rations', quantity: 5 },
        { id: 4, name: 'Gold Pieces', quantity: 15 }
    ],

    // Game progress
    gameStarted: false,
    currentStep: 0, // For character creation wizard

    // Settings
    settings: {
        aiModel: 'mock',
        soundEnabled: true,
        animationsEnabled: true
    }
};

// Action types
const ActionTypes = {
    SET_CHARACTER_FIELD: 'SET_CHARACTER_FIELD',
    SET_CHARACTER: 'SET_CHARACTER',
    SET_STATS: 'SET_STATS',
    SET_SKILLS: 'SET_SKILLS',
    SET_COMPANIONS: 'SET_COMPANIONS',
    SET_ADVENTURE: 'SET_ADVENTURE',
    ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
    CLEAR_CHAT: 'CLEAR_CHAT',
    ADD_INVENTORY_ITEM: 'ADD_INVENTORY_ITEM',
    REMOVE_INVENTORY_ITEM: 'REMOVE_INVENTORY_ITEM',
    UPDATE_HP: 'UPDATE_HP',
    SET_CURRENT_STEP: 'SET_CURRENT_STEP',
    START_GAME: 'START_GAME',
    UPDATE_SETTINGS: 'UPDATE_SETTINGS',
    LOAD_STATE: 'LOAD_STATE',
    RESET_STATE: 'RESET_STATE'
};

// Reducer
function gameReducer(state, action) {
    switch (action.type) {
        case ActionTypes.SET_CHARACTER_FIELD:
            return {
                ...state,
                character: {
                    ...state.character,
                    [action.field]: action.value
                }
            };

        case ActionTypes.SET_CHARACTER:
            return {
                ...state,
                character: { ...state.character, ...action.character }
            };

        case ActionTypes.SET_STATS:
            return {
                ...state,
                character: {
                    ...state.character,
                    stats: { ...state.character.stats, ...action.stats }
                }
            };

        case ActionTypes.SET_SKILLS:
            return {
                ...state,
                character: {
                    ...state.character,
                    skills: action.skills
                }
            };

        case ActionTypes.SET_COMPANIONS:
            return {
                ...state,
                companions: action.companions
            };

        case ActionTypes.SET_ADVENTURE:
            return {
                ...state,
                adventure: action.adventure
            };

        case ActionTypes.ADD_CHAT_MESSAGE:
            return {
                ...state,
                chatHistory: [...state.chatHistory, action.message]
            };

        case ActionTypes.CLEAR_CHAT:
            return {
                ...state,
                chatHistory: []
            };

        case ActionTypes.ADD_INVENTORY_ITEM:
            const existingItem = state.inventory.find(i => i.name === action.item.name);
            if (existingItem) {
                return {
                    ...state,
                    inventory: state.inventory.map(i =>
                        i.name === action.item.name
                            ? { ...i, quantity: i.quantity + (action.item.quantity || 1) }
                            : i
                    )
                };
            }
            return {
                ...state,
                inventory: [...state.inventory, { ...action.item, id: Date.now() }]
            };

        case ActionTypes.REMOVE_INVENTORY_ITEM:
            return {
                ...state,
                inventory: state.inventory.filter(i => i.id !== action.itemId)
            };

        case ActionTypes.UPDATE_HP:
            const newHp = Math.max(0, Math.min(state.character.maxHp, state.character.hp + action.amount));
            return {
                ...state,
                character: {
                    ...state.character,
                    hp: newHp
                }
            };

        case ActionTypes.SET_CURRENT_STEP:
            return {
                ...state,
                currentStep: action.step
            };

        case ActionTypes.START_GAME:
            return {
                ...state,
                gameStarted: true
            };

        case ActionTypes.UPDATE_SETTINGS:
            return {
                ...state,
                settings: { ...state.settings, ...action.settings }
            };

        case ActionTypes.LOAD_STATE:
            return { ...initialState, ...action.state };

        case ActionTypes.RESET_STATE:
            return initialState;

        default:
            return state;
    }
}

// Context
const GameContext = createContext(null);

// Provider component
export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = loadGameState();
        if (savedState) {
            dispatch({ type: ActionTypes.LOAD_STATE, state: savedState });
        }
    }, []);

    // Save state to localStorage on changes
    useEffect(() => {
        if (state.gameStarted || state.currentStep > 0) {
            saveGameState(state);
        }
    }, [state]);

    // Action creators
    const actions = {
        setCharacterField: (field, value) =>
            dispatch({ type: ActionTypes.SET_CHARACTER_FIELD, field, value }),

        setCharacter: (character) =>
            dispatch({ type: ActionTypes.SET_CHARACTER, character }),

        setStats: (stats) =>
            dispatch({ type: ActionTypes.SET_STATS, stats }),

        setSkills: (skills) =>
            dispatch({ type: ActionTypes.SET_SKILLS, skills }),

        setCompanions: (companions) =>
            dispatch({ type: ActionTypes.SET_COMPANIONS, companions }),

        setAdventure: (adventure) =>
            dispatch({ type: ActionTypes.SET_ADVENTURE, adventure }),

        addChatMessage: (message) =>
            dispatch({ type: ActionTypes.ADD_CHAT_MESSAGE, message }),

        clearChat: () =>
            dispatch({ type: ActionTypes.CLEAR_CHAT }),

        addInventoryItem: (item) =>
            dispatch({ type: ActionTypes.ADD_INVENTORY_ITEM, item }),

        removeInventoryItem: (itemId) =>
            dispatch({ type: ActionTypes.REMOVE_INVENTORY_ITEM, itemId }),

        updateHp: (amount) =>
            dispatch({ type: ActionTypes.UPDATE_HP, amount }),

        setCurrentStep: (step) =>
            dispatch({ type: ActionTypes.SET_CURRENT_STEP, step }),

        startGame: () =>
            dispatch({ type: ActionTypes.START_GAME }),

        updateSettings: (settings) =>
            dispatch({ type: ActionTypes.UPDATE_SETTINGS, settings }),

        resetGame: () => {
            dispatch({ type: ActionTypes.RESET_STATE });
            localStorage.removeItem('mythicbot_game_state');
        }
    };

    return (
        <GameContext.Provider value={{ state, ...actions }}>
            {children}
        </GameContext.Provider>
    );
}

// Custom hook
export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}

export default GameContext;
