import { prisma } from '../../../utils/prismaClientProvider';
import { buildQuery } from '../../../utils/seperateTags';
import { getAverageColor } from './calculateColor';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const { title, author_name, url, provider_url, tags, thumbnail_url } = req.body;

    const connectOrCreateQuery = buildQuery(tags);
    let track_color = '#000000';
    let luminance = 0;
    try {
        const color_data = await getAverageColor(thumbnail_url);	
        track_color = color_data.color;
        luminance = color_data.luminance;
    } catch (e) {
        console.log(`error processing ${thumbnail_url} | ${e}`);
    }

    const createTrack = await prisma.track.create({
        data: {
            title: title,
            artist: author_name,
            url: url,
            platform: provider_url,
            luminance: luminance,
            color: track_color,
            tags: {
                connectOrCreate: connectOrCreateQuery,
            },
        },
        include: {
            tags: true,
        },
    });

    /* log the creation of a new track */
    const logNewTrack = await prisma.log.create({
        data: {
            time: new Date(),
            type: 'create',
            // later: log user id
            message: `Created new track: ${title} by ${author_name}`,
            history: JSON.stringify(createTrack),
        },
    });

    res.json([createTrack, logNewTrack]);
}