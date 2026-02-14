// AI Service for Dungeon Master responses
// Supports: Mock AI (offline) and Google Gemini
// Follows D&D 5e rules for when to call for rolls

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getApiKey, hasApiKey } from './apiKeyService.js';
import { isFeatureEnabled } from '../config/featureFlags.js';
import { logError, logEvent } from './telemetry.js';

// === CONFIGURATION ===
// Gemini is now initialized dynamically with user-provided API key
let genAI = null;
let geminiModel = null;
let currentApiKey = null;

// Export function to check if Gemini is available
export const isGeminiAvailable = () => {
    // If we have a model initialized with the current key, it's available
    if (geminiModel !== null && currentApiKey === getApiKey()) {
        return true;
    }
    // If user has a key stored, try to initialize
    if (hasApiKey()) {
        initializeGemini(getApiKey());
        return geminiModel !== null;
    }
    return false;
};

/**
 * Initialize or reinitialize the Gemini AI with a new API key
 * @param {string} apiKey - The API key to use
 * @returns {boolean} Whether initialization was successful
 */
export const initializeGemini = (apiKey) => {
    if (!apiKey) {
        geminiModel = null;
        currentApiKey = null;
        return false;
    }

    // Skip reinitialization if key hasn't changed
    if (apiKey === currentApiKey && geminiModel !== null) {
        return true;
    }

    try {
        genAI = new GoogleGenerativeAI(apiKey);
        geminiModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 4096,
            }
        });
        currentApiKey = apiKey;
        console.log('✅ Gemini AI initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Gemini:', error);
        geminiModel = null;
        currentApiKey = null;
        return false;
    }
};

// Try to initialize on load if key exists
if (hasApiKey()) {
    initializeGemini(getApiKey());
}


const AI_REQUEST_WINDOW_MS = 10_000;
const AI_REQUEST_LIMIT = 6;
const AI_REQUEST_TIMEOUT_MS = 15_000;
const AI_RETRY_ATTEMPTS = 2;
const aiRequestTimestamps = [];

const cleanupRequestWindow = (now) => {
    while (aiRequestTimestamps.length > 0 && now - aiRequestTimestamps[0] > AI_REQUEST_WINDOW_MS) {
        aiRequestTimestamps.shift();
    }
};

const consumeRateLimitToken = () => {
    if (!isFeatureEnabled('aiRateLimiting')) return true;

    const now = Date.now();
    cleanupRequestWindow(now);

    if (aiRequestTimestamps.length >= AI_REQUEST_LIMIT) {
        return false;
    }

    aiRequestTimestamps.push(now);
    return true;
};

const withTimeout = async (promise, timeoutMs) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('AI request timed out')), timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        clearTimeout(timeoutId);
    }
};

const safeParseJson = (rawText) => {
    if (!rawText) return null;

    // Helper to attempt parsing
    const tryParse = (str) => {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    };

    // 1. Try extracting from code block
    const fromCodeFence = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fromCodeFence) {
        const parsed = tryParse(fromCodeFence[1]);
        if (parsed) return parsed;
    }

    // 2. Try direct parse (in case it's pure JSON)
    const direct = tryParse(rawText);
    if (direct) return direct;

    // 3. Try extracting the first valid JSON object structure
    // Find the first '{' and the last '}'
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const potentialJson = rawText.substring(firstBrace, lastBrace + 1);
        const extracted = tryParse(potentialJson);
        if (extracted) return extracted;
    }

    // 4. Fallback: If JSON is truncated, try to regex extract "narration" directly
    // This is a last resort to save the user from seeing raw code if possible
    const narrationMatch = rawText.match(/"narration"\s*:\s*"((?:[^"\\]|\\.)*)/);
    if (narrationMatch) {
        // If we match the start of narration but no end quote, likely truncated
        // If we have a match, we construct a partial object
        return {
            narration: narrationMatch[1] // This might be the full string or cut off, but better than null
        };
    }

    return null;
};

const sanitizeCompanionResponses = (companions, structuredCompanions = []) => {
    if (!Array.isArray(structuredCompanions) || structuredCompanions.length === 0) return [];

    return structuredCompanions
        .map((companionEntry) => {
            const matchedCompanion = companions?.find((companion) => companion.name === companionEntry.name);
            if (!matchedCompanion || !companionEntry.dialogue) return null;

            return {
                companionName: matchedCompanion.name,
                companionRace: matchedCompanion.race,
                companionClass: matchedCompanion.class,
                personality: matchedCompanion.personality || 'Cheerful',
                text: String(companionEntry.dialogue).trim()
            };
        })
        .filter(Boolean);
};

// === D&D ROLL RULES ===
const ROLL_TYPES = {
    ABILITY_CHECK: 'ability_check',
    ATTACK_ROLL: 'attack_roll',
    SAVING_THROW: 'saving_throw',
    DAMAGE_ROLL: 'damage_roll',
    NO_ROLL: 'no_roll'
};

// Actions that typically require NO roll (trivial)
const TRIVIAL_ACTIONS = [
    'look', 'look around', 'observe', 'check inventory', 'rest', 'sit', 'stand',
    'walk', 'talk to companion', 'eat', 'drink', 'wait', 'think', 'examine',
    'read', 'open door', 'close door', 'pick up', 'put down', 'equip', 'unequip'
];

// Actions that require ABILITY CHECKS
const ABILITY_CHECK_ACTIONS = {
    strength: ['force', 'break', 'smash', 'destroy', 'push', 'pull', 'lift', 'climb', 'jump', 'swim against'],
    dexterity: ['sneak', 'hide', 'pickpocket', 'lockpick', 'acrobatics', 'dodge', 'tumble'],
    constitution: ['endure', 'resist poison', 'hold breath', 'march', 'survive'],
    intelligence: ['investigate', 'recall', 'decipher', 'identify', 'arcana'],
    wisdom: ['insight', 'track', 'medicine', 'sense motive', 'perceive', 'search carefully'],
    charisma: ['persuade', 'intimidate', 'deceive', 'perform', 'charm', 'negotiate', 'convince']
};

// Actions that require ATTACK ROLLS
const ATTACK_KEYWORDS = ['attack', 'strike', 'hit', 'slash', 'stab', 'shoot', 'cast at', 'swing at', 'punch', 'kick', 'smash'];

// Companion dialogue templates for fallback/offline mode
const companionDialogues = {
    combat: {
        Cheerful: ["Let's show them what we've got!", "This is exciting!", "We can do this, team!"],
        Stoic: ["Stay focused.", "Watch your flank.", "I have your back."],
        Sarcastic: ["Oh great, another fight...", "Try not to get killed, will you?", "Here we go again."],
        Wise: ["Strike true, but strike smart.", "Patience is key in battle.", "Observe before you act."],
        Impulsive: ["CHARGE!", "I'll take the big one!", "No time to think, let's GO!"],
        Cautious: ["Be careful!", "Maybe we should plan this...", "Watch out for traps!"],
        Grumpy: ["Ugh, more fighting.", "Let's get this over with.", "I was having a nice day."],
        Mischievous: ["Ooh, this'll be fun!", "Dibs on their loot!", "Watch this trick!"]
    },
    exploration: {
        Cheerful: ["Ooh, what's over there?", "This place is amazing!", "Adventure awaits!"],
        Stoic: ["Proceed with caution.", "Something feels off.", "Stay alert."],
        Sarcastic: ["Spooky. Very original.", "Let me guess, it's trapped.", "What could go wrong?"],
        Wise: ["These ruins hold many secrets.", "The ancients built well.", "There is much to learn here."],
        Impulsive: ["Let's touch everything!", "I'll check that room!", "Race you to the end!"],
        Cautious: ["Should we really go in there?", "I've got a bad feeling...", "Let someone else go first."],
        Grumpy: ["Another dusty ruin.", "My feet hurt.", "Are we there yet?"],
        Mischievous: ["I bet there's treasure!", "What's behind door number one?", "Let's split up!"]
    },
    interaction: {
        Cheerful: ["Hello, friend!", "Nice to meet you!", "What a lovely person!"],
        Stoic: ["...", "Speak your purpose.", "We mean no harm."],
        Sarcastic: ["Oh, this will be productive.", "I'm sure we can trust them.", "Charming."],
        Wise: ["Choose your words carefully.", "There is wisdom in listening.", "What knowledge do you seek?"],
        Impulsive: ["Hi! We're adventurers!", "Do you have any quests?", "We're here to help!"],
        Cautious: ["Can we trust them?", "Something seems suspicious.", "Be on your guard."],
        Grumpy: ["Can we hurry this up?", "I'll wait over here.", "Just get the information."],
        Mischievous: ["I could pickpocket them...", "Want me to distract them?", "They look rich!"]
    },
    success: {
        Cheerful: ["We did it!", "Amazing work!", "I knew we could do it!"],
        Stoic: ["Well done.", "As expected.", "Good."],
        Sarcastic: ["Wow, didn't see that coming.", "Color me impressed.", "Finally, something works."],
        Wise: ["Skill and fortune align.", "A lesson well learned.", "Victory comes to the prepared."],
        Impulsive: ["YEAH! That was awesome!", "Did you see that?!", "Let's do it again!"],
        Cautious: ["Phew! That was close.", "Thank goodness.", "We got lucky there."],
        Grumpy: ["About time.", "Took long enough.", "Can we rest now?"],
        Mischievous: ["Ha! Take that!", "Too easy!", "Who's next?"]
    },
    failure: {
        Cheerful: ["That's okay, we'll try again!", "Every setback is a setup!", "No worries!"],
        Stoic: ["It happens.", "Regroup.", "Learn and adapt."],
        Sarcastic: ["Nailed it.", "Brilliant strategy.", "Well, that was inevitable."],
        Wise: ["Failure teaches more than success.", "We must reconsider.", "All is not lost."],
        Impulsive: ["Let's try again RIGHT NOW!", "Oops! My bad!", "That didn't count!"],
        Cautious: ["I warned you!", "We should have been more careful.", "This was too risky."],
        Grumpy: ["Figures.", "This is fine. Everything's fine.", "I'm going home."],
        Mischievous: ["Ha! Wait, we lost?", "That wasn't supposed to happen.", "Plan B?"]
    },
    trivial: {
        Cheerful: ["Nice!", "Cool!", "Looking good!"],
        Stoic: ["Proceed.", "Continue.", "*nods*"],
        Sarcastic: ["Riveting.", "What's next, breathing?", "Groundbreaking stuff."],
        Wise: ["Every step has purpose.", "Well considered.", "As it should be."],
        Impulsive: ["Okay now what?!", "Faster! Let's go!", "Boring! What's next?"],
        Cautious: ["Good, that was safe.", "No problems there.", "One step at a time."],
        Grumpy: ["...okay.", "Fine.", "Whatever."],
        Mischievous: ["Ooh, can I do something too?", "My turn my turn!", "Let me help!"]
    }
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Determine if an action requires a roll and what type

const RULE_ENGINE = {
    combat: [
        { patterns: ['attack', 'strike', 'slash', 'stab', 'shoot', 'cast at', 'swing at', 'punch', 'kick', 'smash'], rollType: ROLL_TYPES.ATTACK_ROLL, ability: 'strength', dc: 13 }
    ],
    exploration: [
        { patterns: ['search', 'investigate', 'inspect', 'track', 'discover', 'check'], rollType: ROLL_TYPES.ABILITY_CHECK, ability: 'wisdom', dc: 12 },
        { patterns: ['sneak', 'hide', 'lockpick', 'pickpocket', 'dodge'], rollType: ROLL_TYPES.ABILITY_CHECK, ability: 'dexterity', dc: 13 },
        { patterns: ['climb', 'jump', 'force', 'push', 'pull', 'lift', 'break', 'destroy'], rollType: ROLL_TYPES.ABILITY_CHECK, ability: 'strength', dc: 12 }
    ],
    social: [
        { patterns: ['persuade', 'convince', 'negotiate', 'intimidate', 'deceive', 'lie'], rollType: ROLL_TYPES.ABILITY_CHECK, ability: 'charisma', dc: 12 }
    ]
};

const analyzeActionWithRulesEngine = (action) => {
    const lowerAction = action.toLowerCase().trim();

    for (const trivial of TRIVIAL_ACTIONS) {
        if (lowerAction.startsWith(trivial) || lowerAction === trivial) {
            return { requiresRoll: false, rollType: ROLL_TYPES.NO_ROLL, actionType: 'trivial', dc: null };
        }
    }

    for (const rule of RULE_ENGINE.combat) {
        if (rule.patterns.some((pattern) => lowerAction.includes(pattern))) {
            return { requiresRoll: true, rollType: rule.rollType, actionType: 'combat', ability: rule.ability, dc: rule.dc };
        }
    }

    for (const rule of RULE_ENGINE.exploration) {
        if (rule.patterns.some((pattern) => lowerAction.includes(pattern))) {
            return { requiresRoll: true, rollType: rule.rollType, actionType: 'exploration', ability: rule.ability, dc: rule.dc };
        }
    }

    for (const rule of RULE_ENGINE.social) {
        if (rule.patterns.some((pattern) => lowerAction.includes(pattern))) {
            return { requiresRoll: true, rollType: rule.rollType, actionType: 'interaction', ability: rule.ability, dc: rule.dc };
        }
    }

    return null;
};

const analyzeAction = (action, companions = []) => {
    let targetCharacter = 'player';
    let actionToAnalyze = action;

    // Check if action is directed at a companion
    if (companions && companions.length > 0) {
        for (const companion of companions) {
            const namePattern = new RegExp(`^${companion.name}\\b`, 'i');
            if (namePattern.test(action)) {
                targetCharacter = companion.name;
                // Remove name from action for analysis (e.g., "Lyra attack" -> "attack")
                actionToAnalyze = action.replace(namePattern, '').trim();
                // Remove leading punctuation like comma or colon
                actionToAnalyze = actionToAnalyze.replace(/^[,:]\s*/, '');
                break;
            }
        }
    }

    const deterministicAnalysis = analyzeActionWithRulesEngine(actionToAnalyze);
    if (deterministicAnalysis) {
        return { ...deterministicAnalysis, characterName: targetCharacter };
    }

    const lowerAction = actionToAnalyze.toLowerCase().trim();

    for (const keyword of ATTACK_KEYWORDS) {
        if (lowerAction.includes(keyword)) {
            return {
                requiresRoll: true,
                rollType: ROLL_TYPES.ATTACK_ROLL,
                actionType: 'combat',
                ability: 'strength',
                dc: 14,
                characterName: targetCharacter
            };
        }
    }

    for (const [ability, keywords] of Object.entries(ABILITY_CHECK_ACTIONS)) {
        for (const keyword of keywords) {
            if (lowerAction.includes(keyword)) {
                return {
                    requiresRoll: true,
                    rollType: ROLL_TYPES.ABILITY_CHECK,
                    actionType: lowerAction.includes('sneak') || lowerAction.includes('hide') ? 'exploration' : 'interaction',
                    ability,
                    dc: 12,
                    characterName: targetCharacter
                };
            }
        }
    }

    return { requiresRoll: false, rollType: ROLL_TYPES.NO_ROLL, actionType: 'exploration', dc: null, characterName: targetCharacter };
};

export const getAbilityModifier = (score) => Math.floor((score - 10) / 2);

export { analyzeAction, ROLL_TYPES };


// Generate companion responses (for fallback)
const generateCompanionResponses = (companions, actionType, isSuccess) => {
    if (!companions || companions.length === 0) return [];
    const responses = [];
    const situationType = isSuccess === null ? 'trivial' : isSuccess ? 'success' : 'failure';
    const speakChance = situationType === 'trivial' ? 0.3 : 0.6;

    companions.forEach(companion => {
        if (Math.random() < speakChance && companion.name) {
            const personality = companion.personality || 'Cheerful';
            const dialoguePool = companionDialogues[situationType]?.[personality] || companionDialogues.trivial?.['Cheerful'] || ["..."];
            responses.push({
                companionName: companion.name,
                companionRace: companion.race,
                companionClass: companion.class,
                personality: personality,
                text: getRandomElement(dialoguePool)
            });
        }
    });
    return responses;
};

// === GEMINI AI RESPONSE ===
const generateGeminiResponse = async (context) => {
    const { character, companions, previousTurns, action, rollResult } = context;

    // Analyze action for roll requirements
    const analysis = analyzeAction(action, companions);

    // If we have a roll result, we are RESOLVING a pending action
    if (rollResult) {
        return generateRollResolution(context, analysis, rollResult);
    }

    // If action requires a roll but we don't have one yet, we need to ASK for it
    if (analysis.requiresRoll) {
        // Build context for Gemini (Request Phase)
        const companionList = companions && companions.length > 0
            ? companions.map(c => `${c.name} (${c.race} ${c.class}, ${c.personality} personality)`).join(', ')
            : 'None';

        const recentHistory = previousTurns.slice(-6).map(turn =>
            `${turn.type === 'user' ? 'PLAYER' : 'DM'}: ${turn.text}`
        ).join('\n');

        const actorName = analysis.characterName === 'player' ? character?.name : analysis.characterName;
        const actorType = analysis.characterName === 'player' ? 'Player' : 'Companion';

        const prompt = `You are an expert Dungeon Master for a D&D 5e solo campaign.
Your goal is to *gamify* the experience.
The ${actorType} (${actorName}) has attempted an action that requires a dice roll.

Valid Check Type: ${analysis.rollType === 'attack_roll' ? 'Attack Roll' : `${analysis.ability} Check`} (DC ${analysis.dc})

## CORE INSTRUCTIONS
1. **DESCRIBE THE SETUP**: Describe the immediate situation and the challenge facing ${actorName}.
2. **ASK FOR THE ROLL**: Explicitly tell the player to roll for ${actorName}.
3. **STOP**: Do NOT describe the outcome yet. Wait for the roll.

## CURRENT CONTEXT
- **Player**: ${character?.name} (${character?.race} ${character?.class})
- **Party**: ${companionList}
- **Situation**: ${recentHistory}

## ACTION
"${action}"

## OUTPUT FORMAT (Strict JSON)
{
  "narration": "The setup text (1-2 paragraphs). End by asking for the specific roll for ${actorName}.",
  "companions": []
}`;

        // Execute request to Gemini
        try {
            if (!consumeRateLimitToken()) throw new Error('Rate limit exceeded');
            const result = await withTimeout(geminiModel.generateContent(prompt), AI_REQUEST_TIMEOUT_MS);
            const response = await result.response;
            const text = response.text();
            const structured = safeParseJson(text);
            const cleanedText = structured?.narration?.trim() || text.replace(/```json/g, '').replace(/```/g, '').trim();

            return {
                text: cleanedText,
                requiresRoll: true,
                waitingForRoll: true, // Signal to UI to wait for user input
                rollParams: {
                    type: analysis.rollType,
                    ability: analysis.ability,
                    dc: analysis.dc,
                    action: action, // Store original action to resolve later
                    characterName: analysis.characterName // Pass who is rolling
                },
                companionResponses: []
            };

        } catch (error) {
            console.error('Gemini Request Error:', error);
            // Fallback to mock if API fails
            return generateMockResponse(context);
        }
    }

    // Normal narrative flow (No roll needed)
    return generateNormalNarrative(context);
};

// Helper for normal narrative (no roll)
const generateNormalNarrative = async (context) => {
    const { character, companions, previousTurns, action } = context;

    // ... (Existing logic for normal response construction) ...
    // Reuse the existing prompt logic but strictly for non-roll actions

    const companionList = companions && companions.length > 0
        ? companions.map(c => `${c.name} (${c.race} ${c.class}, ${c.personality} personality)`).join(', ')
        : 'None';

    const recentHistory = previousTurns.slice(-6).map(turn =>
        `${turn.type === 'user' ? 'PLAYER' : 'DM'}: ${turn.text}`
    ).join('\n');

    const prompt = `You are an expert Dungeon Master for a D&D 5e solo campaign.
Your goal is to *gamify* the experience. The player action does NOT require a roll (it is trivial or social).

## CORE INSTRUCTIONS
1. **NARRATE**: Describe the outcome vividly.
2. **COMPANIONS**: Include companion reactions if relevant.
3. **HOOK**: End with a prompt for what to do next.

## CURRENT CONTEXT
- **Player**: ${character?.name} (${character?.race} ${character?.class})
- **Party**: ${companionList}
- **Situation**: ${recentHistory}

## PLAYER ACTION
"${action}"

## OUTPUT FORMAT (Strict JSON)
{
  "narration": "Response text (2-3 paragraphs).",
  "companions": [{ "name": "Name", "dialogue": "Text" }]
}`;

    // Execute request
    try {
        if (!consumeRateLimitToken()) throw new Error('Rate limit exceeded');
        const result = await withTimeout(geminiModel.generateContent(prompt), AI_REQUEST_TIMEOUT_MS);
        const response = await result.response;
        const text = response.text();
        const structured = safeParseJson(text);
        const cleanedText = structured?.narration?.trim() || text.replace(/```json/g, '').replace(/```/g, '').trim();
        const companionResponses = sanitizeCompanionResponses(companions, structured?.companions);

        return {
            text: cleanedText,
            requiresRoll: false,
            companionResponses
        };
    } catch (error) {
        console.error('Gemini Request Error:', error);
        return generateMockResponse(context);
    }
};

// Helper for resolving a roll
const generateRollResolution = async (context, analysis, rollResult) => {
    const { character, companions, previousTurns, action } = context;
    const { total, isSuccess, roll, modifier } = rollResult;

    const companionList = companions && companions.length > 0
        ? companions.map(c => `${c.name} (${c.race} ${c.class}, ${c.personality} personality)`).join(', ')
        : 'None';

    const recentHistory = previousTurns.slice(-6).map(turn =>
        `${turn.type === 'user' ? 'PLAYER' : 'DM'}: ${turn.text}`
    ).join('\n');

    // Use the analysis passed as argument
    const actorName = analysis.characterName === 'player' ? character?.name : analysis.characterName;

    const prompt = `You are an expert Dungeon Master. 
${actorName} just rolled dice to resolve an action.

Action: "${action}"
Roll: ${roll} + ${modifier} = ${total} (DC ${analysis.dc})
Result: ${isSuccess ? 'SUCCESS' : 'FAILURE'} ${roll === 20 ? '(CRITICAL SUCCESS!)' : roll === 1 ? '(CRITICAL FAILURE!)' : ''}

## CORE INSTRUCTIONS
1. **RESOLVE THE ACTION**: Describe the consequence of the roll for ${actorName}.
   - Success: They achieve their goal.
   - Failure: They fail, perhaps with complication.
2. **COMPANIONS**: React to the result.

## CURRENT CONTEXT
- **Player**: ${character?.name}
- **Party**: ${companionList}
- **Situation**: ${recentHistory}

## OUTPUT FORMAT (Strict JSON)
{
  "narration": "Consequence text (2-3 paragraphs).",
  "companions": [{ "name": "Name", "dialogue": "Text" }]
}`;

    try {
        if (!consumeRateLimitToken()) throw new Error('Rate limit exceeded');
        const result = await withTimeout(geminiModel.generateContent(prompt), AI_REQUEST_TIMEOUT_MS);
        const response = await result.response;
        const text = response.text();
        const structured = safeParseJson(text);
        const cleanedText = structured?.narration?.trim() || text.replace(/```json/g, '').replace(/```/g, '').trim();
        const companionResponses = sanitizeCompanionResponses(companions, structured?.companions);

        return {
            text: cleanedText,
            requiresRoll: true,
            isSuccess,
            roll: roll,
            rollType: analysis.rollType, // Pass back so UI can show the roll result bubble
            companionResponses
        };
    } catch (error) {
        console.error('Gemini Request Error:', error);
        return generateMockResponse(context);
    }
};

// === MOCK AI RESPONSE (Fallback) ===
const narrativeTemplates = {
    combat: ["The tension rises as combat begins!", "Your opponent readies themselves for battle!", "Steel glints in the dim light."],
    exploration: ["The world unfolds before you.", "Your senses take in the surroundings.", "Adventure beckons."],
    interaction: ["Eyes meet as conversation begins.", "Words carry weight in this moment.", "Every word could change your fate."],
    trivial: ["You do so without difficulty.", "A simple matter.", "No challenge presents itself."],
    success: { critical: ["CRITICAL SUCCESS!"], high: ["A resounding success!"], normal: ["You succeed!"] },
    failure: { fumble: ["CRITICAL FAILURE!"], low: ["You fail."], barely: ["So close, yet not enough."] }
};

// === MOCK AI RESPONSE (OFFLINE MODE) ===
const generateMockResponse = (context) => {
    const { action, rollResult, companions } = context;
    const analysis = analyzeAction(action, companions);

    // CASE 1: Resolving a pending roll
    if (rollResult) {
        const actor = analysis.characterName === 'player' ? 'You' : analysis.characterName;
        return {
            text: `[MOCK] ${actor} rolled a ${rollResult.total}! The action is resolved with ${rollResult.isSuccess ? 'success' : 'failure'}. The outcome is dramatic.`,
            requiresRoll: true,
            isSuccess: rollResult.isSuccess,
            roll: rollResult.roll,
            rollType: 'ability_check', // simplified
            companionResponses: [
                { name: 'Lyra', dialogue: rollResult.isSuccess ? "Impressive!" : "That could have gone better." }
            ]
        };
    }

    // CASE 2: Requesting a roll
    if (analysis.requiresRoll) {
        const actor = analysis.characterName === 'player' ? 'you' : analysis.characterName;
        return {
            text: `[MOCK] That sounds risky. I need ${actor} to make a ${analysis.ability} check (DC ${analysis.dc}) to see if successful.`,
            requiresRoll: true,
            waitingForRoll: true, // Signal UI to prompt user
            rollParams: {
                type: analysis.rollType,
                ability: analysis.ability,
                dc: analysis.dc,
                action: action,
                characterName: analysis.characterName
            },
            companionResponses: []
        };
    }

    // CASE 3: Normal narrative
    return {
        text: `[MOCK] You ${action}. The world reacts accordingly. The path ahead is clear.`,
        requiresRoll: false,
        companionResponses: [
            { name: 'Lyra', dialogue: "We should keep moving." }
        ]
    };
};

// Simulated delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a Dungeon Master response
 */
export const generateDMResponse = async (context, selectedModel = 'auto') => {
    const { character, companions, previousTurns, action, rollResult } = context;

    // Determine which model to use based on user selection
    const useGemini = selectedModel === 'gemini'
        ? (isGeminiAvailable() && geminiModel)
        : selectedModel === 'mock'
            ? false
            : (isGeminiAvailable() && geminiModel); // 'auto' mode

    let response;
    let modelUsed;

    if (useGemini) {
        console.log('🤖 Using Gemini AI...');
        response = await generateGeminiResponse(context);
        modelUsed = 'gemini';
        logEvent('dm_response_generated', { model: modelUsed, requiresRoll: response.requiresRoll });
    } else {
        console.log('📦 Using Mock AI (offline mode)...');
        await delay(500 + Math.random() * 1000);
        response = generateMockResponse(context); // TODO: Update mock response to support manual rolls if needed
        modelUsed = 'mock';
        logEvent('dm_response_generated', { model: modelUsed, requiresRoll: response.requiresRoll });
    }

    return {
        success: true,
        message: response.text,
        companionResponses: response.companionResponses,
        metadata: {
            roll: response.roll,
            rollType: response.rollType,
            actionType: response.actionType,
            requiresRoll: response.requiresRoll,
            waitingForRoll: response.waitingForRoll, // Pass this flag to UI
            rollParams: response.rollParams,         // Pass params to UI
            isSuccess: response.isSuccess,
            aiModel: modelUsed,
            timestamp: new Date().toISOString()
        }
    };
};

/**
 * Resolve a dice roll by sending it to the AI for narration
 */
export const resolveDiceRoll = async (context, rollResult, originalAction) => {
    // Add roll result to context
    const fullContext = {
        ...context,
        action: originalAction,
        rollResult: rollResult
    };

    return generateDMResponse(fullContext, 'gemini');
};

/**
 * Generate the opening narrative for an adventure
 */
export const generateOpeningNarrative = async (adventure, character, selectedModel = 'auto') => {
    // Determine which model to use
    const useGemini = selectedModel === 'gemini'
        ? (isGeminiAvailable() && geminiModel)
        : selectedModel === 'mock'
            ? false
            : (isGeminiAvailable() && geminiModel);

    if (useGemini) {
        try {
            const prompt = `You are a cinematic Dungeon Master starting a new D&D 5e campaign.

**Adventure**: ${adventure?.name || 'A New Beginning'}
**Setting**: ${adventure?.setting || 'Unknown Realm'}
**Hero**: ${character?.name} (${character?.race} ${character?.class})
**Vibe**: Epic, Atmospheric, Urgent.

**Your Task**:
Write an opening narration that drops the player *in media res* (in the middle of action).
- **DO NOT** start with "You find yourself in a tavern..."
- **DO START** with a problem, a threat, or a mystery directly in front of them.
- **Engage Senses**: The smell of ozone, the grit of sand, the sound of distant war drums.
- **Call to Action**: End the narration with an immediate crisis that demands a response. "The guard discovers you. What do you do?"

Keep it to 2 paragraphs maximum. Make it punchy.`;


            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini opening narrative error:', error);
        }
    }

    // Fallback to adventure's built-in narrative or default
    if (adventure && adventure.openingNarrative) {
        return adventure.openingNarrative;
    }

    return `Your adventure begins, brave ${character?.race || 'adventurer'}. The world stretches before you, full of mystery and danger.

What path will you choose? What legends will you forge?

The choice is yours. What do you do?`;
};

// Config for AI models - availability is now dynamic based on user's API key
export const AI_MODELS = {
    mock: { id: 'mock', name: 'Mock AI (Offline)', available: true },
    gemini: { id: 'gemini', name: 'Google Gemini', get available() { return hasApiKey(); } },
    openai: { id: 'openai', name: 'OpenAI GPT-4', available: false }
};

export const getCurrentModel = () => hasApiKey() ? AI_MODELS.gemini : AI_MODELS.mock;

