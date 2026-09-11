import useSWR from 'swr';
import { useFilter } from '../../Contexts/FilterStateProvider';
async function fetcher([url, filter]: [string, string[]]): Promise<string[]> {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter }),
    });
    if (!response.ok) throw new Error('Could not load tags');
    const data: unknown = await response.json();
    if (!Array.isArray(data) || !data.every(tag => typeof tag === 'string')) throw new Error('Invalid tag response');
    return data;
}
export default function useTags(selection?: string[]) {
    const { filter } = useFilter();
    const activeFilter = selection ?? filter;
    const { data, error, isLoading, mutate } = useSWR<string[]>(['/api/viewer/tags', activeFilter], () =>
        fetcher(['/api/viewer/tags', activeFilter]),
    );
    return { tags: data, isLoading, isError: error, retry: mutate };
}
