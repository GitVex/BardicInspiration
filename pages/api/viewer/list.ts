import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prismaClientProvider';
import { createRoute, readIntList, readPagination } from '../../../utils/api/handler';
import TPage from '../../../components/Viewer/types/TPage';
import TItem from '../../../components/Viewer/types/TItem';

export default createRoute(['GET', 'POST'], async (req: NextApiRequest, res: NextApiResponse) => {
    const { page, pageSize, skip } = readPagination(req);
    const excludeIds = readIntList(req.query.excludeIds, 'excludeIds');

    const where = { track_id: { notIn: excludeIds } };

    const [result, totalRecords] = await Promise.all([
        prisma.track.findMany({
            where,
            orderBy: {
                created_at: 'desc',
            },
            include: {
                tags: true,
                artist: true,
            },
            skip,
            take: pageSize,
        }),
        prisma.track.count({ where }),
    ]);

    // TODO: this shuffles only the rows already selected for this page, so the "random" list is
    // really a stable created_at ordering with each page's contents jumbled. Producing a genuinely
    // random ordering needs a seeded ORDER BY in SQL, not a post-hoc sort.
    const shuffled = shuffle(result as TItem[]);

    const pageObj: TPage = {
        data: shuffled,
        pagination: {
            totalRecords,
            totalPages: Math.ceil(totalRecords / pageSize),
            currentPage: page,
            pageSize,
        },
    };

    res.status(200).json(pageObj);
});

/**
 * Fisher-Yates. `sort(() => Math.random() - 0.5)` is not a shuffle - the comparator is
 * inconsistent, so the permutation it produces is heavily biased toward the original order.
 */
function shuffle<T>(items: T[]): T[] {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}
