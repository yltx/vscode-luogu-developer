import { describe, it, expect, vi } from 'vitest';

vi.mock('vscode', () => ({ default: {} }));
vi.mock('./api', () => ({ getCaptcha: vi.fn(), parseProblemID: () => '' }));

const { cookieString, praseCookie, getUserSvg, getArticleCategory } =
  await import('./workspaceUtils');

describe('cookieString', () => {
  it('formats cookie from uid and clientID', () => {
    expect(cookieString({ uid: 12345, clientID: 'abc' })).toBe(
      '_uid=12345;__client_id=abc'
    );
  });

  it('handles numeric clientID', () => {
    expect(cookieString({ uid: 1, clientID: '0' })).toBe(
      '_uid=1;__client_id=0'
    );
  });
});

describe('praseCookie', () => {
  it('returns empty object for undefined', () => {
    expect(praseCookie(undefined)).toEqual({});
  });

  it('returns empty object for empty array', () => {
    expect(praseCookie([])).toEqual({});
  });

  it('parses uid from cookie', () => {
    const result = praseCookie(['_uid=12345; path=/']);
    expect(result.uid).toBe(12345);
  });

  it('parses clientID from cookie', () => {
    const result = praseCookie(['__client_id=abcdef; path=/']);
    expect(result.clientID).toBe('abcdef');
  });

  it('parses both uid and clientID', () => {
    const result = praseCookie(['_uid=42; path=/', '__client_id=xyz; path=/']);
    expect(result.uid).toBe(42);
    expect(result.clientID).toBe('xyz');
  });
});

describe('getUserSvg', () => {
  it('returns empty string for ccfLevel 0', () => {
    expect(getUserSvg(0)).toBe('');
  });

  it('returns green svg for levels 3-5', () => {
    const svg = getUserSvg(3);
    expect(svg).toContain('#52c41a');
    expect(svg).toContain('<svg');
  });

  it('returns blue svg for levels 6-7', () => {
    const svg = getUserSvg(6);
    expect(svg).toContain('#3498db');
  });

  it('returns gold svg for levels 8+', () => {
    const svg = getUserSvg(8);
    expect(svg).toContain('#ffc116');
  });
});

describe('getArticleCategory', () => {
  it('returns correct category names', () => {
    expect(getArticleCategory(1)).toBe('个人记录');
    expect(getArticleCategory(2)).toBe('题解');
    expect(getArticleCategory(3)).toBe('科技·工程');
  });
});
