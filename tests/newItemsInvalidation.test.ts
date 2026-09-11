import { afterEach, describe, expect, it, vi } from 'vitest';
import { mutate, SWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';
import { invalidateNewItems, NEW_ITEMS_ROUTE } from '../components/Viewer/hooks/invalidateNewItems';

const cache = SWRConfig.defaultValue.cache;
const pageKey = `${NEW_ITEMS_ROUTE}?page=0&pageSize=30`;
const listKey = unstable_serialize(index => `${NEW_ITEMS_ROUTE}?page=${index}&pageSize=30`);

afterEach(() => {
    cache.delete(pageKey);
    cache.delete(listKey);
});

describe('new-items cache invalidation', () => {
    it('targets the infinite entry that SWR predicate mutation skips', async () => {
        // SWR stores the original key alongside the public cache state.
        const pageState = { data: 'old page', _k: pageKey };
        const listState = { data: ['old list'], _k: listKey };
        cache.set(pageKey, pageState);
        cache.set(listKey, listState);
        await mutate(key => typeof key === 'string' && key.includes(NEW_ITEMS_ROUTE), 'changed', { revalidate: false });
        expect(cache.get(pageKey)?.data).toBe('changed');
        expect(cache.get(listKey)?.data).toEqual(['old list']);

        await invalidateNewItems(cache.keys(), key => mutate(key, ['refreshed list'], { revalidate: false }));
        expect(cache.get(listKey)?.data).toEqual(['refreshed list']);
    });

    it('refreshes every cached page-size variant and leaves unrelated lists alone', async () => {
        const otherSize = unstable_serialize(index => `${NEW_ITEMS_ROUTE}?page=${index}&pageSize=10`);
        const keys = new Map([
            [pageKey, {}],
            [listKey, {}],
            [otherSize, {}],
            [unstable_serialize(index => `/api/viewer/filter?page=${index}`), {}],
            ['/api/viewer/tags', {}],
        ]);
        const revalidate = vi.fn().mockResolvedValue(undefined);
        await invalidateNewItems(keys.keys(), revalidate);
        expect(revalidate.mock.calls).toEqual([[listKey], [otherSize]]);
    });
});
