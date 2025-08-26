"use client"
import SingleAyatSkeleton from '@/components/single-ayat-skeleton/SingleAyatSkeleton';
import SingleAyat from '@/components/single-ayat/SingleAyat';
import { surahApi } from '@/services/allSurahApi';
import { tafsirApi } from '@/services/tafsirApi';
import { ayatDetails } from '@/types/surah';
import { TafsirByAyat } from '@/types/tafsirByAyat';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { use, useEffect, useState } from 'react'

const page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const surahId = searchParams.get('surahId');
    const ayatId = searchParams.get('ayatId');
    const [isLoading, setIsLoading] = React.useState(false);
    const [tafsirDataBangla, setTafsirDataBangla] = React.useState<TafsirByAyat | null>(null);
    const [tafsirDataEnglish, setTafsirDataEnglish] = React.useState<TafsirByAyat | null>(null);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                if (surahId && ayatId) {
                    const engliashData = await tafsirApi.getTafsirByAyah(parseInt(surahId), parseInt(ayatId), "en-al-jalalayn");
                    setTafsirDataBangla(engliashData);
                    const banglaData = await tafsirApi.getTafsirByAyah(parseInt(surahId), parseInt(ayatId), "bn-tafsir-ahsanul-bayaan");
                    setTafsirDataEnglish(banglaData);
                }
            } catch (error) {
                console.error('Error fetching ayah details:', error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [surahId, ayatId]);

    return (
        <div>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10'>
                <SingleAyat ayatId={ayatId ? parseInt(ayatId) : undefined} surahId={surahId ? parseInt(surahId) : undefined} isTafsir={false} />
                {isLoading ? <SingleAyatSkeleton /> :
                    <div className='rounded-3xl bg-white/50 backdrop-blur-md shadow-md flex flex-col justify-between mt-6'>
                        <div className='flex items-center gap-2 p-4 border-b border-gray-300 w-full'>
                            <h1 className='text-xl font-medium text-gray-800 !m-0'>Tafsir/তাফসির</h1>
                        </div>
                        <div className='p-4 flex flex-col gap-4'>
                            <p className='text-md text-gray-800 !m-0 leading-8'>{tafsirDataEnglish?.text}</p>
                            <p className='text-md text-gray-800 !m-0 leading-8'>{tafsirDataBangla?.text}</p>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default page