import { Textarea } from '../common/Input';

const BACKGROUND_TEMPLATES = [
    { name: 'Noble', template: 'Born into a wealthy family of [Region], you were raised with privilege but yearned for adventure...' },
    { name: 'Soldier', template: 'You served in the army of [Kingdom], fighting in the great war against [Enemy]. The horrors you witnessed...' },
    { name: 'Orphan', template: 'Abandoned at a young age, you grew up on the streets of [City], learning to survive by your wits...' },
    { name: 'Scholar', template: 'Years spent in the great library of [Academy] taught you much, but a forbidden discovery forced you to flee...' },
    { name: 'Outcast', template: 'Exiled from your homeland for a crime you did not commit, you wander the world seeking to clear your name...' }
];

export default function BackgroundStory({ background, onBackgroundChange }) {
    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Background Story</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Tell us about your character's past. Where do they come from? What drives them?</p>

            <Textarea label="Your Story" placeholder="Write your character's backstory here..." value={background} onChange={(e) => onBackgroundChange(e.target.value)} rows={8} />

            <div className="mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Need inspiration? Try a template:</p>
                <div className="grid md:grid-cols-2 gap-3">
                    {BACKGROUND_TEMPLATES.map(tmpl => (
                        <button key={tmpl.name} onClick={() => onBackgroundChange(tmpl.template)} className="p-4 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-left transition-all">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{tmpl.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{tmpl.template}</p>
                        </button>
                    ))}
                </div>
            </div>

            {background && background.length > 50 && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-sm font-medium">Great backstory! ({background.length} characters)</span>
                    </div>
                </div>
            )}
        </div>
    );
}

