import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterReviews, sortReviews, ratingSummary, paginate } from '../theme/assets/apex-reviews.js';

const r = (rating, date, size, photos = []) => ({ rating, author: 'A', title: 'T', body: 'B', date, source: 'Amazon UK', size, photos });
const fx = [r(5, '2026-01-10', '28 cm', ['x.jpg']), r(5, '2026-03-01', '24 cm'), r(4, '2026-02-01', '28 cm'), r(1, '2026-02-15', '24 cm')];

test('ratingSummary', () => assert.deepEqual(ratingSummary(fx), {average:3.8,count:4,distribution:{1:1,2:0,3:0,4:1,5:2}}));
test('ratingSummary of empty list', () => assert.deepEqual(ratingSummary([]), {average:0,count:0,distribution:{1:0,2:0,3:0,4:0,5:0}}));
test('filter by rating', () => assert.equal(filterReviews(fx,{rating:5}).length, 2));
test('filter withPhotos', () => assert.equal(filterReviews(fx,{withPhotos:true}).length, 1));
test('filter by size', () => {
  const out = filterReviews(fx,{size:'28 cm'});
  assert.equal(out.length, 2);
  assert.ok(out.every(x => x.size === '28 cm'));
});
test('empty filter returns all', () => assert.equal(filterReviews(fx,{}).length, 4));
test('sort lowest keeps negatives visible', () => assert.equal(sortReviews(fx,'lowest')[0].rating, 1));
test('sort newest', () => assert.equal(sortReviews(fx,'newest')[0].date, '2026-03-01'));
test('sort highest breaks ties by newest', () => assert.equal(sortReviews(fx,'highest')[0].date, '2026-03-01'));
test('sort does not mutate', () => { const c=[...fx]; sortReviews(fx,'highest'); assert.deepEqual(fx,c); });
test('paginate clamps page', () => assert.equal(paginate(Array(23).fill(0), 9).page, 3));
test('paginate slices', () => assert.deepEqual(paginate([1,2,3,4,5], 2, 2), {items:[3,4], page:2, totalPages:3}));
test('paginate empty', () => assert.deepEqual(paginate([], 1), {items:[], page:1, totalPages:1}));
