// usePaginatedItems.ts
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite';
import { fetcher } from './fetcher';
import TPage from '../types/TPage';
import TItem from '../types/TItem';

/**
 * The shape every list hook returns, and the shape ItemsList renders.
 */
export interface PaginatedItems {
    items: TItem[];
    isError: Error | undefined;
    isLoading: boolean;
    isLoadingMore: boolean;
    setSize: (size: number | ((_size: number) => number)) => Promise<TPage[] | undefined>;
    size: number;
}

/** What useSWRInfinite accepts as a page key. */
export type PageKey = string | readonly unknown[] | null;

interface UsePaginatedItemsArgs extends SWRInfiniteConfiguration<TPage, Error> {
    /**
     * Builds the SWR key for a page. The "stop when the previous page came back empty" guard is
     * applied by this hook, so buildKey only has to describe the request.
     */
    buildKey: (pageIndex: number, previousPageData: TPage | null) => PageKey;
    /**
     * Defaults to the shared POST fetcher. SWR v2 hands the fetcher the whole key as a single
     * argument, so an override for an array key has to destructure it.
     */
    fetchPage?: (key: any) => Promise<TPage>;
}

/**
 * The paging half of every list in the Viewer. The four lists differ only in the URL they build
 * and how eagerly they revalidate; everything below was previously copied per hook.
 */
export function usePaginatedItems({
    buildKey,
    fetchPage = fetcher,
    ...options
}: UsePaginatedItemsArgs): PaginatedItems {
    const getKey = (pageIndex: number, previousPageData: TPage | null): PageKey => {
        // An empty page means the list is exhausted - returning null stops SWR asking for more.
        if (previousPageData && !previousPageData.data.length) return null;
        return buildKey(pageIndex, previousPageData);
    };

    const { data, error, size, setSize } = useSWRInfinite<TPage, Error>(getKey, fetchPage, {
        revalidateOnFocus: false,
        ...options,
    });

    return {
        items: data ? data.flatMap(page => page.data) : [],
        isError: error,
        isLoading: !error && !data,
        // data[size - 1] is undefined while the page it will hold is still in flight
        isLoadingMore: Boolean(data) && typeof data?.[size - 1] === 'undefined',
        setSize,
        size,
    };
}
