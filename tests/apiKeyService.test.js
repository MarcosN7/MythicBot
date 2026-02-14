import test from 'node:test';
import assert from 'node:assert/strict';
import { getApiKey, setApiKey, clearApiKey, hasApiKey } from '../src/services/apiKeyService.js';

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
global.window = { localStorage: localStorageMock };

test.beforeEach(() => {
    localStorage.clear();
});

test('setApiKey stores the key', () => {
    const key = 'AIzaSyTestKey';
    const result = setApiKey(key);
    assert.equal(result, true);
    assert.equal(localStorage.getItem('mythicbot_gemini_api_key'), key);
});

test('getApiKey retrieves the key', () => {
    const key = 'AIzaSyTestKey';
    setApiKey(key);
    assert.equal(getApiKey(), key);
});

test('getApiKey returns null if no key stored', () => {
    assert.equal(getApiKey(), null);
});

test('hasApiKey returns true when key exists', () => {
    setApiKey('test-key');
    assert.equal(hasApiKey(), true);
});

test('hasApiKey returns false when no key exists', () => {
    assert.equal(hasApiKey(), false);
});

test('clearApiKey removes the key', () => {
    setApiKey('to-be-removed');
    const result = clearApiKey();
    assert.equal(result, true);
    assert.equal(getApiKey(), null);
    assert.equal(hasApiKey(), false);
});
