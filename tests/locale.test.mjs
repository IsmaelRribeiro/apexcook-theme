import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const strip = (raw) => raw.replace(/\/\*[\s\S]*?\*\//, '').replace(/^\s*\/\/.*$/gm, '');
const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, String(v)]]
  );
const values = flatten(JSON.parse(strip(readFileSync('theme/locales/en.default.json', 'utf8'))));

test('no visible "cart" wording', () =>
  assert.deepEqual(values.filter(([, v]) => /\bcarts?\b/i.test(v)).map(([k]) => k), []));
test('no US spelling of colour', () =>
  assert.deepEqual(values.filter(([, v]) => /\bcolors?\b/i.test(v)).map(([k]) => k), []));
test('apex namespace present', () => {
  const m = Object.fromEntries(values);
  assert.equal(m['apex.buy_box.add_to_basket'], 'Add to basket');
  assert.equal(m['apex.buy_box.vat_inclusive'], 'VAT inclusive');
  assert.equal(m['apex.card.choose_size'], 'Choose size');
});
