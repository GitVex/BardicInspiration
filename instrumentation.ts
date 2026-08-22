/*
 * Runs once when the server process boots (see experimental.instrumentationHook in
 * next.config.mjs) - the one place a schedule can be registered without re-registering it on
 * every request. This is what actually triggers the nightly prune now; vercel.json's cron
 * entry is dead config left over from before this app moved to a self-hosted Docker deploy.
 */
export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;

    // The dev and prod containers both set NODE_ENV=production (see Dockerfile) and each points
    // at its own real database - this only needs to skip a bare local `npm run dev`, which would
    // otherwise silently start pruning against whatever database .env.local points at.
    if (process.env.NODE_ENV !== 'production') return;

    // Imported dynamically, and only here: webpack still statically traces a bare dynamic
    // import() into Next's edge-runtime build of this file, and node-cron depends on Node
    // builtins (`path`) that bundle doesn't have. `webpackIgnore` makes it a real runtime-only
    // import for this one - it's a plain package in node_modules Node can resolve on its own.
    // The relative import below stays a normal dynamic import so webpack still transpiles and
    // bundles our own TS source (and everything it pulls in, like the Prisma client) for the
    // nodejs build, the same way it would for any other server-side code.
    const { default: cron } = await import(/* webpackIgnore: true */ 'node-cron');
    const { pruneUnavailableEntries } = await import('./utils/api/pruneUnavailableEntries');

    cron.schedule('0 1 * * *', async () => {
        try {
            const summary = await pruneUnavailableEntries(false);
            console.log(`[cron] pruned ${summary.deleted} unavailable track(s)`, summary);
        } catch (error) {
            console.error('[cron] prune run failed', error);
        }
    });

    console.log('[cron] scheduled nightly unavailable-track prune for 01:00 UTC');
}
