import { classes } from '../../data/classes';
import Card from '../common/Card';

export default function ClassSelection({ selectedClass, onSelect }) {
    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Choose Your Class</h2>
            <p className="text-gray-600 mb-8">Your class defines your combat style and abilities.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {classes.map(cls => (
                    <Card
                        key={cls.id}
                        hover
                        padding="sm"
                        onClick={() => onSelect(cls.id)}
                        className={`text-center transition-all ${selectedClass === cls.id
                                ? 'ring-2 ring-primary-500 border-primary-200 bg-primary-50'
                                : ''
                            }`}
                    >
                        <div className="text-4xl mb-3">{cls.icon}</div>
                        <h3 className="font-semibold text-gray-900 mb-1">{cls.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{cls.description}</p>
                    </Card>
                ))}
            </div>

            {selectedClass && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl animate-fade-in">
                    {(() => {
                        const cls = classes.find(c => c.id === selectedClass);
                        return (
                            <>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">{cls.icon}</span>
                                    {cls.name} Details
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Hit Dice:</span>
                                        <p className="text-gray-900 font-medium">{cls.hitDice}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Primary Ability:</span>
                                        <p className="text-gray-900 font-medium">{cls.primaryAbility}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Skill Choices:</span>
                                        <p className="text-gray-900 font-medium">{cls.skillCount} skills</p>
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
