import React from 'react'
import YTPlayer from './YTPlayer'

export default function PlayerManager() {

    return (
        <div className="h-screen w-screen flex flex-col 2xl:justify-center 2xl:items-center overflow-y-scroll overflow-x-hidden">
            <div className="flex flex-row flex-wrap gap-2 h-fit w-screen my-2 justify-center items-center">
                <YTPlayer playerId={0} />
                <YTPlayer playerId={1} />
                <YTPlayer playerId={2} />
                <YTPlayer playerId={3} />
                <YTPlayer playerId={4} />
                <YTPlayer playerId={5} />
                <YTPlayer playerId={6} />
                <YTPlayer playerId={7} />
                <YTPlayer playerId={8} />
            </div>
        </div>
    )
}

