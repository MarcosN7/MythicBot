import { render } from '@testing-library/react';
import { GameProvider } from '../context/GameContext';
import { BrowserRouter } from 'react-router-dom';

export function renderWithProviders(ui, { ...renderOptions } = {}) {
    function Wrapper({ children }) {
        return (
            <GameProvider>
                <BrowserRouter>
                    {children}
                </BrowserRouter>
            </GameProvider>
        );
    }
    return render(ui, { wrapper: Wrapper, ...renderOptions });
}
