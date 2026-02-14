export const initialState = {
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
    companions: [],
    adventure: null,
    chatHistory: [],
    inventory: [
        { id: 1, name: 'Backpack', quantity: 1 },
        { id: 2, name: 'Torch', quantity: 3 },
        { id: 3, name: 'Rations', quantity: 5 },
        { id: 4, name: 'Gold Pieces', quantity: 15 }
    ],
    gameStarted: false,
    currentStep: 0,
    settings: {
        aiModel: 'mock',
        darkMode: false,
        soundEnabled: true,
        animationsEnabled: true
    },
    pendingRoll: null // { ability: 'strength', dc: 15, action: 'Kick door' }
};

export const ActionTypes = {
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
    LOAD_STATE: 'LOAD_STATE',
    RESET_STATE: 'RESET_STATE',
    SET_PENDING_ROLL: 'SET_PENDING_ROLL',
    CLEAR_PENDING_ROLL: 'CLEAR_PENDING_ROLL'
};

export function gameReducer(state, action) {
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
            return { ...state, companions: action.companions };
        case ActionTypes.SET_ADVENTURE:
            return { ...state, adventure: action.adventure };
        case ActionTypes.ADD_CHAT_MESSAGE:
            return { ...state, chatHistory: [...state.chatHistory, action.message] };
        case ActionTypes.CLEAR_CHAT:
            return { ...state, chatHistory: [] };
        case ActionTypes.ADD_INVENTORY_ITEM: {
            const existingItem = state.inventory.find((i) => i.name === action.item.name);
            if (existingItem) {
                return {
                    ...state,
                    inventory: state.inventory.map((i) =>
                        i.name === action.item.name
                            ? { ...i, quantity: i.quantity + (action.item.quantity || 1) }
                            : i
                    )
                };
            }
            return { ...state, inventory: [...state.inventory, { ...action.item, id: Date.now() }] };
        }
        case ActionTypes.REMOVE_INVENTORY_ITEM:
            return { ...state, inventory: state.inventory.filter((i) => i.id !== action.itemId) };
        case ActionTypes.UPDATE_HP: {
            const newHp = Math.max(0, Math.min(state.character.maxHp, state.character.hp + action.amount));
            return { ...state, character: { ...state.character, hp: newHp } };
        }
        case ActionTypes.SET_CURRENT_STEP:
            return { ...state, currentStep: action.step };
        case ActionTypes.START_GAME:
            return { ...state, gameStarted: true };
        case ActionTypes.UPDATE_SETTINGS:
            return { ...state, settings: { ...state.settings, ...action.settings } };
        case ActionTypes.LOAD_STATE:
            return { ...initialState, ...action.state };
        case ActionTypes.RESET_STATE:
        case ActionTypes.RESET_STATE:
            return initialState;
        case ActionTypes.SET_PENDING_ROLL:
            return { ...state, pendingRoll: action.rollData };
        case ActionTypes.CLEAR_PENDING_ROLL:
            return { ...state, pendingRoll: null };
        default:
            return state;
    }
}
