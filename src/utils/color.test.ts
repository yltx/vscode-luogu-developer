import { describe, it, expect } from 'vitest';
import { isColorKey, mapColorsToValues } from './color';

describe('isColorKey', () => {
  it('returns true for valid color keys', () => {
    expect(isColorKey('blue-1')).toBe(true);
    expect(isColorKey('red-3')).toBe(true);
    expect(isColorKey('grey-5')).toBe(true);
  });

  it('returns false for invalid color keys', () => {
    expect(isColorKey('blue-6')).toBe(false);
    expect(isColorKey('invalid')).toBe(false);
    expect(isColorKey('')).toBe(false);
    expect(isColorKey(123)).toBe(false);
    expect(isColorKey(null)).toBe(false);
    expect(isColorKey(undefined)).toBe(false);
  });
});

describe('mapColorsToValues', () => {
  it('returns null/undefined as-is', () => {
    expect(mapColorsToValues(null)).toBe(null);
    expect(mapColorsToValues(undefined)).toBe(undefined);
  });

  it('maps color keys to hex values in objects', () => {
    const input = { color: 'blue-3', name: 'test' };
    const result = mapColorsToValues(input);
    expect(result.color).toBe('#3498db');
    expect(result.name).toBe('test');
  });

  it('leaves non-color values unchanged', () => {
    const input = { color: 'not-a-color', name: 'test' };
    const result = mapColorsToValues(input);
    expect(result.color).toBe('not-a-color');
  });

  it('handles nested objects', () => {
    const input = {
      outer: { color: 'red-3', inner: { color: 'green-3' } }
    };
    const result = mapColorsToValues(input);
    expect(result.outer.color).toBe('#e74c3c');
    expect(result.outer.inner.color).toBe('#52c41a');
  });

  it('handles arrays', () => {
    const input = [{ color: 'blue-1' }, { color: 'red-1' }];
    const result = mapColorsToValues(input);
    expect(result[0].color).toBe('#e0f7ff');
    expect(result[1].color).toBe('#ffebe6');
  });

  it('handles primitives', () => {
    expect(mapColorsToValues(42)).toBe(42);
    expect(mapColorsToValues('hello')).toBe('hello');
  });
});
