import { NextApiRequest, NextApiResponse } from 'next';
import { assertCronAuthorized, createRoute } from '../../../utils/api/handler';
import { normalizeTrackUrls } from '../../../utils/api/normalizeTrackUrls';

export default createRoute(['GET', 'POST'], async (req: NextApiRequest, res: NextApiResponse) => {
    assertCronAuthorized(req);

    // `?dryRun=1` runs the full check and reports what would change without writing anything.
    const dryRun = req.query.dryRun === '1' || req.query.dryRun === 'true';

    const summary = await normalizeTrackUrls(dryRun);

    res.status(200).json(summary);
});
