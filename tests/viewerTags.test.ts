import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../utils/prismaClientProvider';
import handler from '../pages/api/viewer/tags';

vi.mock('../utils/prismaClientProvider', () => ({ prisma: { tag: { findMany: vi.fn() } } }));

function response() {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    return res;
}

describe('available viewer tags', () => {
    beforeEach(() => {
        vi.mocked(prisma.tag.findMany).mockReset();
        vi.mocked(prisma.tag.findMany).mockResolvedValue([]);
    });

    it('requires all selected tags on one related track', async () => {
        const res = response();
        await handler(
            { method: 'POST', body: { filter: ['music', 'forest', 'night'] } } as NextApiRequest,
            res as unknown as NextApiResponse
        );

        // Putting AND outside tracks.some would allow different tracks to satisfy
        // each selection and suggest combinations that have no matching tracks.
        expect(prisma.tag.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    tracks: {
                        some: {
                            AND: [
                                { tags: { some: { name: 'music' } } },
                                { tags: { some: { name: 'forest' } } },
                                { tags: { some: { name: 'night' } } },
                            ],
                        },
                    },
                },
            })
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('excludes tags with no tracks even with an empty selection', async () => {
        const res = response();
        await handler({ method: 'POST', body: { filter: [] } } as NextApiRequest, res as unknown as NextApiResponse);
        expect(prisma.tag.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { tracks: { some: { AND: [] } } },
            })
        );
    });

    it('rejects malformed selections before querying tags', async () => {
        const res = response();
        await handler({ method: 'POST', body: { filter: [{}] } } as NextApiRequest, res as unknown as NextApiResponse);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(prisma.tag.findMany).not.toHaveBeenCalled();
    });
});
