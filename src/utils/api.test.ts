import { describe, it, expect, vi } from 'vitest';

vi.mock('vscode', () => ({ default: {} }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).luogu = {
  waitinit: Promise.resolve(),
  version: '0.0.0-test',
  authProvider: {
    cookie: () => Promise.resolve(null),
    getSessions: () => Promise.resolve([]),
    removeSession: () => {},
    onDidChangeSessions: () => ({ dispose: () => {} })
  }
};

const { parseProblemID, CSRF_TOKEN_REGEX } = await import('./api');

describe('CSRF_TOKEN_REGEX', () => {
  it('extracts CSRF token from meta tag', () => {
    const html = '<meta name="csrf-token" content="abc123">';
    const match = html.match(CSRF_TOKEN_REGEX);
    expect(match).not.toBeNull();
    expect(match![1]).toBe('abc123');
  });

  it('returns null for missing token', () => {
    const html = '<meta name="other" content="abc123">';
    const match = html.match(CSRF_TOKEN_REGEX);
    expect(match).toBeNull();
  });
});

describe('parseProblemID', () => {
  it('parses P-series problem IDs', () => {
    expect(parseProblemID('P1001.cpp')).toBe('P1001');
    expect(parseProblemID('P12345.cpp')).toBe('P12345');
  });

  it('parses CF problem IDs', () => {
    expect(parseProblemID('CF1234A.cpp')).toBe('CF1234A');
    expect(parseProblemID('CF123A1.cpp')).toBe('CF123A1');
  });

  it('parses AT problem IDs', () => {
    expect(parseProblemID('AT_abc001_a.cpp')).toBe('AT_abc001_a');
  });

  it('parses SP problem IDs', () => {
    expect(parseProblemID('SP123.cpp')).toBe('SP123');
  });

  it('parses UVA problem IDs', () => {
    expect(parseProblemID('UVA123.cpp')).toBe('UVA123');
  });

  it('parses U problem IDs', () => {
    expect(parseProblemID('U123456.cpp')).toBe('U123456');
  });

  it('parses T problem IDs', () => {
    expect(parseProblemID('T123456.cpp')).toBe('T123456');
  });

  it('parses B problem IDs', () => {
    expect(parseProblemID('B1234.cpp')).toBe('B1234');
  });

  it('returns empty string for unrecognized patterns', () => {
    expect(parseProblemID('main.cpp')).toBe('');
    expect(parseProblemID('solution.py')).toBe('');
    expect(parseProblemID('test')).toBe('');
  });

  it('is case insensitive for AT and CF', () => {
    expect(parseProblemID('at_abc001.cpp')).toBe('at_abc001');
    expect(parseProblemID('cf1234a.cpp')).toBe('cf1234a');
  });
});
