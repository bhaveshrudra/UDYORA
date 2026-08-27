export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹ 0';
  return '₹' + amount.toLocaleString('en-IN');
}

export function formatDistance(distanceKm: number): string {
  if (isNaN(distanceKm)) return 'N/A';
  return `${distanceKm.toFixed(1)} km`;
}

export function formatScore(score: number): string {
  return `${Math.round(score)}/100`;
}
