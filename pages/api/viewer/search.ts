import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prismaClientProvider';
import { createRoute, readOptionalString, readPagination } from '../../../utils/api/handler';
import TPage from '../../../components/Viewer/types/TPage';
import TItem from '../../../components/Viewer/types/TItem';

export default createRoute(['GET', 'POST'], async (req: NextApiRequest, res: NextApiResponse) => {
    const { page, pageSize, skip } = readPagination(req);
    const search = readOptionalString(req.query.search) ?? '';

    const where = {
        OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { artist: { name: { contains: search, mode: 'insensitive' as const } } },
            { tags: { some: { name: { contains: search, mode: 'insensitive' as const } } } },
        ],
    };

    // Counted against the same where-clause as the query. Counting the whole table meant
    // totalRecords/totalPages described the library rather than the search that produced them.
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
