// useNewItems.ts
import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { usePaginatedItems } from './usePaginatedItems';
import { invalidateNewItems, NEW_ITEMS_ROUTE } from './invalidateNewItems';
export { NEW_ITEMS_ROUTE } from './invalidateNewItems';

export function useNewItems(pageSize: number = 10) {
    return usePaginatedItems({
        buildKey: pageIndex => `${NEW_ITEMS_ROUTE}?page=${pageIndex}&pageSize=${pageSize}`,
        // A new track is ordered to the top, which shifts every following row by one. Revalidating
        // only the first page would leave the item straddling the page boundary duplicated.
        revalidateAll: true,
        refreshInterval: 1000 * 60 * 2,
    });
}

/**
 * Revalidates every cached page of the new-items list, for use after creating a track.
 *
 * Use exact infinite-list keys from this provider's cache. Predicate-based mutate
 * skips those keys, and individual page entries do not drive the rendered list.
 * useNewItems enables revalidateAll so every loaded page refreshes together.
 */
export function useInvalidateNewItems() {
    const { cache, mutate } = useSWRConfig();

    return useCallback(() => invalidateNewItems(cache.keys(), key => mutate(key)), [cache, mutate]);
}
