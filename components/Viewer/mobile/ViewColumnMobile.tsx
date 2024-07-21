import { ViewColumn } from '../ViewColumn';
import { useFilter } from '../../Contexts/FilterStateProvider';

function ViewColumnMobile() {
    const { filter } = useFilter();

    if (filter.length > 0) {
        return (
            <ViewColumn type="filter" />
        );
    } else {
        return (
            <ViewColumn type="new" />
        );
    }
}

export default ViewColumnMobile;