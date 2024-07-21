import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../utils/prismaClientProvider";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {

    // Destructure filter and maxResults from req.body
    const { filter = [] } = req.body;

    // Generate the where clause based on the filter
    const where = filter.length > 0
        ? {
            AND: filter.map((tag: string) => ({ tags: { some: { name: tag } } })),
        }
        : {};

    // Query the database
    const result = await prisma.track.findMany({
        where: where,
        include: {
            tags: true,
        },
    });

    res.json(result);
}


