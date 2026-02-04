import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import LandingPage from './pages/LandingPage';
import CharacterCreator from './pages/CharacterCreator';
import AdventureSelection from './pages/AdventureSelection';
import GameInterface from './pages/GameInterface';

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

function App() {
    return (
        <GameProvider>
            <DarkModeInitializer>
                <Router basename="/MythicBot">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/create" element={<CharacterCreator />} />
                        <Route path="/adventure" element={<AdventureSelection />} />
                        <Route path="/game" element={<GameInterface />} />
                    </Routes>
                </Router>
            </DarkModeInitializer>
        </GameProvider>
    );
}

export default App;

