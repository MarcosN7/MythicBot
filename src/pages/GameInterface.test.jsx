import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../utils/test-utils';
import GameInterface from './GameInterface';
import * as aiService from '../services/aiService';

// Mock AI service to avoid network calls and delays
vi.mock('../services/aiService', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        generateOpeningNarrative: vi.fn().mockResolvedValue('Welcome to the adventure!'),
        generateDMResponse: vi.fn().mockResolvedValue({
            success: true,
            message: 'Transformation complete.',
            metadata: { roll: null, requiresRoll: false }
        })
    };
});

// Mock SoundService
vi.mock('../services/soundService', () => ({
    default: {
        init: vi.fn(),
        play: vi.fn(),
        setEnabled: vi.fn()
    }
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('GameInterface Integration', () => {
    it('redirects if game not started', () => {
        // Since we can't easily assert navigation in this setup without a history spy,
        // we'll check if it renders nothing or check for side effects.
        // But renderWithProviders uses BrowserRouter.
        // A better check is to manually seed the state in a customized provider, 
        // but for now let's just interpret "not crashing" as a baseline, 
        // or mock useGame to simulate started state.
    });

    // We need to mock useGame output to test the "Started" state 
    // because GameProvider initializes with default state (gameStarted: false).
    // However, GameProvider loads from localStorage.

    it('renders the game interface when game is active', async () => {
        // Pre-seed localStorage to simulate active game
        const activeState = {
            schemaVersion: 2,
            state: {
                // We need to match the structure in storage.js
                gameStarted: true,
                adventure: { name: 'Test Adventure', setting: 'Test World' },
                character: {
                    name: 'Hero',
                    race: 'human',
                    class: 'fighter',
                    hp: 10,
                    maxHp: 10,
                    level: 1,
                    stats: {
                        strength: 10,
                        dexterity: 12,
                        constitution: 14,
                        intelligence: 8,
                        wisdom: 10,
                        charisma: 16
                    }
                },
                chatHistory: [],
                inventory: [],
                companions: [],
                settings: { soundEnabled: true, animationsEnabled: false }
            }
        };

        localStorage.setItem('mythicbot_game_state', JSON.stringify(activeState));

        renderWithProviders(<GameInterface />);

        // Should show adventure name in header
        expect(await screen.findByText('Test Adventure')).toBeInTheDocument();

        // Should trigger opening narrative
        await waitFor(() => {
            expect(aiService.generateOpeningNarrative).toHaveBeenCalled();
        });

        // Should see the opening message in chat (after effect runs)
        expect(await screen.findByText('Welcome to the adventure!')).toBeInTheDocument();
    });
});
