// useFilterItems.ts
import { fetcher } from './fetcher';
import { useFilter } from '../../Contexts/FilterStateProvider';
import { usePaginatedItems } from './usePaginatedItems';

export function useFilterItems(pageSize: number = 10) {
    const { filter } = useFilter();

    return usePaginatedItems({
        // The filter travels in the POST body, so it has to be part of the cache key too -
        // otherwise every filter would share one cache entry.
        buildKey: pageIndex => [`/api/viewer/filter?page=${pageIndex}&pageSize=${pageSize}`, filter],
        // SWR v2 hands the fetcher the whole key as ONE argument rather than spreading it, so the
        // url has to be destructured out. Passing the array straight to fetch() stringifies it
        // into "/api/viewer/filter?...,tagA,tagB", which is not a route that exists.
        fetchPage: ([url]: [string, string[]]) => fetcher(url, { filter }),
        refreshInterval: 1000 * 60 * 10,
    });
}
