import React from 'react';
import PlayerComponentTester from '../../Player/PlayerComponentTester';
import RandomText from '../../utils/RandomText';
import PlayerSandbox from './PlayerSandbox';

function Tester() {

    return (
        <div className={'flex h-screen min-h-0 flex-col'}>
            {/*<PlayerComponentTester />*/}
            <PlayerSandbox />
        </div>
    );
}

export default Tester;
