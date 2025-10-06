const { default: React } = await import('react');
const { formatDate } = await import('@/utils/stringUtils');

export default function Time({
  time,
  withoutSecond
}: {
  time: Date | number;
  withoutSecond?: boolean;
}) {
  if (typeof time === 'number') time = new Date(time);
  return (
    <time dateTime={time.toISOString()}>
      {formatDate(time, !withoutSecond)}
    </time>
  );
}
