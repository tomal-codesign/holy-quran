import { surahApi } from '@/services/allSurahApi';
import { Icon } from '@iconify/react/dist/iconify.js'
import { Button, Select } from 'antd'
import React, { use, useEffect, useState } from 'react'
import SingleAyatSkeleton from '../single-ayat-skeleton/SingleAyatSkeleton';
import { ayatDetails } from '@/types/surah';
type Props = {
    ayatId?: number;
    surahId?: any;
}

const SingleAyat = ({ ayatId, surahId }: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [ayahDetails, setAyahDetails] = useState<ayatDetails | null>(null);
    const [selectedAudio, setSelectedAudio] = useState<string | undefined>(undefined);
    const [suraAudio, setSuraAudio] = useState<{ value: string, label: string }[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                if (ayatId && surahId) {
                    const data = await surahApi.getAyahById(surahId, ayatId);
                    const suraAudio = Object.values(data.audio).map((item: any) => ({
                        value: item.originalUrl,
                        label: item.reciter
                    }));
                    setAyahDetails(data);
                    setSuraAudio(suraAudio);
                    if (suraAudio.length > 0) {
                        setSelectedAudio(suraAudio[0].value);
                        playAudio(suraAudio[0].value);
                    }
                }
            } catch (error) {
                console.error('Error fetching ayah details:', error);
            } finally {
                setIsLoading(false);
            }
        })();

    }, [ayatId]);

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

    const handleChange = (value: string) => {
        console.log(`selected ${value}`);
        setSelectedAudio(value);
        playAudio(value);
    };

    return (
        <>
            {isLoading ? <SingleAyatSkeleton /> :
                <div className="rounded-3xl bg-white/50 backdrop-blur-md shadow-md flex flex-col justify-between">
                    <div className='flex items-center gap-2 p-4 border-b border-gray-300 w-full'>
                        <div className='text-xl font-semibold text-gray-800 !m-0 bg-white h-[56px] px-5 flex items-center justify-center shadow-sm p-2 rounded-xl'>
                            {ayahDetails?.surahNo}.{ayahDetails?.ayahNo}
                        </div>
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
                        </div>
                    </div>
                    <div className='p-6 flex flex-col gap-6'>
                        <p className='text-gray-700 text-[36px] !m-0 text-right font-["BenSen"] leading-[1.6]'>{ayahDetails?.arabic1}</p>
                        <p className='text-gray-700 text-md !m-0 '>"{ayahDetails?.english}"</p>
                        <p className='text-gray-700 text-md font-["UthmanTNB"] !m-0'>"{ayahDetails?.bengali}"</p>
                    </div>
                </div>}
        </>
    )
}

export default SingleAyat