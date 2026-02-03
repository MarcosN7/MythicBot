// D&D Races with stat bonuses and traits
export const races = [
    {
        id: 'human',
        name: 'Human',
        description: 'Versatile and ambitious, humans are the most adaptable of all races.',
        statBonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
        traits: ['Extra Language', 'Bonus Skill'],
        speed: 30,
        icon: '👤'
    },
    {
        id: 'elf',
        name: 'Elf',
        description: 'Graceful and long-lived, elves possess keen senses and a deep connection to nature.',
        statBonuses: { dexterity: 2 },
        traits: ['Darkvision', 'Fey Ancestry', 'Trance'],
        speed: 30,
        icon: '🧝'
    },
    {
        id: 'dwarf',
        name: 'Dwarf',
        description: 'Stout and sturdy, dwarves are known for their resilience and craftsmanship.',
        statBonuses: { constitution: 2 },
        traits: ['Darkvision', 'Dwarven Resilience', 'Stonecunning'],
        speed: 25,
        icon: '⛏️'
    },
    {
        id: 'halfling',
        name: 'Halfling',
        description: 'Small but brave, halflings possess remarkable luck and stealth.',
        statBonuses: { dexterity: 2 },
        traits: ['Lucky', 'Brave', 'Nimble'],
        speed: 25,
        icon: '🍀'
    },
    {
        id: 'tiefling',
        name: 'Tiefling',
        description: 'Born with infernal heritage, tieflings wield dark charisma and magical powers.',
        statBonuses: { charisma: 2, intelligence: 1 },
        traits: ['Darkvision', 'Hellish Resistance', 'Infernal Legacy'],
        speed: 30,
        icon: '😈'
    },
    {
        id: 'dragonborn',
        name: 'Dragonborn',
        description: 'Proud descendants of dragons, they possess a breath weapon and draconic ancestry.',
        statBonuses: { strength: 2, charisma: 1 },
        traits: ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance'],
        speed: 30,
        icon: '🐉'
    },
    {
        id: 'gnome',
        name: 'Gnome',
        description: 'Curious and inventive, gnomes are small folk with big imaginations.',
        statBonuses: { intelligence: 2 },
        traits: ['Darkvision', 'Gnome Cunning'],
        speed: 25,
        icon: '🔧'
    },
    {
        id: 'half-orc',
        name: 'Half-Orc',
        description: 'Combining human ambition with orcish strength, half-orcs are formidable warriors.',
        statBonuses: { strength: 2, constitution: 1 },
        traits: ['Darkvision', 'Menacing', 'Relentless Endurance', 'Savage Attacks'],
        speed: 30,
        icon: '💪'
    }
];

export const getRaceById = (id) => races.find(race => race.id === id);
