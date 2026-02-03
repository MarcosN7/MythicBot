// D&D Skills with ability associations
export const skills = [
    { id: 'acrobatics', name: 'Acrobatics', ability: 'dexterity', description: 'Your ability to stay on your feet in tricky situations.' },
    { id: 'animal-handling', name: 'Animal Handling', ability: 'wisdom', description: 'Your ability to calm, control, or train animals.' },
    { id: 'arcana', name: 'Arcana', ability: 'intelligence', description: 'Your knowledge of spells, magic items, and magical traditions.' },
    { id: 'athletics', name: 'Athletics', ability: 'strength', description: 'Your ability to climb, jump, swim, and perform physical feats.' },
    { id: 'deception', name: 'Deception', ability: 'charisma', description: 'Your ability to convincingly hide the truth.' },
    { id: 'history', name: 'History', ability: 'intelligence', description: 'Your knowledge of historical events, people, and places.' },
    { id: 'insight', name: 'Insight', ability: 'wisdom', description: 'Your ability to determine the true intentions of others.' },
    { id: 'intimidation', name: 'Intimidation', ability: 'charisma', description: 'Your ability to influence others through threats.' },
    { id: 'investigation', name: 'Investigation', ability: 'intelligence', description: 'Your ability to search for clues and make deductions.' },
    { id: 'medicine', name: 'Medicine', ability: 'wisdom', description: 'Your ability to stabilize the dying and diagnose illnesses.' },
    { id: 'nature', name: 'Nature', ability: 'intelligence', description: 'Your knowledge of terrain, plants, animals, and weather.' },
    { id: 'perception', name: 'Perception', ability: 'wisdom', description: 'Your ability to spot, hear, or detect the presence of something.' },
    { id: 'performance', name: 'Performance', ability: 'charisma', description: 'Your ability to delight an audience with music, dance, or acting.' },
    { id: 'persuasion', name: 'Persuasion', ability: 'charisma', description: 'Your ability to influence others with tact and social graces.' },
    { id: 'religion', name: 'Religion', ability: 'intelligence', description: 'Your knowledge of deities, rites, prayers, and religious hierarchies.' },
    { id: 'sleight-of-hand', name: 'Sleight of Hand', ability: 'dexterity', description: 'Your ability to perform acts of legerdemain or manual trickery.' },
    { id: 'stealth', name: 'Stealth', ability: 'dexterity', description: 'Your ability to hide and move without being seen.' },
    { id: 'survival', name: 'Survival', ability: 'wisdom', description: 'Your ability to track, hunt, and navigate the wilderness.' }
];

export const getSkillById = (id) => skills.find(skill => skill.id === id);
export const getSkillsByAbility = (ability) => skills.filter(skill => skill.ability === ability);
