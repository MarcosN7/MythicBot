import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import LandingPage from './pages/LandingPage';
import CharacterCreator from './pages/CharacterCreator';
import AdventureSelection from './pages/AdventureSelection';
import GameInterface from './pages/GameInterface';
import NotFound from './pages/NotFound';

const normalizeBasePath = (value) => {
    if (!value || value === '/') return '';
    return value.endsWith('/') ? value.slice(0, -1) : value;
};

const routerBaseName = normalizeBasePath(import.meta.env.VITE_ROUTER_BASENAME || import.meta.env.BASE_URL);

// Component to initialize dark mode based on saved settings
function DarkModeInitializer({ children }) {
    const { state } = useGame();

    useEffect(() => {
        if (state.settings.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [state.settings.darkMode]);

    return children;
}

function AdventureRoute() {
    const { state } = useGame();
    const hasCharacterBasics = Boolean(state.character.race && state.character.class);

    if (!hasCharacterBasics) {
        return <Navigate to="/create" replace />;
    }

    return <AdventureSelection />;
}

function GameRoute() {
    const { state } = useGame();

    if (!state.gameStarted || !state.adventure) {
        return <Navigate to="/adventure" replace />;
    }

    return <GameInterface />;
}

function App() {
    return (
        <GameProvider>
            <DarkModeInitializer>
                <Router basename={routerBaseName}>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/create" element={<CharacterCreator />} />
                        <Route path="/adventure" element={<AdventureRoute />} />
                        <Route path="/game" element={<GameRoute />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Router>
            </DarkModeInitializer>
        </GameProvider>
    );
}

export default App;
