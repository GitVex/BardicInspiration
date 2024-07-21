interface TagItemProps {
	tag: string;
	index: number;
	globalDisable?: boolean;
	onChangeCallback?: (event: any) => void;
	isInFilter?: boolean;
}

function TagItem({ tag, index, globalDisable = false, onChangeCallback, isInFilter = false }: TagItemProps) {
	return (
		<p key={index} className='bg-darknavy-300/25 rounded px-1 text-white'>
			<input type='checkbox' name={tag} id={tag + 'Box'} disabled={globalDisable} onChange={onChangeCallback} checked={isInFilter} />
			<label htmlFor={tag + 'Box'} className='ml-1 w-full'>
                {tag}
			</label>
		</p>
	);
}

export default TagItem;
