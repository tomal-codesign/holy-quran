"use client";
import React, { useEffect, useState } from 'react'
import { Button, Select } from "antd";
import { Icon } from '@iconify/react/dist/iconify.js';
import { useParams, useRouter } from 'next/navigation';
import { surahApi } from '@/services/allSurahApi';
import { surahDetails } from '@/types/surah';
import SingleAyat from '@/components/single-ayat/SingleAyat';
import SingleAyatSkeleton from '@/components/single-ayat-skeleton/SingleAyatSkeleton';
import AudioPlayer from '@/components/audio-player/AudioPlayer';

const page = () => {
    const router = useRouter();
    const params = useParams<{ slug: string }>();
    const [loading, setLoading] = useState(false);
    const [surahDetails, setSurahDetails] = useState<surahDetails | null>(null);
    const [suraAudio, setSuraAudio] = useState<{ value: string, label: string }[]>([]);
    const [selectedAudio, setSelectedAudio] = useState<string | undefined>(undefined);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Fetch surah details using params.slug here
        (async () => {
            setLoading(true);
            try {
                const data = await surahApi.getSurahById(Number(params.slug));
                const suraAudio = Object.values(data.audio).map((item: any) => ({
                    value: item.originalUrl,
                    label: item.reciter
                }));
                setSurahDetails(data);
                setSuraAudio(suraAudio);
                if (suraAudio.length > 0) {
                    setSelectedAudio(suraAudio[0].value);
                    playAudio(suraAudio[0].value);
                    setAudioUrl(suraAudio[0].value);
                }
            } catch (error) {
                console.error('Error fetching surah details:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, [params.slug]);

    const handleChange = (value: string) => {
        setSelectedAudio(value);
        playAudio(value);
        setAudioUrl(value);
    };

    const playAudio = (url: string) => {
        // stop old audio
        if (audioObj) {
            audioObj.pause();
            audioObj.currentTime = 0;
        }

        const newAudio = new Audio(url);
        newAudio.addEventListener('ended', () => setIsPlaying(false));
        setAudioObj(newAudio);
        setIsPlaying(false);
    };

    const handlePlay = () => {
        if (!audioObj) return;
        if (isPlaying) {
            audioObj.pause();
            setIsPlaying(false);
        } else {
            audioObj.play().catch(console.error);
            setIsPlaying(true);
        }
    };
    const downloadAudio = async () => {
        if (!audioUrl) return;

        try {
            const response = await fetch(audioUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${surahDetails?.surahName || "surah"}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // blob memory clean
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    return (
        <div>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10'>
                <div className='flex items-center gap-3 mb-6'>
                    {/* Back button */}
                    <button
                        onClick={() => router.back()}
                        className="mb-4 w-12 h-12 bg-white hover:bg-green-600 hover:!text-white text-gray-700 rounded-lg cursor-pointer flex gap-2 items-center justify-center"
                    >
                        <Icon icon="material-symbols:arrow-back-rounded" width="22" height="22" />
                    </button>

                    {/* Surah title */}
                    <div className='flex-1 flex justify-between items-center gap-4'>
                        <div className='flex flex-col gap-1'>
                            <h1 className="text-md font-bold text-gray-800 !m-0 p-0">
                                {surahDetails?.surahName}
                            </h1>
                            <p className="text-sm font-normal text-gray-800 !m-0 p-0">Ayahs: {surahDetails?.totalAyah}</p>
                        </div>
                        <div className="text-3xl text-gray-800" dir="rtl" style={{ fontFamily: 'UthmanicHafs1' }}>
                            {surahDetails?.surahNameArabicLong}
                        </div>
                    </div>
                </div>

                {loading ? <SingleAyatSkeleton /> :
                    <div className="rounded-3xl bg-white/50 backdrop-blur-md shadow-md flex items-center justify-between p-4 mb-6">
                        {/* Left side (Surah name + subtitle) */}
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-semibold text-gray-800 !m-0">{surahDetails?.surahName}</h2>
                            <p className="text-sm text-gray-500 !m-0 ">{surahDetails?.surahNameTranslation}</p>
                        </div>

                        {/* Right side (Dropdown + buttons) */}
                        <div className="flex items-center gap-2 bg-white/05 backdrop-blur-md shadow-sm p-2 rounded-xl  ">
                            <div className='common-dropdown'>
                                <Select
                                    value={selectedAudio}
                                    style={{ width: 200 }}
                                    onChange={handleChange}
                                    options={suraAudio || []}
                                />
                            </div>
                            {/* Play Button */}
                            <Button
                                shape="circle"
                                icon={<Icon icon={isPlaying ? "iconoir:pause-solid" : "iconoir:play-solid"} width="20" height="20" />}
                                className="bg-white !shadow-sm !w-10 !h-10 !border-none"
                                onClick={handlePlay}
                            />
                            {/* Download Button */}
                            <Button
                                shape="circle"
                                icon={<Icon icon="material-symbols:download-rounded" width="20" height="20" />}
                                className="bg-white !shadow-sm !w-10 !h-10 !border-none"
                                onClick={downloadAudio}
                            />
                        </div>
                    </div>}
                <div className='flex flex-col gap-4'>
                    {Array.from({ length: surahDetails?.totalAyah || 0 }).map((_, i) => (
                        <SingleAyat key={i} surahId={surahDetails!.surahNo} ayatId={i + 1} />
                    ))}
                </div>
            </div>
                <AudioPlayer tracks={[{ title: surahDetails?.surahName || "Surah", src: surahDetails?.audio[0]?.url || "" }]} />
        </div>
    )
}

export default page