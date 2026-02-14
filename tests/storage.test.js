import test from 'node:test';
import assert from 'node:assert/strict';
import { saveGameState, loadGameState, clearGameState, hasGameState } from '../src/services/storage.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

// Assign to global
global.localStorage = localStorageMock;
global.window = { localStorage: localStorageMock }; // storage.js checks window defined

test.beforeEach(() => {
    localStorage.clear();
});

test('saveGameState stores valid JSON with versioning', () => {
    const state = { character: { name: 'Test' } };
    const success = saveGameState(state);
    
    assert.equal(success, true);
    
    const stored = JSON.parse(localStorage.getItem('mythicbot_game_state'));
    assert.equal(stored.schemaVersion, 2);
    assert.deepEqual(stored.state, state);
    assert.ok(stored.savedAt);
});

test('loadGameState retrieves and parses state', () => {
    const state = { character: { name: 'Loader' } };
    saveGameState(state);
    
    const loaded = loadGameState();
    assert.deepEqual(loaded, state);
});

test('loadGameState handles invalid JSON gracefully', () => {
    localStorage.setItem('mythicbot_game_state', '{ invalid json');
    
    // Should log error but not crash, returning null
    const loaded = loadGameState();
    assert.equal(loaded, null);
    
    // Should verify it cleared the invalid state to prevent loop
    assert.equal(localStorage.getItem('mythicbot_game_state'), null);
});

test('clearGameState removes the key', () => {
    saveGameState({ test: 1 });
    assert.equal(hasGameState(), true);
    
    clearGameState();
    assert.equal(hasGameState(), false);
    assert.equal(localStorage.getItem('mythicbot_game_state'), null);
});

test('loadGameState migrates v1 to v2 schema', () => {
    // Simulate v1 state (no wrapping object, or wrapping with version 1)
    // Looking at storage.js, v1 was likely just the state object or schemaVersion < 2
    // The code says: if (isObject(parsed) && !isVersionedPayload(parsed)) -> treat as version 1
    
    const v1State = { 
        character: { name: 'Legacy' }, 
        gameStarted: true 
    };
    
    // Store as raw object (pre-versioning)
    localStorage.setItem('mythicbot_game_state', JSON.stringify(v1State));
    
    const loaded = loadGameState();
    
    // Check if migration added settings with defaults
    assert.ok(loaded.settings);
    assert.equal(loaded.settings.aiModel, 'mock');
    assert.equal(loaded.character.name, 'Legacy');
    
    // Check if it persisted the migrated version back to storage
    const stored = JSON.parse(localStorage.getItem('mythicbot_game_state'));
    assert.equal(stored.schemaVersion, 2);
});
