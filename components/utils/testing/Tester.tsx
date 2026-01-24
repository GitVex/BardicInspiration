import React from 'react';
import PlayerComponentTester from '../../Player/PlayerComponentTester';
import RandomText from '../../utils/RandomText';

function Tester() {

    return (
        <div className={'flex h-screen items-center justify-center gap-10'}>
            {/*<PlayerComponentTester />*/}
            <RandomText hiddenText={'This is a test text that will change randomly! Lorem Ipsum or something'} />
        </div>
    );
}

export default Tester;
