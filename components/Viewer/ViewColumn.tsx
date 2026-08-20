// ViewColumn.tsx
import React, { useState } from 'react';
import { FilterItemsList, ItemsList, ListItems, NewItemsList } from './ItemLists';
import TListType from './types/TListType';
import { useSearchItems } from './hooks/useSearchItems';

interface ViewColumnProps {
    type?: TListType;
}

export default function ViewColumn({ type = 'list' }: ViewColumnProps) {
    const [search, setSearch] = useState('');
    const searchHook = useSearchItems(search, 30);

    return (
        <div className="h-full">
            <div className="flex h-full flex-col gap-2">
                <input
                    type="text"
                    className="rounded bg-transparent p-1"
                    placeholder="Search ..."
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                />
                {/* A search overrides whatever list the column would otherwise show */}
                {search && <ItemsList hook={searchHook} />}
                {!search && type === 'new' && <NewItemsList />}
                {!search && type === 'filter' && <FilterItemsList />}
                {/* TODO: 'trend' and 'owned' render the plain list until they have their own
                    routes - three of the four columns currently show the same data. */}
                {!search && (type === 'list' || type === 'owned' || type === 'trend') && <ListItems />}
            </div>
        </div>
    );
}
