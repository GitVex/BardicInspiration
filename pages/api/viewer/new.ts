import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prismaClientProvider';
import { createRoute, readPagination } from '../../../utils/api/handler';
import TPage from '../../../components/Viewer/types/TPage';
import TItem from '../../../components/Viewer/types/TItem';

// POST as well as GET: the Viewer's shared fetcher posts to every list route.
export default createRoute(['GET', 'POST'], async (req: NextApiRequest, res: NextApiResponse) => {
    const { page, pageSize, skip } = readPagination(req);

    const [result, totalRecords] = await Promise.all([
        prisma.track.findMany({
            skip,
            take: pageSize,
            orderBy: {
                created_at: 'desc',
            },
            include: {
                tags: true,
                artist: true,
            },
        }),
        prisma.track.count(),
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
