/**
 * Video id extraction, shared between the player components and the maintenance jobs.
 *
 * Tracks are stored with whatever url was submitted - watch?v=ID, youtu.be/ID, embed/ID,
 * shorts/ID - so anything needing the bare id has to cope with every shape. The cron jobs need
 * it too, which is why this lives here rather than next to the player code.
 */
export function getVideoIdFromYoutubeUrl(url: string) {
	const regex =
		/(?:youtu\.be\/|youtube\.com(?:\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/|embed\/|v\/|m\/|watch\?(?:[^=]+=[^&]+&)*?v=))([^"&?\/\s]{11})/gm;
	const match = regex.exec(url);
	if (!match) {
		throw new Error('Invalid youtube url');
	}
	return match[1];
}

/**
 * Collapses any accepted youtube url shape down to one canonical form: the plain watch url with
 * only the id, stripping tracking/playback params like `t`, `si`, `list` or `ab_channel` that
 * don't change which video loads but multiply how many distinct urls point at the same track.
 */
export function normalizeYoutubeUrl(url: string) {
	const videoId = getVideoIdFromYoutubeUrl(url);
	return `https://www.youtube.com/watch?v=${videoId}`;
}
