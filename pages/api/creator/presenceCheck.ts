/* query the database to check if the url is already present */
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prismaClientProvider';
import { createRoute, readString } from '../../../utils/api/handler';
import { normalizeYoutubeUrl } from '../../../utils/youtubeUrl';

export default createRoute(['POST'], async (req: NextApiRequest, res: NextApiResponse) => {
    // An undefined url used to reach Prisma as `where: { url: undefined }`, which matches the
    // first track in the table rather than nothing - the check reported "already present" for
    // every request with a malformed body.
    const rawUrl = readString(req.body?.url, 'url');

    // Stored urls are normalized, so a match must compare against the same canonical form -
    // otherwise a re-pasted watch?v= link would miss a duplicate saved as youtu.be/, or vice versa.
    let url: string;
    try {
        url = normalizeYoutubeUrl(rawUrl);
    } catch {
        res.status(200).json({ status: false });
        return;
    }

    const track = await prisma.track.findFirst({
        where: { url },
    });

    res.status(200).json({ status: Boolean(track) });
});
