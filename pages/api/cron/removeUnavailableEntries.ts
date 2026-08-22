import { NextApiRequest, NextApiResponse } from 'next';
import { assertCronAuthorized, createRoute } from '../../../utils/api/handler';
import { pruneUnavailableEntries } from '../../../utils/api/pruneUnavailableEntries';

export default createRoute(['GET', 'POST'], async (req: NextApiRequest, res: NextApiResponse) => {
    assertCronAuthorized(req);

    // `?dryRun=1` runs the full check and reports the verdict without touching the table.
    const dryRun = req.query.dryRun === '1' || req.query.dryRun === 'true';

    const summary = await pruneUnavailableEntries(dryRun);

    res.status(200).json(summary);
});
