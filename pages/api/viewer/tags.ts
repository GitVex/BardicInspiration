import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prismaClientProvider';
import { createRoute, readStringArray } from '../../../utils/api/handler';

export default createRoute(['POST'], async (req: NextApiRequest, res: NextApiResponse) => {
    // req.body.filter was read as `string[]` and immediately had .length taken off it - a request
    // with no body at all threw before reaching the database.
    const params = readStringArray(req.body?.filter, 'filter');

    // Require all selected tags on the same track, not on separate related tracks.
    const where = {
        tracks: { some: { AND: params.map(tag => ({ tags: { some: { name: tag } } })) } },
    };

    const tags = await prisma.tag.findMany({
        select: {
            name: true,
            tracks: {
                select: {
                    track_id: true,
                },
            },
        },
        where,
        orderBy: {
            tracks: {
                _count: 'desc',
            },
        },
    });

    res.status(200).json(tags.map(tag => tag.name));
});
