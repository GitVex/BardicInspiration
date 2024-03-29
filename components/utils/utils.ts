export function sleep(milliseconds: number) {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}

function findExtremeIndex(array: number[], compare: (a: number, b: number) => boolean): number {
    if (array.length === 0) {
        throw new Error('Cannot find extreme index of an empty array');
    }

    let extremeIndex = 0;
    let extremeValue = array[0];

    for (let i = 1; i < array.length; i++) {
        if (compare(array[i], extremeValue)) {
            extremeValue = array[i];
            extremeIndex = i;
        }
    }

    return extremeIndex;
}

export function argMax(array: number[]): number {
    return findExtremeIndex(array, (a, b) => a > b);
}

export function argMin(array: number[]): number {
    return findExtremeIndex(array, (a, b) => a < b);
}
