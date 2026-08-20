// useSearchItems.ts
import { usePaginatedItems } from './usePaginatedItems';

export function useSearchItems(search: string, pageSize: number = 10) {
    return usePaginatedItems({
        buildKey: pageIndex =>
            // encodeURIComponent, because a search containing & or # would otherwise truncate the
            // term and silently corrupt the following query parameters
            `/api/viewer/search?search=${encodeURIComponent(search)}&page=${pageIndex}&pageSize=${pageSize}`,
        refreshInterval: 1000 * 60 * 10,
    });
}
