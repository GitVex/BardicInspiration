export const trackTypes = ['music', 'ambience', 'standalone'] as const;
export function isTrackType(tag: string): boolean {
    return trackTypes.some(type => type === tag);
}
export function selectTrackType(filter: string[], type: string): string[] {
    const tags = filter.filter(tag => !isTrackType(tag));
    return isTrackType(type) ? [type, ...tags] : tags;
}
