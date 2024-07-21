import React, { createContext, useContext, useState, ReactNode } from 'react';

type FilterStateContextType = {
    filter: string[];
    setFilter: React.Dispatch<React.SetStateAction<string[]>>;
};

const FilterStateContext = createContext<FilterStateContextType | undefined>(undefined);

export function useFilter() {
    const context = useContext(FilterStateContext);
    if (!context) {
        throw new Error('useFilterState must be used within a FilterStateProvider');
    }
    return context;
}

function FilterStateProvider({ children }: { children: ReactNode }) {
    const [filter, setFilter] = useState<string[]>([]);

    const value = { filter, setFilter };

    return (
        <FilterStateContext.Provider value={value}>
            {children}
        </FilterStateContext.Provider>
    );
}

export default FilterStateProvider;
