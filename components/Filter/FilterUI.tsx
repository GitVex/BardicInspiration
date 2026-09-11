import { useId, useState } from 'react';
import { useFilter } from '../Contexts/FilterStateProvider';
import TagItem from './TagItem';
import useTags from './hooks/useTags';
import { isTrackType, selectTrackType, trackTypes } from './filterTypes';

export default function FilterUI({ onClose, mobile = false }: { onClose: () => void; mobile?: boolean }) {
    const { filter, setFilter } = useFilter();
    const { tags, isLoading, isError, retry } = useTags();
    const [search, setSearch] = useState('');
    const searchId = useId();
    const typeName = useId();
    const selectedType = filter.find(isTrackType) ?? '';
    const selectedTags = filter.filter(tag => !isTrackType(tag));
    // Switching type replaces the current type while keeping descriptive tags.
    const typeOptions = useTags(selectedTags);
    const availableTags = [...new Set([...(tags ?? []), ...selectedTags])]
        .filter(tag => !isTrackType(tag) && tag.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
        .sort((a, b) => a.localeCompare(b));
    const changeTag = (tag: string, checked: boolean) =>
        setFilter(previous => (checked ? [...new Set([...previous, tag])] : previous.filter(value => value !== tag)));
    const actionClass =
        'min-h-[44px] rounded px-3 text-sm text-gray-300 hover:bg-darknavy-500 disabled:opacity-40 focus-visible:outline focus-visible:outline-indigo-400';

    return (
        <div className="flex h-full min-h-0 flex-col gap-4 p-5 text-gray-200">
            <header className="flex shrink-0 items-center justify-between gap-3">
                <h2 id="filter-panel-title" className="text-lg font-semibold">
                    Filters
                </h2>
                <button type="button" onClick={onClose} aria-label="Close filters" className={actionClass}>
                    &times;
                </button>
            </header>
            <div className="flex min-h-0 shrink flex-col gap-4 overflow-y-auto">
                <fieldset>
                    <legend className="mb-2 text-sm font-medium">Track type</legend>
                    <div className="grid grid-cols-2 gap-1 rounded border border-darknavy-700 bg-darknavy-800 p-1 min-[380px]:grid-cols-4">
                        {['', ...trackTypes].map(type => {
                            const disabled =
                                type !== '' &&
                                type !== selectedType &&
                                (typeOptions.isLoading || !!typeOptions.isError || !typeOptions.tags?.includes(type));
                            return (
                                <label
                                    key={type}
                                    className={`relative flex min-h-[44px] cursor-pointer items-center justify-center rounded px-2 text-sm capitalize focus-within:ring-2 focus-within:ring-indigo-400 ${
                                        disabled
                                            ? 'cursor-not-allowed text-gray-500 opacity-50'
                                            : selectedType === type
                                            ? 'bg-indigo-500/20 text-white'
                                            : 'text-gray-400 hover:bg-darknavy-500'
                                    }`}
                                >
                                    <input
                                        className="sr-only"
                                        type="radio"
                                        name={typeName}
                                        value={type}
                                        checked={selectedType === type}
                                        disabled={disabled}
                                        onChange={() => setFilter(previous => selectTrackType(previous, type))}
                                    />
                                    {type || 'All'}
                                </label>
                            );
                        })}
                    </div>
                    <p className="mt-2 text-xs text-gray-400">Tracks must match the type and all selected tags.</p>
                </fieldset>
                <section aria-label="Selected tags">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium">Tags &middot; {selectedTags.length} selected</h3>
                        <button
                            type="button"
                            disabled={!selectedTags.length}
                            onClick={() => setFilter(previous => previous.filter(isTrackType))}
                            className={actionClass}
                        >
                            Clear tags
                        </button>
                    </div>
                    <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto">
                        {selectedTags.length ? (
                            selectedTags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    aria-label={`Remove ${tag}`}
                                    onClick={() => changeTag(tag, false)}
                                    className="min-h-[44px] max-w-full break-words rounded border border-indigo-400/40 bg-indigo-500/20 px-3 py-2 text-sm hover:bg-indigo-500/30 focus-visible:outline focus-visible:outline-indigo-400"
                                >
                                    {tag} <span aria-hidden="true">&times;</span>
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400">Choose tags to narrow your results.</p>
                        )}
                    </div>
                </section>
                <div>
                    <label htmlFor={searchId} className="mb-2 block text-sm font-medium">
                        Search tags
                    </label>
                    <input
                        id={searchId}
                        type="search"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Search tags..."
                        className="w-full rounded border border-darknavy-700 bg-darknavy-500 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                </div>
            </div>
            <section
                aria-label="Available tags"
                className="min-h-[80px] flex-1 overflow-y-auto border-t border-darknavy-700 pt-4"
            >
                {isLoading && (
                    <p role="status" className="text-sm text-gray-400">
                        Loading tags...
                    </p>
                )}
                {isError && (
                    <div role="alert" className="text-sm text-gray-300">
                        Could not load tags.{' '}
                        <button
                            type="button"
                            onClick={() => void retry()}
                            className="rounded underline focus-visible:outline focus-visible:outline-indigo-400"
                        >
                            Try again
                        </button>
                    </div>
                )}
                {!isLoading && !isError && !availableTags.length && (
                    <p role="status" className="text-sm text-gray-400">
                        {search.trim() ? 'No tags match your search.' : 'No tags available yet.'}
                    </p>
                )}
                <div className="flex flex-wrap content-start gap-2">
                    {availableTags.map(tag => (
                        <TagItem
                            key={tag}
                            tag={tag}
                            selected={filter.includes(tag)}
                            disabled={!filter.includes(tag) && (isLoading || !!isError)}
                            onChange={changeTag}
                        />
                    ))}
                </div>
            </section>
            <footer className="flex shrink-0 items-center justify-between border-t border-darknavy-700 pb-[env(safe-area-inset-bottom)] pt-3">
                <button type="button" disabled={!filter.length} onClick={() => setFilter([])} className={actionClass}>
                    Reset filters
                </button>
                {mobile && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-[44px] rounded border border-indigo-400/40 bg-indigo-500/20 px-6 text-sm hover:bg-indigo-500/30 focus-visible:outline focus-visible:outline-indigo-400"
                    >
                        Done
                    </button>
                )}
            </footer>
        </div>
    );
}
