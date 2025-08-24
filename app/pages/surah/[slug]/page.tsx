"use client";
import React, { use, useEffect, useState } from 'react'
import { Button, Select, Space } from "antd";
import { Icon } from '@iconify/react/dist/iconify.js';
import { useParams } from 'next/navigation';
import { surahApi } from '@/services/allSurahApi';
import { surahDetails } from '@/types/surah';

const page = () => {
    const params = useParams<{ slug: string }>();
    const [loading, setLoading] = useState(false);
    const [surahDetails, setSurahDetails] = useState<surahDetails | null>(null);
    const [suraAudio, setSuraAudio] = useState<{ value: string, label: string }[]>([]);
    const [selectedAudio, setSelectedAudio] = useState<string | undefined>(undefined);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    console.log("Slug:", params.slug);
    const items = [
        { value: "1", label: "Mishary Rashid Al Afasy" },
        { value: "2", label: "Abdul Basit" },
        { value: "3", label: "Saad Al Ghamdi" },
    ]

    useEffect(() => {
        // Fetch surah details using params.slug here
        (async () => {
            setLoading(true);
            try {
                const data = await surahApi.getSurahById(Number(params.slug));
                console.log("Surah Data:", data);
                const suraAudio = Object.values(data.audio).map((item: any) => ({
                    value: item.originalUrl,
                    label: item.reciter
                }));
                setSurahDetails(data);
                setSuraAudio(suraAudio);
                if (suraAudio.length > 0) {
                    setSelectedAudio(suraAudio[0].value);
                    handlePlayUrl({ value: suraAudio[0].value });
                }
            } catch (error) {
                console.error('Error fetching surah details:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, [params.slug]);

    const handleChange = (value: string) => {
        console.log(`selected ${value}`);
        setSelectedAudio(value);
        handlePlayUrl({ value });
    };

    const handlePlayUrl = async ({ value }: { value: string }) => {
        console.log(`Playing audio from URL: ${value}`);
        setAudioUrl(value);
        if (audioObj) audioObj.pause();

        const newAudio = new Audio(value);
        setAudioObj(newAudio);
        setIsPlaying(false)
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

    // const handleChange = (value: string) => {
    //     setSelectedAudio(value);

    //     // Stop old audio
    //     if (audioObj) {
    //         audioObj.pause();
    //     }

    //     // Create new audio
    //     const audio = new Audio(value);
    //     setAudioObj(audio);

    //     // Auto-play new audio
    //     audio.play().catch(console.error);
    //     setIsPlaying(true);
    // };




    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10'>


            <div
                className="rounded-3xl bg-white/50 backdrop-blur-md shadow-md flex items-center justify-between p-4"
            >
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
                        className="bg-white shadow-md !w-10 !h-10 !border-none"
                        onClick={handlePlay}
                    />

                    {/* Download Button */}
                    <Button
                        shape="circle"
                        icon={<Icon icon="material-symbols:download-rounded" width="20" height="20" />}
                        className="bg-white shadow-md !w-10 !h-10 !border-none"
                    />
                </div>
            </div>
        </div>
    )
}

export default page