import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatInterface from './ChatInterface';

// Mock scrollToBottom since it uses refs that might not behave perfectly in JSDOM or just to avoid errors
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatInterface Component', () => {
    const mockMessages = [
        { type: 'ai', text: 'Welcome to the game!', timestamp: new Date().toISOString() },
        { type: 'user', text: 'Hello', timestamp: new Date().toISOString() }
    ];

    it('renders messages correctly', () => {
        render(
            <ChatInterface
                messages={mockMessages}
                onSendMessage={() => { }}
                isLoading={false}
            />
        );

        expect(screen.getByText('Welcome to the game!')).toBeInTheDocument();
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('allows typing and sending a message', () => {
        const handleSendMessage = vi.fn();
        render(
            <ChatInterface
                messages={[]}
                onSendMessage={handleSendMessage}
                isLoading={false}
            />
        );

        const input = screen.getByPlaceholderText('What do you do?');
        const button = screen.getByText('Send');

        fireEvent.change(input, { target: { value: 'Attack goblin' } });
        fireEvent.click(button);

        expect(handleSendMessage).toHaveBeenCalledTimes(1);
        expect(handleSendMessage).toHaveBeenCalledWith('Attack goblin');
    });

    it('disables input when loading', () => {
        render(
            <ChatInterface
                messages={[]}
                onSendMessage={() => { }}
                isLoading={true}
            />
        );

        const input = screen.getByPlaceholderText('What do you do?');
        const button = screen.getByText('Send');

        expect(input).toBeDisabled();
        expect(button.closest('button')).toBeDisabled();
    });
});
