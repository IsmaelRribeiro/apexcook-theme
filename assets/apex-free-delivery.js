/**
 * Free-delivery progress for the basket bar. Money is in integer pence.
 * @param {number} totalCents
 * @param {number} thresholdCents
 * @returns {{qualified: boolean, remainingCents: number, percent: number}}
 */
export function freeDeliveryProgress(totalCents, thresholdCents) {
  if (thresholdCents <= 0 || totalCents >= thresholdCents) {
    return { qualified: true, remainingCents: 0, percent: 100 };
  }
  const percent = Math.max(0, Math.min(100, Math.floor((totalCents / thresholdCents) * 100)));
  return { qualified: false, remainingCents: thresholdCents - totalCents, percent };
}
