/* global global */
import test from 'node:test';
import assert from 'node:assert/strict';
import { gameReducer, initialState, ActionTypes } from '../src/context/gameState.js';

test('START_GAME sets gameStarted true', () => {
    const next = gameReducer(initialState, { type: ActionTypes.START_GAME });
    assert.equal(next.gameStarted, true);
});

test('initialState has Dark Mode enabled by default', () => {
    assert.equal(initialState.settings.darkMode, true);
});

test('UPDATE_HP respects floor and ceiling', () => {
    const hurt = gameReducer(initialState, { type: ActionTypes.UPDATE_HP, amount: -999 });
    assert.equal(hurt.character.hp, 0);

    const healed = gameReducer(initialState, { type: ActionTypes.UPDATE_HP, amount: 999 });
    assert.equal(healed.character.hp, initialState.character.maxHp);
});

test('ADD_INVENTORY_ITEM increases quantity for existing item', () => {
    const next = gameReducer(initialState, {
        type: ActionTypes.ADD_INVENTORY_ITEM,
        item: { name: 'Torch', quantity: 2 }
    });

    const torch = next.inventory.find((item) => item.name === 'Torch');
    assert.equal(torch.quantity, 5);
});
