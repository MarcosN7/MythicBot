import { races } from '../../data/races';
import Card from '../common/Card';

export default function RaceSelection({ selectedRace, onSelect }) {
    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Choose Your Race</h2>
            <p className="text-gray-600 mb-8">Each race has unique abilities and stat bonuses.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {races.map(race => (
                    <Card
                        key={race.id}
                        hover
                        padding="sm"
                        onClick={() => onSelect(race.id)}
                        className={`text-center transition-all ${selectedRace === race.id
                                ? 'ring-2 ring-primary-500 border-primary-200 bg-primary-50'
                                : ''
                            }`}
                    >
                        <div className="text-4xl mb-3">{race.icon}</div>
                        <h3 className="font-semibold text-gray-900 mb-1">{race.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{race.description}</p>
                    </Card>
                ))}
            </div>

            {selectedRace && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl animate-fade-in">
                    {(() => {
                        const race = races.find(r => r.id === selectedRace);
                        return (
                            <>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">{race.icon}</span>
                                    {race.name} Traits
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Stat Bonuses:</span>
                                        <ul className="mt-1">
                                            {Object.entries(race.statBonuses).map(([stat, bonus]) => (
                                                <li key={stat} className="text-gray-700 capitalize">
                                                    +{bonus} {stat}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Racial Traits:</span>
                                        <ul className="mt-1">
                                            {race.traits.map(trait => (
                                                <li key={trait} className="text-gray-700">{trait}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
