/* query the database to check if the url is already present */
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../utils/prismaClientProvider';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {

    const track = await prisma.track.findFirst({
        where: {
            url: req.body.url,
        },
    });

    if (track) {
        res.json({ status: true});
    } else {
        res.json({ status: false });
    }
}