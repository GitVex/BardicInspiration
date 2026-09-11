import { normalizeYoutubeUrl } from '../../../utils/youtubeUrl';

export function normalizeCreatorUrl(value: string): string | null {
    try {
        const input = value.trim();
        if (!input) return null;
        const parsed = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
        if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(parsed.hostname)) return null;
        if (!['http:', 'https:'].includes(parsed.protocol)) return null;
        return normalizeYoutubeUrl(parsed.toString());
    } catch {
        return null;
    }
}
export const validateUrl = (url: string) => normalizeCreatorUrl(url) !== null;
