import React from 'react'
import { motion } from 'framer-motion'

function ViewerContainer(props: any) {

    const id = props.id
    const title = props.title
    const artist = props.artist
    const url = props.url
    const tags = props.tags
    const i = tags.map((tag: any) => tag.name).join(', ')
    const variants = props.variants
    const custom = props.custom

    return (
        <motion.div className='bg-gray-800/50 p-1 rounded grow w-full md:w-5/6' variants={variants} initial='hidden' animate='show' exit='exit' custom={custom}>
            <div className='flex flex-row items-center gap-2 w-full'>
                <p className='opacity-50'>{id}</p>
                <p onClick={() => { window.open(url, '_blank') }} className='hover:cursor-pointer truncate'>{title}</p>
                <p className='grow opacity-50 truncate'>{artist}</p>
                <button onClick={() => { navigator.clipboard.writeText(url) }} className='bg-gray-800/50 hover:bg-gray-800/25 rounded p-1 grow-0'>Copy</button>
            </div>
            <div className='flex flex-row items-center justify-start gap-2 text-sm'>
                <p className='opacity-50 truncate'>{i}</p>
            </div>
        </motion.div>
    )
}

export default ViewerContainer