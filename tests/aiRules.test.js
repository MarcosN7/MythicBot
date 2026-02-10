import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeAction, getAbilityModifier, ROLL_TYPES } from '../src/services/aiService.js';

test('analyzeAction detects combat attack roll with deterministic DC', () => {
    const result = analyzeAction('I attack the goblin with my sword');
    assert.equal(result.requiresRoll, true);
    assert.equal(result.rollType, ROLL_TYPES.ATTACK_ROLL);
    assert.equal(result.actionType, 'combat');
    assert.equal(result.dc, 13);
});

test('analyzeAction detects exploration checks', () => {
    const result = analyzeAction('I inspect the dusty altar for clues');
    assert.equal(result.requiresRoll, true);
    assert.equal(result.rollType, ROLL_TYPES.ABILITY_CHECK);
    assert.equal(result.actionType, 'exploration');
    assert.equal(result.ability, 'wisdom');
});

test('analyzeAction detects social checks', () => {
    const result = analyzeAction('I try to convince the guard to let us in');
    assert.equal(result.requiresRoll, true);
    assert.equal(result.rollType, ROLL_TYPES.ABILITY_CHECK);
    assert.equal(result.actionType, 'interaction');
    assert.equal(result.ability, 'charisma');
});

test('getAbilityModifier calculates expected values', () => {
    assert.equal(getAbilityModifier(8), -1);
    assert.equal(getAbilityModifier(10), 0);
    assert.equal(getAbilityModifier(18), 4);
});
