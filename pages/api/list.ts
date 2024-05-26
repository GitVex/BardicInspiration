import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "./prismaClientProvider";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    // Query the database
    const result = await prisma.track.findMany({
        include: {
            tags: true
        }
    });

    // randomize the result order
    function randomize(a: any, b: any) {
        return Math.random() - 0.5;
    }
    result.sort(randomize);

    res.status(200).json(result);
}
