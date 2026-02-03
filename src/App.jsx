import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import LandingPage from './pages/LandingPage';
import CharacterCreator from './pages/CharacterCreator';
import AdventureSelection from './pages/AdventureSelection';
import GameInterface from './pages/GameInterface';

function App() {
    return (
        <GameProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/create" element={<CharacterCreator />} />
                    <Route path="/adventure" element={<AdventureSelection />} />
                    <Route path="/game" element={<GameInterface />} />
                </Routes>
            </Router>
        </GameProvider>
    );
}

export default App;
