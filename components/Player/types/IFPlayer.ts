/* https://developers.google.com/youtube/iframe_api_reference?hl=de#Functions */

export default interface IFPlayer extends YT.Player {
    /* addEventListener: (event: string, listener: string) => void;
    removeEventListener: (event: string, listener: string) => void;
    clearVideo: () => void;
    cuePlaylist: (playlist: string[], index: number, startSeconds: number, suggestedQuality: string) => void;
    cueVideoById: (videoId: string, startSeconds: number, suggestedQuality: string) => void;
    cueVideoByUrl: (mediaContentUrl: string, startSeconds: number) => void;
    getAvailablePlaybackRates: () => number[];
    getAvailableQualityLevels: () => string[];
    getCurrentTime: () => number;
    getDuration: () => number;
    getPlaybackQuality: () => string;
    getPlaybackRate: () => number;
    getPlayerMode: () => any;
    getPlayerState: () => any;
    getPlaylist: () => string[];
    getPlaylistId: () => string;
    getPlaylistIndex: () => number;
    getVideoBytesLoaded: () => number;
    getVideoBytesTotal: () => number;
    getVideoData: () => any;
    getVideoLoadedFraction: () => number;
    getVideoStartBytes: () => number;
    getVideoUrl: () => string;
    getVolume: () => number;
    hideVideoInfo: () => void;
    isMuted: () => boolean;
    isVideoInfoVisible: () => boolean;
    loadModule: (moduleName: string) => void;
    loadPlaylist: (playlist: string[], index: number, startSeconds?: number, suggestedQuality?: string) => void;
    loadVideoById: (videoId: string, startSeconds?: number, suggestedQuality?: string) => void;
    loadVideoByUrl: (mediaContentUrl: string, startSeconds?: number) => void;
    logImaAdEvent: (eventType: string) => void;
    mute: () => void;
    nextVideo: () => void;
    pauseVideo: () => void;
    playVideo: () => void;
    playVideoAt: (index: number) => void;
    playerInfo: { videoBytesLoaded: number; videoBytesTotal: number; videoLoadedFraction: number; };
    previousVideo: () => void;
    removeCueRange: (start: number, end: number) => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    setLoop: (loopPlaylists: boolean) => void;
    setOption: (field: string, value: any) => void;
    setPlaybackQuality: (suggestedQuality: string) => void;
    setPlaybackRate: (suggestedRate: number) => void;
    setShuffle: (shufflePlaylist: boolean) => void;
    setSphereProperties: (sphereProperties: any) => void;
    setVolume: (volume: number) => void;
    showVideoInfo: () => void;
    stopVideo: () => void;
    unMute: () => void;
    unloadModule: (moduleName: string) => void;
    v: HTMLDivElement;
    videoTitle: string; */
}
