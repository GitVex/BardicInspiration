/* Look up a track by the YouTube video id currently loaded in a player. */
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prismaClientProvider';
import { createRoute, readString } from '../../../utils/api/handler';

export default createRoute(['POST'], async (req: NextApiRequest, res: NextApiResponse) => {
    const videoId = readString(req.body?.videoId, 'videoId');

    // Tracks are stored by whatever url was submitted - youtu.be/ID, watch?v=ID, embed/ID - so an
    // exact match would miss most of them. The id is 11 characters and unique to the video, which
    // makes `contains` a safe stand-in for parsing every url shape.
    const track = await prisma.track.findFirst({
        where: { url: { contains: videoId } },
        select: {
            track_id: true,
            title: true,
            color: true,
            luminance: true,
        },
    });

    res.status(200).json({ track });
});
