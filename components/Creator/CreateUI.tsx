import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { useVideoInfo } from './hooks/useVideoInfo';
import { useTags } from './hooks/useTags';
import useFormSubmit from './hooks/useFormSubmit';
import useAvailableTags from '../Filter/hooks/useTags';
import { isTrackType, trackTypes } from '../Filter/filterTypes';
import Affirmator from '../utils/Affirmator';

export default function CreateUI({ onClose, isOpen = true }: { onClose: () => void; isOpen?: boolean }) {
    const video = useVideoInfo();
    const { tags, addTag, removeTag, clearTags } = useTags();
    const save = useFormSubmit();
    // A new track may use combinations that do not exist in the library yet.
    const available = useAvailableTags([]);
    const [type, setType] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(false);
    useEffect(() => {
        if (!isOpen) setExpanded(false);
    }, [isOpen]);
    const [keepTags, setKeepTags] = useState(false);
    const id = useId();
    const urlInput = useRef<HTMLInputElement>(null);
    const query = search.trim();
    const suggestions = (available.tags ?? [])
        .filter(
            tag =>
                !isTrackType(tag.toLowerCase()) &&
                !tags.some(selected => selected.toLowerCase() === tag.toLowerCase()) &&
                tag.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => a.localeCompare(b));
    const exact = (available.tags ?? []).find(tag => tag.toLowerCase() === query.toLowerCase());
    const reserved = isTrackType(query.toLowerCase());
    const canCreate =
        !!query &&
        !query.includes(',') &&
        !reserved &&
        !exact &&
        !tags.some(tag => tag.toLowerCase() === query.toLowerCase());
    const canSubmit =
        !!video.focussedVideo &&
        !!video.normalizedUrl &&
        !video.isChecking &&
        !video.lookupError &&
        !video.isPresent &&
        !!type &&
        !save.isLoading;
    const inputClass =
        'w-full rounded border border-darknavy-700 bg-darknavy-500 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';
    const buttonClass =
        'min-h-[44px] rounded px-3 py-2 text-sm text-gray-300 hover:bg-darknavy-400/40 focus-visible:outline focus-visible:outline-indigo-400 disabled:opacity-40';
    const chooseTag = (tag: string) => {
        addTag(tag);
        setSearch('');
        save.clearFeedback();
    };
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!canSubmit || !video.focussedVideo || !video.normalizedUrl) return;
        if (await save.submit(video.normalizedUrl, [type, ...tags], video.focussedVideo)) {
            video.setUrl('');
            setExpanded(false);
            setSearch('');
            if (!keepTags) {
                setType('');
                clearTags();
            }
            urlInput.current?.focus();
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            aria-label="Add track"
            className="flex h-full min-h-0 flex-col gap-4 bg-darknavy-700 p-5 text-gray-200"
            onKeyDown={event => {
                if (event.key !== 'Escape') event.stopPropagation();
            }}
        >
            <header className="flex shrink-0 items-center justify-between">
                <h2 className="text-lg font-semibold">Add track</h2>
                <button type="button" aria-label="Close creator" onClick={onClose} className={buttonClass}>
                    &times;
                </button>
            </header>
            <fieldset
                disabled={save.isLoading}
                className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto disabled:opacity-60"
            >
                <div>
                    <label htmlFor={`${id}-url`} className="mb-2 block text-sm font-medium">
                        YouTube URL
                    </label>
                    <input
                        ref={urlInput}
                        id={`${id}-url`}
                        type="text"
                        inputMode="url"
                        autoComplete="off"
                        value={video.url}
                        placeholder="Paste a YouTube link..."
                        className={inputClass}
                        aria-describedby={`${id}-url-status`}
                        aria-invalid={!!video.url.trim() && !video.normalizedUrl}
                        onChange={event => {
                            video.setUrl(event.target.value);
                            setExpanded(false);
                            save.clearFeedback();
                        }}
                    />
                    <div id={`${id}-url-status`} className="mt-2 text-sm" aria-live="polite">
                        {!!video.url.trim() && !video.normalizedUrl && (
                            <p className="text-red-400">Enter a valid YouTube video link.</p>
                        )}
                        {video.isChecking && <p className="text-gray-400">Checking video and library...</p>}
                        {video.lookupError && (
                            <p className="text-red-400">
                                {video.lookupError}{' '}
                                <button type="button" onClick={video.retry} className="rounded underline">
                                    Try again
                                </button>
                            </p>
                        )}
                    </div>
                </div>
                {video.focussedVideo && (
                    <section
                        aria-label="Video preview"
                        className="rounded border border-darknavy-600 bg-darknavy-500 p-3"
                    >
                        <div className="flex items-start gap-3">
                            <button
                                type="button"
                                aria-label={expanded ? 'Hide video preview' : 'Play video preview'}
                                aria-expanded={expanded}
                                onClick={() => setExpanded(value => !value)}
                                className="relative w-28 shrink-0 overflow-hidden rounded focus-visible:outline focus-visible:outline-indigo-400"
                            >
                                {/* External YouTube thumbnails are supplied by oEmbed. */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={video.focussedVideo.thumbnail_url}
                                    alt=""
                                    className="aspect-video w-full object-cover"
                                />
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 flex items-center justify-center bg-black/30 text-xl"
                                >
                                    {expanded ? '\u00d7' : '\u25b6'}
                                </span>
                            </button>
                            <div className="min-w-0">
                                <p className="break-words text-sm font-medium">{video.focussedVideo.title}</p>
                                <p className="mt-1 text-xs text-gray-400">{video.focussedVideo.author_name}</p>
                            </div>
                        </div>
                        {expanded && isOpen && (
                            <iframe
                                title={`Preview: ${video.focussedVideo.title}`}
                                src={`https://www.youtube.com/embed/${new URL(video.normalizedUrl!).searchParams.get(
                                    'v'
                                )}?autoplay=1`}
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                                className="mt-3 aspect-video w-full rounded border-0"
                            />
                        )}
                        {video.isPresent && (
                            <p role="status" className="mt-3 text-sm text-amber-300">
                                Already in your library.
                            </p>
                        )}
                    </section>
                )}
                <fieldset>
                    <legend className="mb-2 text-sm font-medium">
                        Track type <span className="text-gray-400">(required)</span>
                    </legend>
                    <div className="grid grid-cols-3 gap-1 rounded border border-darknavy-600 bg-darknavy-800 p-1">
                        {trackTypes.map(value => (
                            <label
                                key={value}
                                className={`flex min-h-[44px] cursor-pointer items-center justify-center rounded px-2 text-sm capitalize focus-within:ring-2 focus-within:ring-indigo-400 ${
                                    type === value
                                        ? 'bg-indigo-500/20 text-white'
                                        : 'text-gray-400 hover:bg-darknavy-500'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`${id}-type`}
                                    value={value}
                                    required
                                    checked={type === value}
                                    onChange={() => {
                                        setType(value);
                                        save.clearFeedback();
                                    }}
                                    className="sr-only"
                                />
                                {value}
                            </label>
                        ))}
                    </div>
                </fieldset>
                <section aria-label="Track tags" className="flex flex-col gap-2">
                    <label htmlFor={`${id}-tags`} className="text-sm font-medium">
                        Tags <span className="text-gray-400">(optional)</span>
                    </label>
                    {!!tags.length && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    aria-label={`Remove ${tag}`}
                                    onClick={() => {
                                        removeTag(tag);
                                        save.clearFeedback();
                                    }}
                                    className="min-h-[44px] max-w-full break-words rounded border border-indigo-400/40 bg-indigo-500/20 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-indigo-400"
                                >
                                    {tag} <span aria-hidden="true">&times;</span>
                                </button>
                            ))}
                        </div>
                    )}
                    <input
                        id={`${id}-tags`}
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Find or create a tag..."
                        className={inputClass}
                        aria-describedby={`${id}-tag-help`}
                        onKeyDown={event => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                if (exact && !reserved) chooseTag(exact);
                                else if (canCreate) chooseTag(query);
                            }
                        }}
                    />
                    <p id={`${id}-tag-help`} className="text-xs text-gray-400">
                        Choose existing tags or enter a new one and press Enter.
                    </p>
                    {reserved && <p className="text-sm text-gray-400">Choose this in Track type above.</p>}
                    {query.includes(',') && (
                        <p className="text-sm text-gray-400">Add one tag at a time, without commas.</p>
                    )}
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => chooseTag(query)}
                            className={`${buttonClass} self-start break-all border border-darknavy-600`}
                        >
                            Create &ldquo;{query}&rdquo;
                        </button>
                    )}
                    <p className="mt-1 text-xs text-gray-400">{query ? 'Matching tags' : 'Existing tags'}</p>
                    {available.isLoading && (
                        <p role="status" className="text-sm text-gray-400">
                            Loading tags...
                        </p>
                    )}
                    {available.isError && (
                        <p role="alert" className="text-sm text-gray-400">
                            Could not load suggestions.{' '}
                            <button type="button" onClick={() => void available.retry()} className="underline">
                                Try again
                            </button>
                        </p>
                    )}
                    <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                        {suggestions.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => chooseTag(tag)}
                                className={`${buttonClass} max-w-full break-words border border-darknavy-600 bg-darknavy-500`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    {!available.isLoading && !available.isError && !suggestions.length && (
                        <p className="text-sm text-gray-400">
                            {query ? 'No matching existing tags.' : 'No more existing tags to suggest.'}
                        </p>
                    )}
                </section>
            </fieldset>
            <footer className="shrink-0 border-t border-darknavy-600 pb-[env(safe-area-inset-bottom)] pt-3">
                {save.isLoading && (
                    <div role="status" aria-label="Adding track">
                        <Affirmator isLoading />
                    </div>
                )}
                {save.submitError && (
                    <p role="alert" className="mb-3 text-sm text-red-400">
                        {save.submitError}
                    </p>
                )}
                {save.success && (
                    <p role="status" className="mb-3 break-words text-sm text-emerald-300">
                        {save.success}
                    </p>
                )}
                <label className="mb-3 flex min-h-[44px] items-center gap-2 text-xs text-gray-400">
                    <input
                        type="checkbox"
                        checked={keepTags}
                        disabled={save.isLoading}
                        onChange={event => setKeepTags(event.target.checked)}
                        className="h-4 w-4 accent-indigo-400"
                    />
                    Keep type and tags for the next track
                </label>
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-400">
                        {!type
                            ? 'Choose a track type to continue.'
                            : !video.focussedVideo
                            ? 'Add a video link to continue.'
                            : video.isPresent
                            ? 'Choose another video to add.'
                            : 'Ready to add to your library.'}
                    </p>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="min-h-[44px] shrink-0 rounded border border-indigo-400/40 bg-indigo-500/20 px-4 text-sm hover:bg-indigo-500/30 focus-visible:outline focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {save.isLoading ? 'Adding...' : 'Add track'}
                    </button>
                </div>
            </footer>
        </form>
    );
}
