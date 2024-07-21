import { prisma } from '../../../utils/prismaClientProvider';
import { checkImageAvailability } from '../creator/calculateColor';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// first get all track urls
	const allTracks = await prisma.track.findMany({
		select: {
			id: true,
			url: true,
		},
	});

	// go through each track and check if it is region blocked OR the thumbnail image is unretrievable. Use Promise.all to make it faster
	// trying to retrieve the thumbnail image of a video is appearently a good enough way to check for availability
	let blockedTracks = await Promise.all(
		allTracks.map(async (entry) => {
			const response = await fetch(
				`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${
					entry.url.split('?v=')[1]
				}&key=${process.env.YOUTUBE_API_KEY}`
			);
			const data = await response.json();

			let thumbn_blocked = false;
			try {
				await checkImageAvailability(entry.url);
			} catch (error) {
				thumbn_blocked = true;
			}

			if (data.items[0]?.contentDetails?.regionRestriction?.blocked) {
				return {
					...entry,
					...data.items[0].contentDetails.regionRestriction,
				};
			} else if (thumbn_blocked) {
				return {
					...entry,
					blocked: 'thumbnail',
				};
			} else {
				return 'valid';
			}
		})
	);

	// filter out all valid urls
	blockedTracks = blockedTracks.filter((entry) => entry !== 'valid' && entry.blocked.length > 2 && entry.blocked !== 'thumbnail');

	//test wise
	const tracksToBeDeleted = blockedTracks;

	// create new log entry to document the deletion
	await prisma.log.create({
		data: {
			time: new Date(),
			type: 'cron',
			message: `Deleted ${tracksToBeDeleted.length} entry(s)`,
			history: JSON.stringify(tracksToBeDeleted),
		},
	});

	const deletedTracks = await Promise.all(
        tracksToBeDeleted.map(async (entry) => {
            return await prisma.track.delete({
                where: {
                    id: entry.id
                }
            })
        })
    )

	res.status(200).json(deletedTracks);
}
