import { describe, expect, it } from 'vitest';
import type { NextApiRequest } from 'next';
import {
    ApiError,
    assertCronAuthorized,
    MAX_PAGE_SIZE,
    parseIntParam,
    readIntList,
    readPagination,
    readString,
    readStringArray,
} from '../utils/api/handler';

const req = (query: Record<string, any>) => ({ query } as unknown as NextApiRequest);

describe('parseIntParam', () => {
    it('falls back when the parameter is absent or empty', () => {
        expect(parseIntParam(undefined, { name: 'page', fallback: 7 })).toBe(7);
        expect(parseIntParam('', { name: 'page', fallback: 7 })).toBe(7);
    });

    it('rejects non-numeric input instead of yielding NaN', () => {
        // parseInt('abc') is NaN, and NaN reaching Prisma's take/skip is a database error
        expect(() => parseIntParam('abc', { name: 'pageSize', fallback: 10 })).toThrow(ApiError);
    });

    it('rejects a non-integer', () => {
        expect(() => parseIntParam('1.5', { name: 'page', fallback: 0 })).toThrow(ApiError);
    });

    it('enforces min and max', () => {
        expect(() => parseIntParam('-1', { name: 'page', fallback: 0, min: 0 })).toThrow(ApiError);
        expect(() => parseIntParam('11', { name: 'page', fallback: 0, max: 10 })).toThrow(ApiError);
    });

    it('reports a 400, not a 500', () => {
        try {
            parseIntParam('abc', { name: 'page', fallback: 0 });
            expect.unreachable();
        } catch (error) {
            expect((error as ApiError).status).toBe(400);
        }
    });
});

describe('readPagination', () => {
    it('derives skip from page and pageSize', () => {
        expect(readPagination(req({ page: '3', pageSize: '30' }))).toEqual({
            page: 3,
            pageSize: 30,
            skip: 90,
        });
    });

    it('caps pageSize so one request cannot ask for the whole table', () => {
        expect(() => readPagination(req({ pageSize: String(MAX_PAGE_SIZE + 1) }))).toThrow(ApiError);
    });

    it('rejects a zero pageSize', () => {
        expect(() => readPagination(req({ pageSize: '0' }))).toThrow(ApiError);
    });
});

describe('readStringArray', () => {
    it('defaults to empty', () => {
        expect(readStringArray(undefined, 'filter')).toEqual([]);
    });

    it('accepts an array of strings', () => {
        expect(readStringArray(['tavern'], 'filter')).toEqual(['tavern']);
    });

    it('rejects an array containing anything else', () => {
        // { filter: [{}] } used to be mapped straight into a Prisma where-clause
        expect(() => readStringArray([{}], 'filter')).toThrow(ApiError);
        expect(() => readStringArray('tavern', 'filter')).toThrow(ApiError);
    });
});

describe('readString', () => {
    it('rejects undefined and whitespace', () => {
        expect(() => readString(undefined, 'url')).toThrow(ApiError);
        expect(() => readString('   ', 'url')).toThrow(ApiError);
    });

    it('accepts a real value', () => {
        expect(readString('https://youtu.be/x', 'url')).toBe('https://youtu.be/x');
    });
});

describe('readIntList', () => {
    it('parses a comma separated list', () => {
        expect(readIntList('1,2,3', 'excludeIds')).toEqual([1, 2, 3]);
    });

    it('ignores empty segments, including a trailing comma', () => {
        expect(readIntList('1,,2,', 'excludeIds')).toEqual([1, 2]);
    });

    it('returns empty for an absent or empty parameter', () => {
        expect(readIntList(undefined, 'excludeIds')).toEqual([]);
        expect(readIntList('', 'excludeIds')).toEqual([]);
    });

    it('rejects a non-numeric entry', () => {
        expect(() => readIntList('1,abc', 'excludeIds')).toThrow(ApiError);
    });
});

describe('assertCronAuthorized', () => {
    const withSecret = (secret: string | undefined, fn: () => void) => {
        const previous = process.env.CRON_SECRET;
        if (secret === undefined) delete process.env.CRON_SECRET;
        else process.env.CRON_SECRET = secret;

        try {
            fn();
        } finally {
            if (previous === undefined) delete process.env.CRON_SECRET;
            else process.env.CRON_SECRET = previous;
        }
    };

    const authed = (authorization?: string) =>
        ({ headers: authorization ? { authorization } : {} } as unknown as NextApiRequest);

    it('fails closed when CRON_SECRET is unset', () => {
        // The important case: a missing secret must not mean "no auth required"
        withSecret(undefined, () => {
            expect(() => assertCronAuthorized(authed('Bearer anything'))).toThrow(ApiError);
        });
    });

    it('rejects a missing or wrong bearer token with a 401', () => {
        withSecret('s3cret', () => {
            for (const header of [undefined, 'Bearer wrong', 's3cret']) {
                try {
                    assertCronAuthorized(authed(header));
                    expect.unreachable();
                } catch (error) {
                    expect((error as ApiError).status).toBe(401);
                }
            }
        });
    });

    it('accepts the matching bearer token', () => {
        withSecret('s3cret', () => {
            expect(() => assertCronAuthorized(authed('Bearer s3cret'))).not.toThrow();
        });
    });
});
