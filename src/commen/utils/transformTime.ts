export function toLocalTime(utcDate: Date | string): string {
  const date = new Date(utcDate);
  return date.toLocaleString('en-EG', {
    timeZone: 'Africa/Cairo',
    hour12: false,
  });
}
// 12/2/2025, 10:16:33

export function getMinutesFromUTC(utcDate: string | Date): number {
  const date = new Date(utcDate);
  const localTime = new Date(
    date.toLocaleString('en-US', { timeZone: 'Africa/Cairo' }),
  );
  return localTime.getMinutes();
}

export function getRemainingSeconds(expiredAt: Date | string): string {
  const now = new Date();
  const expireDate = new Date(expiredAt);
  const diffMs = expireDate.getTime() - now.getTime();
  const remainingSeconds = String(Math.max(Math.floor(diffMs / 1000), 0));
  return remainingSeconds;
}
