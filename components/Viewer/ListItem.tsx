import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { track } from '@prisma/client';
import NotificationButton from '../utils/NotificationButton';
import { useLoadVideoInLongestPausedPlayer } from '../utils/AddHandler';

function ListItem({ item }: { item: track & { tags: any } }) {
	const loadVideo = useLoadVideoInLongestPausedPlayer();
	const [showTags, setShowTags] = useState(false);

	return (
		<div
			className='flex flex-row items-center gap-2 rounded-lg bg-indigo-600/10 p-2 text-sm duration-100 hover:border-l-8'
			//@ts-ignore
			style={{ 'border-inline-color': item.color }}
			onMouseEnter={() => setShowTags(true)}
			onMouseLeave={() => setShowTags(false)}
		>
			<div className='flex w-3/5 flex-1 flex-col'>
				<div className='w-full truncate' style={{ maxWidth: '100%' }}>
					<p
						className='cursor-pointer overflow-hidden whitespace-nowrap font-semibold'
						onClick={() => window.open(item.url, '_blank')?.focus()}
					>
						{item.title}
					</p>
					<motion.div
						initial={{ opacity: 1 }}
						animate={{ opacity: showTags ? 0 : 1 }}
						transition={{ duration: 0.25 }}
					>
						<p className='truncate text-slate-600'>
							<em>{!showTags && item.artist}</em>
						</p>
					</motion.div>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: showTags ? 1 : 0 }}
						transition={{ duration: 0.25 }}
					>
						<p className='truncate text-slate-600'>
							<em>
								{showTags &&
									//@ts-ignore
									item.tags.map((tag, index) => (
										<span key={tag.id}>
											{tag.name}
											{index < item.tags.length - 1
												? ', '
												: ''}
										</span>
									))}
							</em>
						</p>
					</motion.div>
				</div>
			</div>
			<NotificationButton
				id={item.id}
				color={item.color}
				luminance={item.luminance}
				onClick={() => navigator.clipboard.writeText(item.url)}
			>
				Copy
			</NotificationButton>
			<NotificationButton
				id={item.id}
				color={item.color}
				luminance={item.luminance}
				onClick={() => loadVideo(item.url)}
			>
				Add
			</NotificationButton>
		</div>
	);
}

export default ListItem;
