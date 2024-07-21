// from a comma seperated list of strings, create a json object with each list value being the value of a 'name' key
export function seperateTags(tags: string) {
    return tags.split(',').map((tag: string) => tag.trim());
}

export function buildQuery(tags: string) {
    const qTags = seperateTags(tags);

    return qTags.map((tag: string) => {
        return {
            where: { name: tag },
            create: { name: tag },
        };
    });
}