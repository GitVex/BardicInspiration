import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prismaClientProvider';

export default async function handle(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const params = req.body.filter as string[];

	const where =
		params.length > 0
			? {
					AND: params.map((tag: string) => {
						return {
							tracks: { some: { tags: { some: { name: tag } } } },
						};
					}),
			  }
			: {};

	const tags = await prisma.tag.findMany({
		select: {
			name: true,
			tracks: {
				select: {
					id: true,
				},
			},
		},
		where: where,
		orderBy: {
			tracks: {
				_count: 'desc',
			},
		},
	});
    const tagNames = tags.map(tag => tag.name) as string[];

	res.json(tagNames);
}
