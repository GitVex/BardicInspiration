import { useEffect, useState } from 'react';

function util_replaceAt(str: string, index: number, replacement: string): string {
    return str.substring(0, index) + replacement + str.substring(index + replacement.length);
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


interface randomTextProps {
    hiddenText: string;
}

export default function RandomText({ hiddenText = '' }: randomTextProps) {
    const [text, setText] = useState(hiddenText);
    const [scramble, setScramble] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!scramble) return;

            setText((prev) => {

                const changeIndex = randomInt(0, prev.length - 1);
                const randomChar = String.fromCharCode(randomInt(33, 126));

                return util_replaceAt(prev, changeIndex, randomChar);
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [hiddenText, scramble]);


    return (
        <>
            <span style={{ width: '20rem'}}>
                <p>
                 HEY I HOPE THIS GETS INLINED
                </p>

                <p style={{ display: 'inline', marginRight: '2rem'}}>
                    {text.slice(0, text.length / 2)}
                </p>

                <p>
                    {text.slice(text.length / 2, text.length)}
                </p>


            </span>
            <button className="bg-darknavy-600 rounded py-1 px-2"
                    onClick={() => setScramble((prev) => !prev)}> {scramble ? 'Stop' : 'Start'} Scrambling
            </button>
        </>
    );
}
