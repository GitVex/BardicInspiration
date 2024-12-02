import { motion } from 'framer-motion';
import React from 'react';
import { useStackControls } from '../../Contexts/StackControlsProvider';

function SelectionsViewer() {
    const { presetState: preset, presetDispatch: dispatch } = useStackControls();
    const players = preset.players;

    return (
        <div className="">
            <div className="flex flex-col items-center">
                <div
                    className="grid grid-cols-2 grid-rows-4 gap-2 rounded border-2 border-darknavy-700 bg-darknavy-500 p-4">
                    {players.map((player, index) => (
                        <div key={index} className={`relative flex h-8 w-10 rounded bg-transparent`}>
                            <motion.div
                                className={`absolute top-0 left-0 flex h-8 w-10 rounded`}
                                animate={{
                                    boxShadow: player.selected ? '0 0 8px 3px #f00' : '0 0 0 0px #f00',
                                }}
                                transition={{
                                    duration: 0.2,
                                }}
                            />
                            <div
                                className={`absolute top-0 left-0 flex h-8 w-10 rounded bg-transparent shadow-[inset_0_0_12px_rgba(108,117,130,1)]`}
                                onClick={() => {
                                    if (player.selected) {
                                        dispatch({
                                            type: 'deselect',
                                            index: index,
                                        });
                                    } else {
                                        dispatch({
                                            type: 'select',
                                            index: index,
                                        });
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SelectionsViewer;
