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
        // The routes answer failures with { error }, which says far more than the status text
        const detail = await res.json().then(payload => payload?.error).catch(() => undefined);
        throw new Error(`${url} failed: ${res.status} ${detail ?? res.statusText}`);
    }

    return res.json();
};
