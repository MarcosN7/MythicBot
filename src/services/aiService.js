// Mock AI Service for Dungeon Master responses
// This is a placeholder for future API integration (Gemini/OpenAI)
// Follows D&D 5e rules for when to call for rolls

// === D&D ROLL RULES ===
// Only roll when:
// 1. There's meaningful uncertainty about the outcome
// 2. Failure has interesting consequences
// 3. The action is not trivial (no roll needed for walking, talking normally, etc.)
// 4. The action is not impossible (no roll can make impossible things happen)

// Roll types in D&D:
const ROLL_TYPES = {
    ABILITY_CHECK: 'ability_check',      // Uncertain tasks (persuasion, athletics, perception)
    ATTACK_ROLL: 'attack_roll',          // Attacking a creature
    SAVING_THROW: 'saving_throw',        // Resisting spells, traps, poison
    DAMAGE_ROLL: 'damage_roll',          // When an attack hits
    NO_ROLL: 'no_roll'                   // Trivial or automatic actions
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

// Actions that require SAVING THROWS (usually DM calls these)
const SAVING_THROW_TRIGGERS = ['trap', 'poison', 'spell effect', 'dragon breath', 'falling'];

const narrativeTemplates = {
    combat: [
        "The tension rises as combat begins!",
        "Your opponent readies themselves for battle!",
        "The air crackles with the promise of violence.",
        "Steel glints in the dim light as weapons are drawn."
    ],
    exploration: [
        "The world unfolds before you, rich with possibility.",
        "Your senses take in the surroundings.",
        "The path ahead holds both mystery and danger.",
        "Adventure beckons from every shadow."
    ],
    interaction: [
        "Eyes meet as the conversation begins.",
        "Words carry weight in this moment.",
        "The social dance of dialogue commences.",
        "Every word could change your fate."
    ],
    trivial: [
        "You do so without difficulty.",
        "A simple matter, easily accomplished.",
        "You complete the action with ease.",
        "No challenge presents itself."
    ],
    success: {
        critical: ["CRITICAL SUCCESS! A legendary feat!", "Natural 20! Extraordinary success!", "The dice gods smile upon you!"],
        high: ["A resounding success!", "Your skill proves more than adequate!", "Fortune favors you!"],
        normal: ["You succeed!", "Your efforts pay off!", "It works!"]
    },
    failure: {
        fumble: ["CRITICAL FAILURE! Something goes terribly wrong!", "Natural 1! Disaster strikes!", "The worst possible outcome!"],
        low: ["You fail, and it's not close.", "Your attempt falls short.", "Things don't go as planned."],
        barely: ["So close, yet not quite enough.", "You just miss the mark.", "Almost, but not quite."]
    }
};

// Companion dialogue templates based on personality and situation
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

    // Check if it's a trivial action (no roll needed)
    for (const trivial of TRIVIAL_ACTIONS) {
        if (lowerAction.startsWith(trivial) || lowerAction === trivial) {
            return {
                requiresRoll: false,
                rollType: ROLL_TYPES.NO_ROLL,
                actionType: 'trivial',
                reason: 'This action has no meaningful risk of failure.'
            };
        }
    }

    // Check if it's an attack
    for (const keyword of ATTACK_KEYWORDS) {
        if (lowerAction.includes(keyword)) {
            return {
                requiresRoll: true,
                rollType: ROLL_TYPES.ATTACK_ROLL,
                actionType: 'combat',
                ability: 'strength', // or dexterity for ranged
                dc: 12 + Math.floor(Math.random() * 6), // Random AC 12-17
                reason: 'Attack rolls determine if you hit your target.'
            };
        }
    }

    // Check for ability checks
    for (const [ability, keywords] of Object.entries(ABILITY_CHECK_ACTIONS)) {
        for (const keyword of keywords) {
            if (lowerAction.includes(keyword)) {
                return {
                    requiresRoll: true,
                    rollType: ROLL_TYPES.ABILITY_CHECK,
                    actionType: lowerAction.includes('sneak') || lowerAction.includes('hide') ? 'exploration' : 'interaction',
                    ability: ability,
                    dc: 10 + Math.floor(Math.random() * 8), // DC 10-17
                    reason: `${ability.charAt(0).toUpperCase() + ability.slice(1)} check required for uncertain outcome.`
                };
            }
        }
    }

    // Check for interaction that might need persuasion
    if (lowerAction.includes('ask') || lowerAction.includes('talk') || lowerAction.includes('speak')) {
        // Talking normally doesn't require a roll, but persuading does
        if (lowerAction.includes('convince') || lowerAction.includes('persuade') || lowerAction.includes('lie')) {
            return {
                requiresRoll: true,
                rollType: ROLL_TYPES.ABILITY_CHECK,
                actionType: 'interaction',
                ability: 'charisma',
                dc: 12 + Math.floor(Math.random() * 6),
                reason: 'Charisma check needed to influence this NPC.'
            };
        }
        return {
            requiresRoll: false,
            rollType: ROLL_TYPES.NO_ROLL,
            actionType: 'interaction',
            reason: 'Normal conversation does not require a roll.'
        };
    }

    // Default: exploration with possible perception/investigation check
    if (lowerAction.includes('search') || lowerAction.includes('find') || lowerAction.includes('discover')) {
        return {
            requiresRoll: true,
            rollType: ROLL_TYPES.ABILITY_CHECK,
            actionType: 'exploration',
            ability: 'wisdom',
            dc: 10 + Math.floor(Math.random() * 6),
            reason: 'Perception/Investigation check to find hidden things.'
        };
    }

    // Exploration without roll for simple movement/observation
    return {
        requiresRoll: false,
        rollType: ROLL_TYPES.NO_ROLL,
        actionType: 'exploration',
        reason: 'This action succeeds automatically.'
    };
};

// Calculate modifier from ability score
const getAbilityModifier = (score) => Math.floor((score - 10) / 2);

// Generate companion responses based on context
const generateCompanionResponses = (companions, actionType, isSuccess) => {
    if (!companions || companions.length === 0) return [];

    const responses = [];
    const situationType = isSuccess === null ? 'trivial' :
        isSuccess ? 'success' : 'failure';

    // Each companion has a chance to speak (40% for trivial, 70% for success/failure)
    const speakChance = situationType === 'trivial' ? 0.3 : 0.6;

    companions.forEach(companion => {
        if (Math.random() < speakChance && companion.name) {
            const personality = companion.personality || 'Cheerful';
            const dialoguePool = companionDialogues[situationType]?.[personality] ||
                companionDialogues[actionType]?.[personality] ||
                companionDialogues.trivial?.['Cheerful'] ||
                ["..."];

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

const generateContextualResponse = (action, character, companions, previousTurns) => {
    const analysis = analyzeAction(action);
    const { requiresRoll, rollType, actionType, ability, dc, reason } = analysis;

    let roll = null;
    let isSuccess = null;
    let responseText = '';

    // Set scene with narrative
    const intro = getRandomElement(narrativeTemplates[actionType] || narrativeTemplates.exploration);

    if (!requiresRoll) {
        // No roll needed - automatic success for trivial actions
        const trivialOutcome = getRandomElement(narrativeTemplates.trivial);
        responseText = `${intro}

You: "${action}"

${trivialOutcome}

What would you like to do next?`;

        isSuccess = true; // Trivial actions always succeed
    } else {
        // Roll required!
        roll = Math.floor(Math.random() * 20) + 1;

        // Add ability modifier if character has stats
        let modifier = 0;
        if (character?.stats && ability) {
            modifier = getAbilityModifier(character.stats[ability] || 10);
        }

        const total = roll + modifier;
        isSuccess = total >= dc;

        // Determine success/failure narrative
        let outcome;
        if (roll === 20) {
            outcome = getRandomElement(narrativeTemplates.success.critical);
            isSuccess = true; // Natural 20 always succeeds
        } else if (roll === 1) {
            outcome = getRandomElement(narrativeTemplates.failure.fumble);
            isSuccess = false; // Natural 1 always fails
        } else if (isSuccess) {
            outcome = total >= dc + 5 ?
                getRandomElement(narrativeTemplates.success.high) :
                getRandomElement(narrativeTemplates.success.normal);
        } else {
            outcome = total <= dc - 5 ?
                getRandomElement(narrativeTemplates.failure.low) :
                getRandomElement(narrativeTemplates.failure.barely);
        }

        const rollTypeLabel = rollType === ROLL_TYPES.ATTACK_ROLL ? 'Attack Roll' :
            rollType === ROLL_TYPES.SAVING_THROW ? 'Saving Throw' :
                `${ability?.charAt(0).toUpperCase()}${ability?.slice(1)} Check`;

        responseText = `${intro}

You attempt: "${action}"

**${rollTypeLabel}** (DC ${dc})
🎲 Roll: ${roll}${modifier >= 0 ? ' + ' : ' - '}${Math.abs(modifier)} = **${total}**

${outcome}

What do you do next?`;
    }

    // Generate companion responses
    const companionResponses = generateCompanionResponses(companions, actionType, isSuccess);

    return {
        text: responseText,
        roll: roll,
        rollType: rollType,
        actionType: actionType,
        isSuccess: isSuccess,
        requiresRoll: requiresRoll,
        companionResponses: companionResponses
    };
};

// Simulated delay to mimic API call
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a Dungeon Master response
 * @param {Object} context - The game context
 * @param {Object} context.character - Character data
 * @param {Array} context.companions - Companion data
 * @param {Array} context.previousTurns - Previous chat history
 * @param {string} context.action - The player's action
 * @returns {Promise<Object>} - The AI response with companion dialogues
 */
export const generateDMResponse = async (context) => {
    const { character, companions, previousTurns, action } = context;

    // Simulate API latency
    await delay(500 + Math.random() * 1000);

    const response = generateContextualResponse(action, character, companions, previousTurns);

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
            timestamp: new Date().toISOString()
        }
    };
};

/**
 * Generate the opening narrative for an adventure
 * @param {Object} adventure - The adventure object
 * @param {Object} character - The player's character
 * @returns {Promise<string>} - The opening narrative
 */
export const generateOpeningNarrative = async (adventure, character) => {
    await delay(300);

    if (adventure && adventure.openingNarrative) {
        return adventure.openingNarrative;
    }

    // Default opening for custom adventures
    return `Your adventure begins, brave ${character?.race || 'adventurer'}. The world stretches before you, full of mystery and danger.

What path will you choose? What legends will you forge?

The choice is yours. What do you do?`;
};

// Config for future API integration
export const AI_MODELS = {
    mock: { id: 'mock', name: 'Mock AI (Offline)', available: true },
    gemini: { id: 'gemini', name: 'Google Gemini', available: false },
    openai: { id: 'openai', name: 'OpenAI GPT-4', available: false }
};

export const getCurrentModel = () => AI_MODELS.mock;

