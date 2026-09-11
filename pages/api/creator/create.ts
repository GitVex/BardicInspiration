import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prismaClientProvider';
import { buildQuery } from '../../../utils/separateTags';
import { getAverageColor } from './calculateColor';
import { ApiError, createRoute, readOptionalString, readString } from '../../../utils/api/handler';
import { normalizeYoutubeUrl } from '../../../utils/youtubeUrl';
import { validateCreatorTags } from '../../../utils/creatorTags';

const FALLBACK_COLOR = '#000000';

export default createRoute(['POST'], async (req: NextApiRequest, res: NextApiResponse) => {
    // The body arrives from the network and was previously cast straight to a typed shape, so a
    // missing title or author reached Prisma as undefined and failed there instead of here.
    const body = req.body ?? {};
    const title = readString(body.title, 'title');
    const author_name = readString(body.author_name, 'author_name');
    const rawUrl = readString(body.url, 'url');
    const provider_url = readString(body.provider_url, 'provider_url');

    let url: string;
    try {
        url = normalizeYoutubeUrl(rawUrl);
    } catch {
        throw new ApiError(400, 'url must be a valid youtube link');
    }
    const tags = validateCreatorTags(readString(body.tags, 'tags')).join(',');
    const thumbnail_url = readOptionalString(body.thumbnail_url);

    const connectOrCreateQuery = buildQuery(tags);

    const existing = await prisma.track.findFirst({ where: { url }, select: { track_id: true } });
    if (existing) throw new ApiError(409, 'This track is already in your library.');

    let track_color = FALLBACK_COLOR;
    let luminance = 0;
    if (thumbnail_url) {
        try {
            const color_data = await getAverageColor(thumbnail_url);
            track_color = color_data.color;
            luminance = color_data.luminance;
        } catch (e) {
            // A thumbnail that will not load is not a reason to reject the track
            console.warn(`error processing ${thumbnail_url} | ${e}`);
        }
    }

    // Separate Prisma call to handle the artist
    let artist;
    try {
        artist = await prisma.artist.upsert({
            where: { name: author_name },
            update: {},
            create: { name: author_name },
        });
    } catch (e) {
        console.error(`Error handling artist creation/upsert: ${e}`);
        throw new ApiError(500, 'Error processing artist data');
    }

    try {
        const createTrack = await prisma.track.create({
            data: {
                title,
                url,
                platform: provider_url,
                luminance,
                color: track_color,
                tags: {
                    connectOrCreate: connectOrCreateQuery,
                },
                artist: {
                    connect: { artist_id: artist.artist_id },
                },
            },
            include: {
                tags: true,
                artist: true,
            },
        });

        res.status(201).json(createTrack);
    } catch (e) {
        if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
            throw new ApiError(409, 'This track is already in your library.');
        }
        console.error(`Error creating track: ${e}`);
        throw new ApiError(500, 'Error creating track');
    }
});
