import useSWR from 'swr';
import { useFilter } from '../../Contexts/FilterStateProvider';

const fetcher = (url: string, filterState: string[]) =>
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filter: filterState }),
    }).then((res) => res.json());

function useTags() {

    const { filter } = useFilter();

    const { data, error, isLoading } = useSWR(['/api/viewer/tags', filter], () => fetcher('/api/viewer/tags', filter));

    return {
        tags: data,
        isLoading,
        isError: error,
    };
}

export default useTags;
