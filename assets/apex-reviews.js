/**
 * Pure helpers for the reviews section.
 * @typedef {{rating: number, author: string, title: string, body: string, date: string, source: string, size: string|null, photos: string[]}} Review
 */

/**
 * @param {Review[]} reviews
 * @param {{rating?: number, size?: string, withPhotos?: boolean}} f
 * @returns {Review[]}
 */
export function filterReviews(reviews, f) {
  return reviews.filter(
    (r) =>
      (!f.rating || r.rating === f.rating) &&
      (!f.size || r.size === f.size) &&
      (!f.withPhotos || (r.photos && r.photos.length > 0))
  );
}

/** @param {Review} a @param {Review} b */
const newestFirst = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

/**
 * @param {Review[]} reviews
 * @param {'newest'|'highest'|'lowest'} mode
 * @returns {Review[]}
 */
export function sortReviews(reviews, mode) {
  const out = [...reviews];
  if (mode === 'highest') return out.sort((a, b) => b.rating - a.rating || newestFirst(a, b));
  if (mode === 'lowest') return out.sort((a, b) => a.rating - b.rating || newestFirst(a, b));
  return out.sort(newestFirst);
}

/**
 * @param {Review[]} reviews
 * @returns {{average: number, count: number, distribution: Record<1|2|3|4|5, number>}}
 */
export function ratingSummary(reviews) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    distribution[/** @type {1|2|3|4|5} */ (r.rating)] += 1;
    sum += r.rating;
  }
  const count = reviews.length;
  const average = count ? Math.round((sum / count) * 10) / 10 : 0;
  return { average, count, distribution };
}

/**
 * @template T
 * @param {T[]} items
 * @param {number} page
 * @param {number} [perPage]
 * @returns {{items: T[], page: number, totalPages: number}}
 */
export function paginate(items, page, perPage = 10) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (current - 1) * perPage;
  return { items: items.slice(start, start + perPage), page: current, totalPages };
}
