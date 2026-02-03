// D&D Classes with hit dice, abilities, and skills
export const classes = [
    {
        id: 'fighter',
        name: 'Fighter',
        description: 'Masters of martial combat, skilled with a variety of weapons and armor.',
        hitDice: 'd10',
        primaryAbility: 'Strength or Dexterity',
        savingThrows: ['strength', 'constitution'],
        skillChoices: ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
        skillCount: 2,
        icon: '⚔️',
        color: 'red'
    },
    {
        id: 'wizard',
        name: 'Wizard',
        description: 'Scholarly magic-users capable of manipulating the structures of reality.',
        hitDice: 'd6',
        primaryAbility: 'Intelligence',
        savingThrows: ['intelligence', 'wisdom'],
        skillChoices: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
        skillCount: 2,
        icon: '🔮',
        color: 'purple'
    },
    {
        id: 'rogue',
        name: 'Rogue',
        description: 'Stealthy and cunning, rogues excel at finding hidden dangers and striking from shadows.',
        hitDice: 'd8',
        primaryAbility: 'Dexterity',
        savingThrows: ['dexterity', 'intelligence'],
        skillChoices: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleight-of-hand', 'stealth'],
        skillCount: 4,
        icon: '🗡️',
        color: 'gray'
    },
    {
        id: 'cleric',
        name: 'Cleric',
        description: 'Divine spellcasters who channel the power of their deity to aid allies and smite foes.',
        hitDice: 'd8',
        primaryAbility: 'Wisdom',
        savingThrows: ['wisdom', 'charisma'],
        skillChoices: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
        skillCount: 2,
        icon: '✝️',
        color: 'yellow'
    },
    {
        id: 'ranger',
        name: 'Ranger',
        description: 'Warriors of the wilderness, experts in hunting and tracking their quarry.',
        hitDice: 'd10',
        primaryAbility: 'Dexterity and Wisdom',
        savingThrows: ['strength', 'dexterity'],
        skillChoices: ['animal-handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
        skillCount: 3,
        icon: '🏹',
        color: 'green'
    },
    {
        id: 'bard',
        name: 'Bard',
        description: 'Inspiring performers whose music weaves magic and bolsters allies.',
        hitDice: 'd8',
        primaryAbility: 'Charisma',
        savingThrows: ['dexterity', 'charisma'],
        skillChoices: ['acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleight-of-hand', 'stealth', 'survival'],
        skillCount: 3,
        icon: '🎵',
        color: 'pink'
    },
    {
        id: 'paladin',
        name: 'Paladin',
        description: 'Holy warriors bound by a sacred oath to uphold justice and righteousness.',
        hitDice: 'd10',
        primaryAbility: 'Strength and Charisma',
        savingThrows: ['wisdom', 'charisma'],
        skillChoices: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
        skillCount: 2,
        icon: '🛡️',
        color: 'gold'
    },
    {
        id: 'barbarian',
        name: 'Barbarian',
        description: 'Fierce warriors who can enter a battle rage, gaining primal power.',
        hitDice: 'd12',
        primaryAbility: 'Strength',
        savingThrows: ['strength', 'constitution'],
        skillChoices: ['animal-handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
        skillCount: 2,
        icon: '🪓',
        color: 'orange'
    }
];

export const getClassById = (id) => classes.find(cls => cls.id === id);
