// AI Service for Dungeon Master responses
// Supports: Mock AI (offline) and Google Gemini
// Follows D&D 5e rules for when to call for rolls

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getApiKey, hasApiKey } from './apiKeyService';

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
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024,
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
    strength: ['force', 'break', 'push', 'pull', 'lift', 'climb', 'jump', 'swim against'],
    dexterity: ['sneak', 'hide', 'pickpocket', 'lockpick', 'acrobatics', 'dodge', 'tumble'],
    constitution: ['endure', 'resist poison', 'hold breath', 'march', 'survive'],
    intelligence: ['investigate', 'recall', 'decipher', 'identify', 'arcana'],
    wisdom: ['insight', 'track', 'medicine', 'sense motive', 'perceive', 'search carefully'],
    charisma: ['persuade', 'intimidate', 'deceive', 'perform', 'charm', 'negotiate', 'convince']
};

// Actions that require ATTACK ROLLS
const ATTACK_KEYWORDS = ['attack', 'strike', 'hit', 'slash', 'stab', 'shoot', 'cast at', 'swing at', 'punch', 'kick'];

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
const analyzeAction = (action) => {
    const lowerAction = action.toLowerCase().trim();

    for (const trivial of TRIVIAL_ACTIONS) {
        if (lowerAction.startsWith(trivial) || lowerAction === trivial) {
            return { requiresRoll: false, rollType: ROLL_TYPES.NO_ROLL, actionType: 'trivial' };
        }
    }

    for (const keyword of ATTACK_KEYWORDS) {
        if (lowerAction.includes(keyword)) {
            return {
                requiresRoll: true,
                rollType: ROLL_TYPES.ATTACK_ROLL,
                actionType: 'combat',
                ability: 'strength',
                dc: 12 + Math.floor(Math.random() * 6)
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
                    ability: ability,
                    dc: 10 + Math.floor(Math.random() * 8)
                };
            }
        }
    }

    if (lowerAction.includes('ask') || lowerAction.includes('talk') || lowerAction.includes('speak')) {
        if (lowerAction.includes('convince') || lowerAction.includes('persuade') || lowerAction.includes('lie')) {
            return { requiresRoll: true, rollType: ROLL_TYPES.ABILITY_CHECK, actionType: 'interaction', ability: 'charisma', dc: 12 + Math.floor(Math.random() * 6) };
        }
        return { requiresRoll: false, rollType: ROLL_TYPES.NO_ROLL, actionType: 'interaction' };
    }

    if (lowerAction.includes('search') || lowerAction.includes('find') || lowerAction.includes('discover')) {
        return { requiresRoll: true, rollType: ROLL_TYPES.ABILITY_CHECK, actionType: 'exploration', ability: 'wisdom', dc: 10 + Math.floor(Math.random() * 6) };
    }

    return { requiresRoll: false, rollType: ROLL_TYPES.NO_ROLL, actionType: 'exploration' };
};

const getAbilityModifier = (score) => Math.floor((score - 10) / 2);

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
    const { character, companions, previousTurns, action } = context;

    // Analyze action for roll requirements
    const analysis = analyzeAction(action);
    let roll = null;
    let modifier = 0;
    let total = 0;
    let isSuccess = null;

    if (analysis.requiresRoll) {
        roll = Math.floor(Math.random() * 20) + 1;
        if (character?.stats && analysis.ability) {
            modifier = getAbilityModifier(character.stats[analysis.ability] || 10);
        }
        total = roll + modifier;
        isSuccess = roll === 20 ? true : roll === 1 ? false : total >= analysis.dc;
    }

    // Build context for Gemini
    const companionList = companions && companions.length > 0
        ? companions.map(c => `${c.name} (${c.race} ${c.class}, ${c.personality} personality)`).join(', ')
        : 'None';

    const recentHistory = previousTurns.slice(-6).map(turn =>
        `${turn.type === 'user' ? 'PLAYER' : 'DM'}: ${turn.text}`
    ).join('\n');

    const rollInfo = analysis.requiresRoll
        ? `\n\n**DICE ROLL RESULT**: The player rolled a d20 and got ${roll}${modifier >= 0 ? '+' : ''}${modifier} = ${total} against DC ${analysis.dc}. Result: ${isSuccess ? 'SUCCESS' : 'FAILURE'}${roll === 20 ? ' (CRITICAL SUCCESS!)' : roll === 1 ? ' (CRITICAL FAILURE!)' : ''}`
        : '\n\n**NO ROLL NEEDED**: This is a trivial action that succeeds automatically.';

    const prompt = `You are an exceptional Dungeon Master running a D&D 5th Edition campaign. You are a master storyteller who brings worlds to life with vivid prose, dramatic tension, and unforgettable moments.

## YOUR DUNGEON MASTER PHILOSOPHY
- **Immersion First**: Make the player FEEL like they are in the world. Engage all five senses.
- **Dramatic Storytelling**: Build tension, use pacing, create memorable moments and callbacks to previous events.
- **Player Agency**: Honor player choices. Their actions matter and have consequences.
- **D&D 5e Authenticity**: Follow the rules, but remember: narrative trumps mechanics. Rule of Cool applies.
- **Living World**: NPCs have goals, fears, and motivations. The world moves even when the player doesn't.

## D&D 5E RULES TO FOLLOW
- Natural 20 = Critical Success (describe something EPIC happening)
- Natural 1 = Critical Failure (describe a dramatic mishap, but keep it fun, not punishing)
- Skills matter: Proficiency makes characters shine in their expertise
- Class features matter: Reference class abilities when relevant (a Rogue's cunning, a Paladin's conviction)
- Race traits matter: Include racial characteristics in your descriptions
- Spells have verbal, somatic, or material components - describe the casting!
- Combat is tactical: describe positioning, cover, terrain advantages

## STORYTELLING TECHNIQUES
- **Start in action**: Hook immediately with sensory details
- **Show, don't tell**: "Sweat beads on his brow as he grips his sword tighter" not "He looks nervous"
- **The Rule of Three**: Use three sensory details per scene (sight, sound, smell/touch/taste)
- **Callbacks**: Reference earlier events, choices, and character details
- **Foreshadowing**: Plant seeds for future events when appropriate
- **Cliffhangers**: End sequences with tension or intrigue

## ENVIRONMENTAL STORYTELLING
Always include atmospheric details:
- **Weather**: Rain pattering on stone, oppressive heat, biting cold, mist curling
- **Sounds**: Distant thunder, creaking floorboards, whispered voices, clashing steel
- **Smells**: Torch smoke, damp earth, exotic spices, the copper tang of blood
- **Textures**: Rough-hewn stone, silk tapestries, gnarled roots, cold iron
- **Light**: Flickering candlelight, moonbeams through clouds, phosphorescent fungi, utter darkness

## CURRENT PARTY
**Player Character**: ${character?.name || 'Adventurer'}, a ${character?.race || 'human'} ${character?.class || 'fighter'}
- Stats: STR ${character?.stats?.strength || 10}, DEX ${character?.stats?.dexterity || 10}, CON ${character?.stats?.constitution || 10}, INT ${character?.stats?.intelligence || 10}, WIS ${character?.stats?.wisdom || 10}, CHA ${character?.stats?.charisma || 10}
- Personality: ${character?.personality || 'Brave adventurer'}
- Background: ${character?.background || 'Unknown origins'}

**Companions**: ${companionList}
When companions speak, their dialogue should:
- Reflect their personality trait (a Sarcastic character snipes, a Cheerful one encourages)
- Show their class background (a Wizard references arcana, a Fighter discusses tactics)
- React authentically to success/failure (celebrate victories, console after setbacks)
- Have their own opinions that sometimes differ from the player's choices

## RECENT EVENTS
${recentHistory || 'The adventure has just begun.'}

## CURRENT ACTION
The player says: "${action}"
${rollInfo}

## YOUR RESPONSE GUIDELINES
Write a cinematic response as the Dungeon Master (2-4 paragraphs). Structure your response:

1. **IMMEDIATE REACTION**: What happens in the moment? Describe the action with sensory detail.
2. **CONSEQUENCES**: How does the world respond? NPCs react, environment changes.
3. **COMPANION MOMENTS**: If companions are present, have 1-2 react with personality-fitting dialogue.
4. **FORWARD MOMENTUM**: End with a hook - a new discovery, approaching danger, or a choice to make.

Format companion dialogue: **CompanionName**: "Their dialogue here"

IMPORTANT RULES:
- Do NOT include dice roll numbers - the UI displays those separately
- Do NOT break character or reference game mechanics directly
- Do NOT railroad - present options, not destinations
- BE CREATIVE - surprise the player with unexpected but logical developments
- STAY CONCISE - quality over quantity, 2-4 punchy paragraphs max`;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract companion responses from the text (simple pattern matching)
        const companionResponses = [];
        if (companions && companions.length > 0) {
            companions.forEach(companion => {
                const pattern = new RegExp(`\\*\\*${companion.name}\\*\\*:\\s*"([^"]+)"`, 'gi');
                const match = pattern.exec(text);
                if (match) {
                    companionResponses.push({
                        companionName: companion.name,
                        companionRace: companion.race,
                        companionClass: companion.class,
                        personality: companion.personality || 'Cheerful',
                        text: match[1]
                    });
                }
            });
        }

        // Clean the text by removing companion dialogue markers for main message
        let cleanedText = text;
        companions?.forEach(companion => {
            cleanedText = cleanedText.replace(new RegExp(`\\*\\*${companion.name}\\*\\*:\\s*"[^"]+"\\s*`, 'gi'), '');
        });

        return {
            text: cleanedText.trim(),
            roll: roll,
            rollType: analysis.rollType,
            actionType: analysis.actionType,
            isSuccess: analysis.requiresRoll ? isSuccess : true,
            requiresRoll: analysis.requiresRoll,
            companionResponses: companionResponses.length > 0 ? companionResponses : generateCompanionResponses(companions, analysis.actionType, isSuccess)
        };
    } catch (error) {
        console.error('Gemini API error:', error);
        // Fall back to mock response
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

const generateMockResponse = (context) => {
    const { character, companions, action } = context;
    const analysis = analyzeAction(action);

    let roll = null;
    let isSuccess = null;
    let responseText = '';

    const intro = getRandomElement(narrativeTemplates[analysis.actionType] || narrativeTemplates.exploration);

    if (!analysis.requiresRoll) {
        responseText = `${intro}\n\nYou: "${action}"\n\n${getRandomElement(narrativeTemplates.trivial)}\n\nWhat would you like to do next?`;
        isSuccess = true;
    } else {
        roll = Math.floor(Math.random() * 20) + 1;
        let modifier = 0;
        if (character?.stats && analysis.ability) {
            modifier = getAbilityModifier(character.stats[analysis.ability] || 10);
        }
        const total = roll + modifier;
        isSuccess = roll === 20 ? true : roll === 1 ? false : total >= analysis.dc;

        let outcome;
        if (roll === 20) outcome = getRandomElement(narrativeTemplates.success.critical);
        else if (roll === 1) outcome = getRandomElement(narrativeTemplates.failure.fumble);
        else if (isSuccess) outcome = getRandomElement(narrativeTemplates.success.normal);
        else outcome = getRandomElement(narrativeTemplates.failure.barely);

        const rollLabel = analysis.rollType === ROLL_TYPES.ATTACK_ROLL ? 'Attack Roll' : `${analysis.ability?.charAt(0).toUpperCase()}${analysis.ability?.slice(1)} Check`;

        responseText = `${intro}\n\nYou attempt: "${action}"\n\n**${rollLabel}** (DC ${analysis.dc})\n🎲 Roll: ${roll}${modifier >= 0 ? ' + ' : ' - '}${Math.abs(modifier)} = **${total}**\n\n${outcome}\n\nWhat do you do next?`;
    }

    return {
        text: responseText,
        roll: roll,
        rollType: analysis.rollType,
        actionType: analysis.actionType,
        isSuccess: isSuccess,
        requiresRoll: analysis.requiresRoll,
        companionResponses: generateCompanionResponses(companions, analysis.actionType, isSuccess)
    };
};

// Simulated delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a Dungeon Master response
 */
export const generateDMResponse = async (context, selectedModel = 'auto') => {
    const { character, companions, previousTurns, action } = context;

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
    } else {
        console.log('📦 Using Mock AI (offline mode)...');
        await delay(500 + Math.random() * 1000);
        response = generateMockResponse(context);
        modelUsed = 'mock';
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
            isSuccess: response.isSuccess,
            aiModel: modelUsed,
            timestamp: new Date().toISOString()
        }
    };
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
            const prompt = `You are an exceptional Dungeon Master beginning an epic D&D 5th Edition adventure. Create a CINEMATIC opening that will hook the player immediately.

Adventure: ${adventure?.name || 'A New Beginning'}
Setting: ${adventure?.setting || 'A fantastical realm'}
Description: ${adventure?.description || 'An epic journey awaits'}

Player Character: ${character?.name || 'A brave adventurer'}, a ${character?.race || 'human'} ${character?.class || 'fighter'}
Personality: ${character?.personality || 'Courageous and determined'}
Background: ${character?.background || 'Mysterious origins'}

Write an epic opening narration (2-3 paragraphs) that:

1. **HOOK IMMEDIATELY**: Start with action, tension, or mystery - NOT "You find yourself..."
2. **ENGAGE ALL SENSES**: Include at least 3 sensory details (sights, sounds, smells, textures)
3. **ESTABLISH ATMOSPHERE**: Weather, lighting, ambient sounds that set the mood
4. **PERSONALIZE**: Reference the character's race or class in the scene naturally
5. **HINT AT STAKES**: Something is wrong, something needs doing, danger lurks
6. **END WITH AGENCY**: Finish with an open question or choice that demands player action

STYLE GUIDELINES:
- Use vivid, active verbs ("The wind HOWLS" not "There is wind")
- Create immediate tension or intrigue
- Make the world feel ALIVE and reactive
- Avoid clichés like "a chill runs down your spine"
- Be specific, not generic ("the iron tang of old blood" not "a bad smell")

Make the player EXCITED to type their first action!`;


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

