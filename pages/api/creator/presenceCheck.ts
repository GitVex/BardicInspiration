/* query the database to check if the url is already present */
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prismaClientProvider';
import { createRoute, readString } from '../../../utils/api/handler';

export default createRoute(['POST'], async (req: NextApiRequest, res: NextApiResponse) => {
    // An undefined url used to reach Prisma as `where: { url: undefined }`, which matches the
    // first track in the table rather than nothing - the check reported "already present" for
    // every request with a malformed body.
    const url = readString(req.body?.url, 'url');

    const track = await prisma.track.findFirst({
        where: { url },
    });

    res.status(200).json({ status: Boolean(track) });
});
