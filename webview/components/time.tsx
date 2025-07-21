const { default: React } = await import('react');
const { formatDate } = await import('@/utils/stringUtils');

export default function Time({ time }: { time: Date | number }) {
  if (typeof time === 'number') time = new Date(time);
  return <time dateTime={time.toISOString()}>{formatDate(time)}</time>;
}
