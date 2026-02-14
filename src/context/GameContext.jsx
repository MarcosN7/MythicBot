import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { saveGameState, loadGameState, clearGameState } from '../services/storage';
import { ActionTypes, gameReducer, initialState } from './gameState';

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

    // Action creators - Memoized to prevent unnecessary re-renders
    const actions = useMemo(() => ({
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
            clearGameState();
        },

        setPendingRoll: (rollData) =>
            dispatch({ type: ActionTypes.SET_PENDING_ROLL, rollData }),

        clearPendingRoll: () =>
            dispatch({ type: ActionTypes.CLEAR_PENDING_ROLL })
    }), []);

    const contextValue = useMemo(() => ({ state, ...actions }), [state, actions]);

    return (
        <GameContext.Provider value={contextValue}>
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
