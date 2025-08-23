const { default: dateFormat } = await import('dateformat');

export const formatDate = (time: Date | number) =>
  dateFormat(
    typeof time === 'number' ? new Date(time) : time,
    'yyyy-mm-dd HH:MM:ss'
  );

export function formatTime(time: number) {
  if (time < 1e3) return `${time}ms`;
  else if (time < 60e3) return `${(time / 1e3).toFixed(2)}s`;
  else return `${(time / 60e3).toFixed(2)}min`;
}
export function formatMemory(memory: number) {
  if (memory < 2 ** 10) return `${memory}B`;
  else if (memory < 2 ** 20) return `${(memory / 2 ** 10).toFixed(2)}KiB`;
  else if (memory < 2 ** 30) return `${(memory / 2 ** 20).toFixed(2)}MiB`;
  else return `${(memory / 2 ** 30).toFixed(2)}GiB`;
}
