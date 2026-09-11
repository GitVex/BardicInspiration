export const NEW_ITEMS_ROUTE = '/api/viewer/new';

/** Predicate mutate deliberately skips SWR Infinite entries; mutate their exact keys. */
export async function invalidateNewItems(keys: IterableIterator<string>, mutate: (key: string) => Promise<unknown>) {
    const listKeys = [...keys].filter(key => key.startsWith(`$inf$${NEW_ITEMS_ROUTE}?`));
    await Promise.all(listKeys.map(key => mutate(key)));
}
