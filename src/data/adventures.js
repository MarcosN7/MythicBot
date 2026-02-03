// Pre-made adventure templates
export const adventures = [
    {
        id: 'lost-mine',
        name: 'The Lost Mine of Phandelver',
        description: 'A classic adventure where you must find a legendary mine and stop the machinations of a mysterious villain.',
        difficulty: 'Beginner',
        estimatedTime: '4-6 hours',
        tags: ['Fantasy', 'Dungeon', 'Mystery'],
        setting: 'The Sword Coast',
        openingNarrative: `You stand at the edge of the town of Phandalin, a frontier settlement nestled against the foothills of the Sword Mountains. The morning mist clings to the cobblestone streets as merchants begin to stir.

Your party has been hired by a dwarf named Gundren Rockseeker to escort a wagon of supplies from Neverwinter. But Gundren rode ahead with a warrior named Sildar Hallwinter, promising to meet you in Phandalin.

It's been three days since you arrived, and there's no sign of either of them. The townsfolk whisper of bandits on the Triboar Trail, and a growing shadow seems to loom over this peaceful community.

What do you do?`,
        icon: '⛏️'
    },
    {
        id: 'dragon-lair',
        name: "Dragon's Lair",
        description: 'Brave the treacherous mountain pass and confront the ancient dragon terrorizing the realm.',
        difficulty: 'Intermediate',
        estimatedTime: '3-5 hours',
        tags: ['Fantasy', 'Combat', 'Boss Fight'],
        setting: 'The Dragonspine Mountains',
        openingNarrative: `The village of Ashford burns behind you. For weeks, the ancient red dragon Voranthos has demanded tribute—gold, livestock, and now... people. The king has issued a royal decree: whoever slays the beast shall be granted a noble title and lands.

Your ascent up the Dragonspine Mountains has taken three brutal days. The air grows thin and cold, and you can see your breath crystallize before you. Ahead, the entrance to the dragon's lair yawns like a wound in the mountainside, the rocks around it blackened by centuries of fire.

The stench of sulfur fills your nostrils. From deep within the cavern, you hear the rhythmic rumble of something massive breathing.

What do you do?`,
        icon: '🐲'
    },
    {
        id: 'haunted-manor',
        name: 'The Haunted Manor',
        description: 'Investigate the mysterious mansion on the hill and uncover its dark secrets.',
        difficulty: 'Beginner',
        estimatedTime: '2-3 hours',
        tags: ['Horror', 'Mystery', 'Puzzle'],
        setting: 'Ravencrest Manor',
        openingNarrative: `The carriage drops you at the rusted iron gates of Ravencrest Manor. Thunder rumbles in the distance, and the first drops of rain begin to fall. Through the overgrown garden, you can see the silhouette of the manor against the stormy sky—a Gothic masterpiece of towers and gables, its windows dark like empty eye sockets.

The manor has stood abandoned for fifty years, ever since the Ravencrest family vanished on All Hallows' Eve. Now, strange lights have been seen in the windows, and the village children speak of ghostly figures wandering the grounds.

The mayor has hired your party to investigate and, if possible, put the spirits to rest. As you approach the massive oak door, it creaks open on its own, revealing nothing but darkness within.

What do you do?`,
        icon: '👻'
    },
    {
        id: 'thieves-guild',
        name: "The Thieves' Guild",
        description: 'Navigate the criminal underworld to infiltrate the legendary guild of shadows.',
        difficulty: 'Intermediate',
        estimatedTime: '4-5 hours',
        tags: ['Intrigue', 'Stealth', 'Urban'],
        setting: 'The City of Blackhaven',
        openingNarrative: `The city of Blackhaven never truly sleeps. In the Merchant Quarter, lanterns illuminate the night bazaars. In the Noble District, masked balls continue until dawn. But in the Warrens, where you now stand, only shadows and secrets move freely.

You've been tracking the Crimson Claw—an artifact of immense power stolen from the royal treasury. All leads point to the legendary Thieves' Guild, an organization so secretive that many doubt its existence.

A contact has arranged a meeting with a guild fence in the Rusty Anchor tavern. The password is "The crow flies at midnight." But in a city where everyone has an angle, can you trust anyone?

The tavern door looms before you, its sign creaking in the night wind.

What do you do?`,
        icon: '🗡️'
    },
    {
        id: 'ancient-temple',
        name: 'Secrets of the Ancient Temple',
        description: 'Explore a forgotten temple and unlock the mysteries of a lost civilization.',
        difficulty: 'Advanced',
        estimatedTime: '5-7 hours',
        tags: ['Exploration', 'Puzzle', 'Ancient'],
        setting: 'The Jungle of Kha\'zar',
        openingNarrative: `After weeks of hacking through the jungle of Kha'zar, you've found it—the Temple of the Sleeping God. Vines and roots have claimed much of the ancient structure, but its massive stone doors still stand, covered in glyphs that glow faintly in the filtered sunlight.

According to the fragments of the Codex you discovered in the library of Candlekeep, this temple was built by the Azlanti, a civilization that vanished ten thousand years ago. They were said to possess magic beyond anything known today, and their greatest secret lies within these walls.

But the Azlanti did not leave their treasures unguarded. The Codex spoke of trials—tests of mind, body, and spirit that only the worthy may pass.

As you approach the doors, the glyphs pulse brighter, and you hear the grinding of ancient mechanisms coming to life.

What do you do?`,
        icon: '🏛️'
    }
];

export const getAdventureById = (id) => adventures.find(adv => adv.id === id);
