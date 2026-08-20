// useNewItems.ts
import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { usePaginatedItems } from './usePaginatedItems';

export const NEW_ITEMS_ROUTE = '/api/viewer/new';

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
 * The matcher runs against the live cache when called, and `includes` catches both the individual
 * page keys and the `$inf$`-prefixed key that useSWRInfinite stores the list itself under - the
 * latter being the one that actually drives the refetch.
 */
export function useInvalidateNewItems() {
    const { mutate } = useSWRConfig();

    return useCallback(
        () => mutate(key => typeof key === 'string' && key.includes(NEW_ITEMS_ROUTE)),
        [mutate],
    );
}
