import React from 'react';

function ControlPanelButton(props: { onClick: () => void, disabled: boolean, children?: React.ReactNode}) {
    return <button
        className="w-fit rounded border-2 border-darknavy-700 bg-darknavy-500 px-2 py-1 disabled:opacity-50"
        onClick={props.onClick}
        disabled={props.disabled}
    >
        {props.children}
    </button>;
}

export default ControlPanelButton;