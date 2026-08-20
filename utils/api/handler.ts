// handler.ts - the shared plumbing every API route was previously repeating by hand.
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** An error carrying the status the client should see. Anything else becomes a 500. */
export class ApiError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Wraps a route with a method check and a catch-all.
 *
 * Without the catch-all, a malformed body or a Prisma failure rejects the handler's promise and
 * Next answers with its own opaque 500 - the client's fetcher then reports "failed" with nothing
 * to go on. Without the method check, every route answered every verb.
 */
export function createRoute(methods: HttpMethod[], handler: NextApiHandler): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        if (!methods.includes(req.method as HttpMethod)) {
            res.setHeader('Allow', methods);
            res.status(405).json({ error: `Method ${req.method} not allowed` });
            return;
        }

        try {
            await handler(req, res);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.status).json({ error: error.message });
                return;
            }

            console.error(`Unhandled error in ${req.method} ${req.url}:`, error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

// ------------------- VALUE PARSING -------------------

interface IntParamOptions {
    name: string;
    fallback: number;
    min?: number;
    max?: number;
}

/**
 * Parses a query parameter as an integer, rejecting the values parseInt quietly turns into NaN.
 * An unchecked NaN reaching Prisma's `take`/`skip` is what previously turned `?pageSize=abc` into
 * a database error rather than a 400.
 */
export function parseIntParam(
    raw: string | string[] | undefined,
    { name, fallback, min = 0, max }: IntParamOptions,
): number {
    if (raw === undefined || raw === '') return fallback;

    const value = Number(Array.isArray(raw) ? raw[0] : raw);

    if (!Number.isInteger(value)) {
        throw new ApiError(400, `${name} must be an integer`);
    }
    if (value < min) {
        throw new ApiError(400, `${name} must be at least ${min}`);
    }
    if (max !== undefined && value > max) {
        throw new ApiError(400, `${name} must be at most ${max}`);
    }

    return value;
}

/** An unbounded pageSize lets one request ask for the whole table. */
export const MAX_PAGE_SIZE = 100;

export interface Pagination {
    page: number;
    pageSize: number;
    skip: number;
}

export function readPagination(req: NextApiRequest): Pagination {
    const page = parseIntParam(req.query.page, { name: 'page', fallback: 0, min: 0 });
    const pageSize = parseIntParam(req.query.pageSize, {
        name: 'pageSize',
        fallback: 10,
        min: 1,
        max: MAX_PAGE_SIZE,
    });

    return { page, pageSize, skip: page * pageSize };
}

/** Reads a required string from a request body of unknown shape. */
export function readString(value: unknown, name: string): string {
    if (typeof value !== 'string' || !value.trim()) {
        throw new ApiError(400, `${name} is required and must be a non-empty string`);
    }
    return value;
}

/** Reads an optional string, treating anything else as absent rather than throwing. */
export function readOptionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value : undefined;
}

/**
 * Reads an array of strings, defaulting to empty. Guards the tag filters, where a body of
 * `{ filter: [{}] }` would otherwise be mapped straight into a Prisma where-clause.
 */
export function readStringArray(value: unknown, name: string): string[] {
    if (value === undefined || value === null) return [];
    if (!Array.isArray(value) || value.some(entry => typeof entry !== 'string')) {
        throw new ApiError(400, `${name} must be an array of strings`);
    }
    return value as string[];
}

/**
 * Reads a comma-separated list of integers from a query parameter, skipping empty segments.
 */
export function readIntList(raw: string | string[] | undefined, name: string): number[] {
    if (raw === undefined) return [];

    const segments = (Array.isArray(raw) ? raw : raw.split(','))
        .flatMap(entry => entry.split(','))
        .map(entry => entry.trim())
        .filter(Boolean);

    return segments.map(segment => {
        const value = Number(segment);
        if (!Number.isInteger(value)) {
            throw new ApiError(400, `${name} must be a comma-separated list of integers`);
        }
        return value;
    });
}

// ------------------- ADMIN / CRON AUTH -------------------

/**
 * Guards the maintenance routes - the jobs that walk the whole track table, spend YouTube API
 * quota per row, and rewrite or remove records. They are reachable at a guessable path, so
 * without this anyone could run them.
 *
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Fails closed: an unset CRON_SECRET
 * rejects the request rather than waving it through.
 */
export function assertCronAuthorized(req: NextApiRequest) {
    const secret = process.env.CRON_SECRET;

    if (!secret) {
        console.error('CRON_SECRET is not set - refusing to run a maintenance job');
        throw new ApiError(500, 'Cron is not configured');
    }

    if (req.headers.authorization !== `Bearer ${secret}`) {
        throw new ApiError(401, 'Unauthorized');
    }
}
