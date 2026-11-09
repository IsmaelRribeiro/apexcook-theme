import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freeDeliveryProgress } from '../theme/assets/apex-free-delivery.js';

test('below threshold', () => assert.deepEqual(freeDeliveryProgress(3800, 5000), {qualified:false, remainingCents:1200, percent:76}));
test('exactly at threshold qualifies', () => assert.deepEqual(freeDeliveryProgress(5000, 5000), {qualified:true, remainingCents:0, percent:100}));
test('above threshold clamps', () => assert.equal(freeDeliveryProgress(9000, 5000).percent, 100));
test('zero threshold always qualifies', () => assert.equal(freeDeliveryProgress(0, 0).qualified, true));
test('negative threshold always qualifies', () => assert.equal(freeDeliveryProgress(100, -5).qualified, true));
test('empty basket', () => assert.deepEqual(freeDeliveryProgress(0, 5000), {qualified:false, remainingCents:5000, percent:0}));
