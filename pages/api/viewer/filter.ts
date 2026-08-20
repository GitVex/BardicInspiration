import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prismaClientProvider';
import { createRoute, readPagination, readStringArray } from '../../../utils/api/handler';
import TPage from '../../../components/Viewer/types/TPage';
import TItem from '../../../components/Viewer/types/TItem';

export default createRoute(['POST'], async (req: NextApiRequest, res: NextApiResponse) => {
    const { page, pageSize, skip } = readPagination(req);
    // Validated rather than trusted: this array is mapped straight into a Prisma where-clause,
    // and a body of { filter: [{}] } used to reach the database as a malformed query.
    const filter = readStringArray(req.body?.filter, 'filter');

    const where = filter.length > 0
        ? { AND: filter.map(tag => ({ tags: { some: { name: tag } } })) }
        : {};

    const [result, totalRecords] = await Promise.all([
        prisma.track.findMany({
            skip,
            take: pageSize,
            where,
            include: {
                tags: true,
                artist: true,
            },
        }),
        prisma.track.count({ where }),
    ]);

    const pageObj: TPage = {
        data: result as TItem[],
        pagination: {
            totalRecords,
            totalPages: Math.ceil(totalRecords / pageSize),
            currentPage: page,
            pageSize,
        },
    };

    res.status(200).json(pageObj);
});
