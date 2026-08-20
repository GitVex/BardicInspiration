// useListItems.ts
import { useRef } from 'react';
import { usePaginatedItems } from './usePaginatedItems';
import TPage from '../types/TPage';

export function useListItems(pageSize: number = 10) {
    // Pages seen so far, indexed by page number. A ref rather than a render-scoped array because
    // SWR calls the key builder many times per render and in no guaranteed order: appending to a
    // plain array grew it without bound and fed the route the same track_id over and over.
    // Writing each page into its own slot makes the accumulation idempotent.
    const pagesRef = useRef<TPage[]>([]);

    return usePaginatedItems({
        buildKey: (pageIndex, previousPageData) => {
            if (previousPageData && pageIndex > 0) {
                pagesRef.current[pageIndex - 1] = previousPageData;
            }

            // Only pages actually preceding this one may exclude rows from it
            const excludeIds = pagesRef.current
                .slice(0, pageIndex)
                .flatMap(page => page?.data.map(item => item.track_id) ?? []);

            return `/api/viewer/list?page=${pageIndex}&pageSize=${pageSize}&excludeIds=${excludeIds.toString()}`;
        },
        refreshInterval: 1000 * 60 * 10,
    });
}
