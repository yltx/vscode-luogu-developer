import { describe, it, expect } from 'vitest';
import { formatTime, formatMemory } from './stringUtils';

describe('formatTime', () => {
  it('formats milliseconds', () => {
    expect(formatTime(500)).toBe('500ms');
    expect(formatTime(0)).toBe('0ms');
    expect(formatTime(999)).toBe('999ms');
  });

  it('formats seconds', () => {
    expect(formatTime(1000)).toBe('1.00s');
    expect(formatTime(1500)).toBe('1.50s');
    expect(formatTime(59999)).toBe('60.00s');
  });

  it('formats minutes', () => {
    expect(formatTime(60000)).toBe('1.00min');
    expect(formatTime(90000)).toBe('1.50min');
    expect(formatTime(3599999)).toBe('60.00min');
  });

  it('formats hours', () => {
    expect(formatTime(3600000)).toBe('1.00h');
    expect(formatTime(5400000)).toBe('1.50h');
    expect(formatTime(86399999)).toBe('24.00h');
  });

  it('formats days', () => {
    expect(formatTime(86400000)).toBe('1.00d');
    expect(formatTime(172800000)).toBe('2.00d');
  });
});

describe('formatMemory', () => {
  it('formats bytes', () => {
    expect(formatMemory(0)).toBe('0B');
    expect(formatMemory(512)).toBe('512B');
    expect(formatMemory(1023)).toBe('1023B');
  });

  it('formats KiB', () => {
    expect(formatMemory(1024)).toBe('1.00KiB');
    expect(formatMemory(1536)).toBe('1.50KiB');
    expect(formatMemory(1048575)).toBe('1024.00KiB');
  });

  it('formats MiB', () => {
    expect(formatMemory(1048576)).toBe('1.00MiB');
    expect(formatMemory(1572864)).toBe('1.50MiB');
    expect(formatMemory(1073741823)).toBe('1024.00MiB');
  });

  it('formats GiB', () => {
    expect(formatMemory(1073741824)).toBe('1.00GiB');
    expect(formatMemory(2147483648)).toBe('2.00GiB');
  });
});
