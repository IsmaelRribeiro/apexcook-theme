import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bundleTotal, cartAddItems } from '../theme/assets/apex-bundle.js';

test('bundleTotal sums selected available addons', () =>
  assert.equal(bundleTotal(24950, [{priceCents:1500,selected:true,available:true},{priceCents:900,selected:false,available:true}]), 26450));
test('bundleTotal ignores selected but unavailable addons', () =>
  assert.equal(bundleTotal(24950, [{priceCents:1500,selected:true,available:false}]), 24950));
test('cartAddItems puts main first, addons qty 1', () =>
  assert.deepEqual(cartAddItems({variantId:1,quantity:2},[{variantId:7,selected:true,available:true}]), {items:[{id:1,quantity:2},{id:7,quantity:1}]}));
test('cartAddItems ignores unavailable addons', () =>
  assert.deepEqual(cartAddItems({variantId:1,quantity:1},[{variantId:7,selected:true,available:false}]).items, [{id:1,quantity:1}]));
test('cartAddItems ignores unselected addons', () =>
  assert.deepEqual(cartAddItems({variantId:1,quantity:1},[{variantId:7,selected:false,available:true}]).items, [{id:1,quantity:1}]));
test('cartAddItems dedupes addon ids', () =>
  assert.equal(cartAddItems({variantId:1,quantity:1},[{variantId:7,selected:true,available:true},{variantId:7,selected:true,available:true}]).items.length, 2));

import { submitState } from '../theme/assets/apex-bundle.js';
test('submitState: available and idle can add', () =>
  assert.deepEqual(submitState({ available: true, busy: false }), { disabled: false, label: 'add' }));
test('submitState: sold out is disabled', () =>
  assert.deepEqual(submitState({ available: false, busy: false }), { disabled: true, label: 'soldOut' }));
test('submitState: busy (adding or navigating to basket) stays disabled', () =>
  assert.deepEqual(submitState({ available: true, busy: true }), { disabled: true, label: 'adding' }));
