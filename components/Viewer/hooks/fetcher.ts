// fetcher.ts
export const fetcher = async (url: string, body?: any) => {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    // SWR only treats a thrown error as an error. Returning res.json() unconditionally means an
    // error payload from a failed route lands in `data`, so `isError` stays undefined and the list
    // renders the error object as if it were rows.
    if (!res.ok) {
        throw new Error(`${url} failed: ${res.status} ${res.statusText}`);
    }

    return res.json();
};
