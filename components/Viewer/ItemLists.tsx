import { Virtuoso } from 'react-virtuoso';
import { AnimatePresence, motion } from 'framer-motion';
import { useNewItems } from './hooks/useNewItems';
import { useFilterItems } from './hooks/useFilterItems';
import { useListItems } from './hooks/useListItems';
import { PaginatedItems } from './hooks/usePaginatedItems';
import ListItem from './ListItem';
import LoadingAnim from '../utils/LoadingAnimDismount';

interface IItemsListProps {
    hook: PaginatedItems;
}

const Loader = () => (
    <motion.div key="loader" className="self-center">
        <LoadingAnim />
    </motion.div>
);

/**
 * Renders any paginated list. Every list in the Viewer - new, filter, search and the plain list -
 * is this component fed a different hook.
 */
export function ItemsList({ hook }: IItemsListProps) {
    const { items, isLoading, isError, isLoadingMore, setSize, size } = hook;

    return (
        <AnimatePresence mode="wait">
            {isError && (<p>Error: {isError.message}</p>)}
            {isLoading && <Loader />}
            {items && (
                <Virtuoso
                    data={items}
                    itemContent={(_, item) => <ListItem item={item} />}
                    style={{ height: '100%', width: '100%' }}
                    onKeyDown={(e) => {
                        if (e.key === ' ') {
                            e.preventDefault();
                        }
                    }}
                    endReached={() => {
                        if (!isLoadingMore) {
                            setSize(size + 1);
                        }
                    }}
                    components={{
                        Footer: () => <div>{isLoadingMore ? <Loader /> : null}</div>,
                    }}
                />
            )}
        </AnimatePresence>
    );
}

export function NewItemsList() {
    return <ItemsList hook={useNewItems(30)} />;
}

export function FilterItemsList() {
    return <ItemsList hook={useFilterItems(30)} />;
}

export function ListItems() {
    return <ItemsList hook={useListItems(30)} />;
}
