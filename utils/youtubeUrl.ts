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
