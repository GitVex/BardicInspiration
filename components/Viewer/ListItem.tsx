import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLoadVideoInLongestPausedPlayer } from './hooks/useLoadVideoInLongestPausedPlayer';
import NotificationButton from './NotificationButton';
import ScrollTitle from './ScrollTitle';
import TItem from './types/TItem';

interface ListItemProps {
    item: TItem;
}

function ListItem({ item }: ListItemProps) {
    const loadVideo = useLoadVideoInLongestPausedPlayer();
    const [showTags, setShowTags] = useState(false);
    const tagString = item.tags.map((tag) => tag.name).join(', ');

    return (
        <div
            className="flex flex-row items-center gap-2 rounded-lg bg-indigo-600/10 p-2 text-sm duration-100 hover:border-l-8 mb-2"
            //@ts-ignore
            style={{ 'borderInlineColor': item.color }}
            onMouseEnter={() => setShowTags(true)}
            onMouseLeave={() => setShowTags(false)}
        >
            <div className="flex w-3/5 flex-1 flex-col">
                <div className="w-full truncate" style={{ maxWidth: '100%' }}>
                    <ScrollTitle title={item.title} />
                    {!showTags && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="truncate text-slate-600">
                                <em>{item.artist}</em>
                            </p>
                        </motion.div>)
                    }
                    {showTags && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <p className="truncate text-slate-600">
                                <em>
                                    {tagString}
                                </em>
                            </p>
                        </motion.div>)
                    }
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
