import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type FilterStateContextType = {
    filter: string[];
    setFilter: React.Dispatch<React.SetStateAction<string[]>>;
};

const FilterStateContext = createContext<FilterStateContextType | undefined>(undefined);

export function useFilter() {
    const context = useContext(FilterStateContext);
    if (!context) {
        throw new Error('useFilter must be used within a FilterStateProvider');
    }
    return context;
}

function FilterStateProvider({ children }: { children: ReactNode }) {
    const [filter, setFilter] = useState<string[]>([]);

    // setFilter is stable, so this changes only when the filter itself does
    const value = useMemo(() => ({ filter, setFilter }), [filter]);

    return (
        <FilterStateContext.Provider value={value}>
            {children}
        </FilterStateContext.Provider>
    );
}

export default FilterStateProvider;
