import React from 'react';
import { motion } from 'framer-motion';
import { useVideoInfo } from './hooks/useVideoInfo';
import { useTags } from './hooks/useTags';
import useFormSubmit from './hooks/useFormSubmit';

function CreateUI() {
    const { url, focussedVideo, isPresent, fetchAndSetVideoInfo } = useVideoInfo();
    const { tags, setTagsFromInput } = useTags();
    const { isSubmittable, handleSubmit } = useFormSubmit(url, tags, focussedVideo, isPresent);

    const onBlurUrlFieldHandler = async (e: React.FocusEvent<HTMLInputElement>) => {
        const url = e.target.value;
        await fetchAndSetVideoInfo(url);
    };

    const onBlurTagsFieldHandler = (e: React.FocusEvent<HTMLInputElement>) => {
        const tags = e.target.value;
        setTagsFromInput(tags);
    };

    return (
        <main className="flex h-full w-full flex-col gap-2 p-6">
            <section className="h-1/3 w-full rounded bg-indigo-500/5">
                <div className="h-full w-full p-2">
                    <form className="flex h-full w-full flex-col items-start gap-2" onSubmit={handleSubmit}>
                        <span className="place-self-center text-center text-2xl font-bold">Creator</span>
                        <fieldset className="grid h-fit w-full grid-cols-[1fr,7fr] grid-rows-2 gap-2">
                            <label htmlFor="url" className="text-center align-middle">
                                URL
                            </label>
                            <input
                                type="text"
                                name="url"
                                id="url"
                                className="rounded bg-indigo-800/50 p-1"
                                onBlur={onBlurUrlFieldHandler}
                            />
                            <label htmlFor="tags" className="text-center align-middle">
                                Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                id="tags"
                                className="rounded bg-indigo-800/50 p-1"
                                onBlur={onBlurTagsFieldHandler}
                            />
                        </fieldset>
                        <motion.button
                            className={`place-self-center rounded p-1 text-white ${isSubmittable ? 'bg-indigo-800/50' : 'cursor-not-allowed bg-gray-700/25'}`}
                            disabled={!isSubmittable}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Submit
                        </motion.button>
                    </form>
                </div>
            </section>
            <section
                className="flex h-1/3 w-full flex-col place-items-center justify-center rounded bg-indigo-500/5 p-2">
                <span className="order-first text-center text-xl font-bold">You're looking at:</span>
                <span className="w-full truncate text-center text-lg">{focussedVideo?.title}</span>
                <div className="w-fit p-2">
                    {focussedVideo && (
                        <div
                            className="h-full w-full"
                            dangerouslySetInnerHTML={{ __html: focussedVideo.html }}
                        />
                    )}
                </div>
                <span className="text-md w-full flex-grow truncate text-center text-red-600">
                    {isPresent && '... It\'s already in here!'}
                </span>
            </section>
        </main>
    );
}

export default CreateUI;
