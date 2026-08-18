// useNewItems.ts
import { useCallback } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useSWRConfig } from 'swr';
import { fetcher } from './fetcher';
import TPage from '../types/TPage';

export const NEW_ITEMS_ROUTE = '/api/viewer/new';

export function useNewItems(pageSize: number = 10) {
    const getKey = (pageIndex: number, previousPageData: TPage | null) => {
        if (previousPageData && !previousPageData.data.length) return null;
        return `${NEW_ITEMS_ROUTE}?page=${pageIndex}&pageSize=${pageSize}`;
    };

    const { data, error, size, setSize } = useSWRInfinite<TPage, Error>(getKey, fetcher, {
        revalidateOnFocus: false,
        // A new track is ordered to the top, which shifts every following row by one. Revalidating
        // only the first page would leave the item straddling the page boundary duplicated.
        revalidateAll: true,
        refreshInterval: 1000 * 60 * 2,
    });

    const items = data ? data.flatMap(page => page.data) : [];
    const isLoadingMore = data && typeof data[size - 1] === 'undefined';

    return { items, isError: error, isLoading: !error && !data, isLoadingMore, setSize, size };
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
