import { useStackActions, useStackState } from '../../Contexts/StackControlsProvider';

/**
 * Chooses whether the per-player mute and solo buttons cut instantly or ramp.
 *
 * With it on, muting is a fade out and soloing fades every other playing player down, which is
 * what you want mid-session; off is the abrupt version, for setting a mix up beforehand.
 */
function FadeTransitionsToggle() {
    const { fadeTransitions } = useStackState();
    const { setFadeTransitions } = useStackActions();

    return (
        <label className="flex w-full cursor-pointer flex-row items-center justify-center gap-2 rounded border-2 border-darknavy-700 bg-darknavy-500 p-2">
            <input
                type="checkbox"
                className="accent-red-600"
                checked={fadeTransitions}
                onChange={e => setFadeTransitions(e.target.checked)}
            />
            <span className="text-sm">Fade mute &amp; solo</span>
        </label>
    );
}

export default FadeTransitionsToggle;
