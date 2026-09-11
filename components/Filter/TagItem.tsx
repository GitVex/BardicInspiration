interface TagItemProps {
    tag: string;
    selected: boolean;
    disabled?: boolean;
    onChange: (tag: string, checked: boolean) => void;
}
export default function TagItem({ tag, selected, disabled = false, onChange }: TagItemProps) {
    return (
        <label
            className={`flex min-h-[44px] max-w-full cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-indigo-400 ${
                disabled
                    ? 'cursor-not-allowed border-darknavy-700 opacity-50'
                    : selected
                    ? 'border-indigo-400/60 bg-indigo-500/20 text-white'
                    : 'border-darknavy-700 bg-darknavy-500 text-gray-300 hover:bg-darknavy-400/40'
            }`}
        >
            <input
                type="checkbox"
                checked={selected}
                disabled={disabled}
                onChange={event => onChange(tag, event.target.checked)}
                className="h-4 w-4 shrink-0 accent-indigo-400"
            />
            <span className="min-w-0 break-words">{tag}</span>
        </label>
    );
}
