// ViewColumn.tsx
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { useItems } from './hooks/useItems';
import LoadingAnim from '../utils/LoadingAnimDismount';
import ListItem from './ListItem';
import { Virtuoso } from 'react-virtuoso';
import TItem from './types/TItem';

interface ViewColumnProps {
    type?: string;
}

export function ViewColumn({ type = 'list' }: ViewColumnProps) {
    const [search, setSearch] = useState('');
    const { data: items, isError, isLoading } = useItems(type);

    return (
        <div className="h-full">
            <AnimatePresence mode="wait">
                {isError && (<p>Error: {isError.message}</p>)}
                {isLoading && (
                    <motion.div key="loader" className="self-center">
                        <LoadingAnim />
                    </motion.div>
                )}
                {items && (
                    <div className="flex flex-col gap-2 h-full">
                        <input
                            type="text"
                            className="rounded bg-transparent p-1"
                            placeholder="Search ..."
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                        />
                        <Virtuoso
                            data={items.filter((item: TItem) =>
                                item.title.toLowerCase().includes(search.toLowerCase()) ||
                                item.artist.toLowerCase().includes(search.toLowerCase()),
                            )}
                            itemContent={(index, item) => <ListItem item={item} />}
                            style={{ height: '100%', width: '100%' }}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
