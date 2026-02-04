import { skills } from '../../data/skills';
import { getClassById } from '../../data/classes';

export default function SkillSelection({ selectedClass, selectedSkills, onSkillsChange }) {
    const classData = getClassById(selectedClass);
    const availableSkills = classData
        ? skills.filter(s => classData.skillChoices.includes(s.id))
        : skills;
    const maxSkills = classData?.skillCount || 2;

    const handleToggleSkill = (skillId) => {
        if (selectedSkills.includes(skillId)) {
            onSkillsChange(selectedSkills.filter(id => id !== skillId));
        } else if (selectedSkills.length < maxSkills) {
            onSkillsChange([...selectedSkills, skillId]);
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Select Your Skills</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
                Choose {maxSkills} skills for your {classData?.name || 'character'}.
            </p>
            <p className="text-sm text-primary-600 dark:text-primary-400 mb-8">
                Selected: {selectedSkills.length} / {maxSkills}
            </p>

            <div className="grid md:grid-cols-2 gap-3">
                {availableSkills.map(skill => {
                    const isSelected = selectedSkills.includes(skill.id);
                    const isDisabled = !isSelected && selectedSkills.length >= maxSkills;

                    return (
                        <button
                            key={skill.id}
                            onClick={() => handleToggleSkill(skill.id)}
                            disabled={isDisabled}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                : isDisabled
                                    ? 'border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 opacity-50 cursor-not-allowed'
                                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{skill.name}</h4>
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 capitalize">
                                    {skill.ability}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{skill.description}</p>
                        </button>
                    );
                })}
            </div>

            {selectedSkills.length > 0 && (
                <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                    <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">Selected Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedSkills.map(skillId => {
                            const skill = skills.find(s => s.id === skillId);
                            return (
                                <span
                                    key={skillId}
                                    className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full text-sm"
                                >
                                    {skill?.name}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

