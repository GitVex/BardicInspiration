import React, { useState } from 'react';
import { useFilter } from '../Contexts/FilterStateProvider';
import TagItem from './TagItem';
import useTags from './hooks/useTags';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingAnim from '../utils/LoadingAnimDismount';

// Define the sorting function
function sortTags(a: string, b: string, filter: string[]): number {
    const aInFilter = filter.includes(a);
    const bInFilter = filter.includes(b);

    if (aInFilter && bInFilter) {
        return 0;
    } else if (aInFilter) {
        return -1;
    } else if (bInFilter) {
        return 1;
    } else {
        return a.localeCompare(b);
    }
}

function FilterUI() {
    const { filter, setFilter } = useFilter();
    const { tags, isLoading, isError } = useTags();

    const [search, setSearch] = useState('');
    const globalDisable = isLoading;

    const onChangeCallback = (e: any) => {
        const { checked, name } = e.target;

        setFilter((prev) => {
            if (checked) {
                return [...prev, name];
            } else {
                return prev.filter((tag) => tag !== name);
            }
        });
    };

    return (
        <div className="h-full w-full  p-6">
            <div className="flex flex-col gap-2 h-full w-full rounded bg-indigo-800/25 p-2">
                <input
                    type="text"
                    className="w-full rounded bg-indigo-800/25 p-2"
                    placeholder="Search..."
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                />
                <div className="flex max-h-full w-full flex-row flex-wrap gap-2 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {isLoading && (
                            <div key="loader" className="flex justify-center items-center w-full min-h-64">
                                <LoadingAnim />
                            </div>
                        )}
                        {isError && <div>Error loading tags.</div>}
                        {tags &&
                            (tags.sort((a: string, b: string) => sortTags(a, b, filter)).map((tag: string, index: number) => {
                                return (
                                    (tag.includes(search) ||
                                        search === '' ||
                                        filter.includes(tag)) && (
                                        <TagItem
                                            tag={tag}
                                            index={index}
                                            globalDisable={globalDisable}
                                            onChangeCallback={onChangeCallback}
                                            isInFilter={filter.includes(tag)}
                                        />
                                    )
                                );
                            }))
                        }
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default FilterUI;
