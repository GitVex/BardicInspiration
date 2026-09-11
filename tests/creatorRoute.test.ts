import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../utils/prismaClientProvider';
import handler from '../pages/api/creator/create';

vi.mock('../utils/prismaClientProvider', () => ({
    prisma: {
        track: { findFirst: vi.fn(), create: vi.fn() },
        artist: { upsert: vi.fn() },
    },
}));
vi.mock('../pages/api/creator/calculateColor', () => ({ getAverageColor: vi.fn() }));

const body = {
    title: 'Forest',
    author_name: 'Artist',
    provider_url: 'https://www.youtube.com',
    url: 'https://youtu.be/dQw4w9WgXcQ',
    tags: 'music,forest',
};
async function request(tags = body.tags) {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    await handler({ method: 'POST', body: { ...body, tags } } as NextApiRequest, res as unknown as NextApiResponse);
    return res;
}

describe('creator submissions', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(prisma.track.findFirst).mockResolvedValue(null);
        vi.mocked(prisma.artist.upsert).mockResolvedValue({ artist_id: 1, name: 'Artist' });
        vi.mocked(prisma.track.create).mockResolvedValue({ track_id: 1 } as never);
    });

    it('rejects missing or multiple types before database writes', async () => {
        for (const tags of ['forest', 'music,ambience,forest']) {
            const res = await request(tags);
            expect(res.status).toHaveBeenCalledWith(400);
        }
        expect(prisma.artist.upsert).not.toHaveBeenCalled();
        expect(prisma.track.create).not.toHaveBeenCalled();
    });

    it('returns a useful conflict when the canonical URL already exists', async () => {
        vi.mocked(prisma.track.findFirst).mockResolvedValue({ track_id: 1 } as never);
        const res = await request();
        expect(res.status).toHaveBeenCalledWith(409);
        expect(prisma.track.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({ where: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } })
        );
        expect(prisma.track.create).not.toHaveBeenCalled();
    });

    it('stores the chosen type and descriptive tags together', async () => {
        const res = await request();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(prisma.track.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    tags: {
                        connectOrCreate: [
                            { where: { name: 'music' }, create: { name: 'music' } },
                            { where: { name: 'forest' }, create: { name: 'forest' } },
                        ],
                    },
                }),
            })
        );
    });

    it('handles a duplicate created after the initial presence check', async () => {
        vi.mocked(prisma.track.create).mockRejectedValue({ code: 'P2002' });
        const res = await request();
        expect(res.status).toHaveBeenCalledWith(409);
    });
});
