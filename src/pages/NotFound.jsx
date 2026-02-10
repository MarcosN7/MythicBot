import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-6 transition-colors">
            <div className="max-w-lg w-full text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 border border-gray-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase mb-3">
                    404 Error
                </p>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
                    You wandered off the map
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    This path doesn&apos;t lead to an adventure yet. Return to camp and choose your next destination.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button onClick={() => navigate('/')} size="lg">
                        Return Home
                    </Button>
                    <Button onClick={() => navigate('/create')} variant="ghost" size="lg">
                        Create Character
                    </Button>
                </div>
            </div>
        </div>
    );
}
