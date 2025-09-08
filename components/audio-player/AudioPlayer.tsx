// components/ModernAudioPlayer.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";

interface Track {
    title: string;
    src: string;
}

interface ModernAudioPlayerProps {
    tracks: Track[];
}

const ModernAudioPlayer: React.FC<ModernAudioPlayerProps> = ({ tracks }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isHide, setIsHide] = useState(false);

    const currentTrack = tracks[currentIndex];

    console.log(tracks, "tracks");

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = volume;

        const updateProgress = () => setProgress(audio.currentTime);
        const setAudioDuration = () => setDuration(audio.duration);

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", setAudioDuration);
        audio.addEventListener("ended", handleNext);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", setAudioDuration);
            audio.removeEventListener("ended", handleNext);
        };
    }, [currentIndex, volume]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) audio.pause();
        else audio.play();

        setIsPlaying(!isPlaying);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? tracks.length - 1 : prev - 1));
        setIsPlaying(false);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === tracks.length - 1 ? 0 : prev + 1));
        setIsPlaying(false);
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const value = Number(e.target.value);
        audio.currentTime = value;
        setProgress(value);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = Number(e.target.value);
        setVolume(vol);
        if (audioRef.current) audioRef.current.volume = vol;
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <div >
            <div className={`fixed z-20 bottom-0 left-0 w-full bg-white/30 backdrop-blur-md shadow-lg py-4 ${isHide ? "hidden" : ""}`}>
                <div className="relative">
                    <div>
                        <button
                            onClick={() => {
                                setIsHide(!isHide);
                                setIsPlaying(false);
                            }}
                            className="absolute top-4 right-4 hover:scale-110 transition cursor-pointer"
                        >
                            <Icon icon="material-symbols:close-rounded" width={24} />
                        </button>
                    </div>
                    <div className="max-w-lg mx-auto">
                        <audio ref={audioRef} src={currentTrack.src} preload="metadata" />

                        {/* Track Info */}
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{currentTrack.title}</h2>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{formatTime(progress)}</span>
                            <input
                                type="range"
                                min={0}
                                max={duration || 0}
                                value={progress}
                                onChange={handleProgressChange}
                                className="w-full h-1 rounded-full cursor-pointer"
                            />
                            <span className="text-sm">{formatTime(duration)}</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-6">
                            <button onClick={handlePrev} className="hover:scale-110 transition">
                                <Icon icon="material-symbols:skip-previous-rounded" width={32} />
                            </button>

                            <button
                                onClick={togglePlay}
                                className="bg-white text-purple-600 w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:scale-110 transition"
                            >
                                <Icon
                                    icon={isPlaying ? "material-symbols:pause-rounded" : "material-symbols:play-arrow-rounded"}
                                    width={32}
                                />
                            </button>

                            <button onClick={handleNext} className="hover:scale-110 transition">
                                <Icon icon="material-symbols:skip-next-rounded" width={32} />
                            </button>
                            <div className="flex items-center gap-2">
                                <Icon icon="material-symbols:volume-up-rounded" width={24} />
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-[100px] h-1 rounded-full cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Volume */}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernAudioPlayer;
