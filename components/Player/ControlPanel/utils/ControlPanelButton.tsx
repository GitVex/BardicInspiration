import React from 'react';

function ControlPanelButton(props: { onClick: () => void, disabled: boolean, children?: React.ReactNode}) {
    return <button
        className="flex-1 rounded border-2 border-darknavy-700 bg-darknavy-500 px-2 py-1 text-sm
                   hover:bg-darknavy-400/40 disabled:opacity-50 transition-colors"
        onClick={props.onClick}
        disabled={props.disabled}
    >
        {props.children}
    </button>;
}

export default ControlPanelButton;