import React from 'react'
import { Button, Image } from 'antd';
import { Icon } from '@iconify/react/dist/iconify.js';

type surah = {
    id: number;
    surahName: string;
    surahNameArabic: string;
    surahNameArabicLong: number;
    surahNameTranslation: string;
    revelationPlace: string;
    totalAyah: number;
}


const SurahCard = ({ surah }: { surah: surah }) => {
    return (
        <div className=' rounded-3xl bg-white/50 backdrop-blur-md shadow-md flex items-center'>
            <div className='w-18 h-[80px] flex items-center justify-center text-xl font-bold text-gray-700 rounded-l-lg border-r border-gray-300'>
                {(surah.id).toString().padStart(2, "0")}
            </div>
            <div className='p-4 flex-1 flex justify-between items-center gap-4'>
                <div className='flex flex-col gap-1.5'>
                    <h3 className='text-lg font-medium text-gray-800 !m-0'>{surah.surahName}</h3>
                    <p className='text-md text-gray-800 !m-0'>{surah.surahNameTranslation}</p>
                    <div className='text-sm text-gray-500 flex items-center gap-2'>
                        <Image src={surah.revelationPlace == "Mecca" ? "/Mecca.png" : "/Madina.png"} alt="quran" width={20} height={20} />
                        <span>{surah.totalAyah} Ayahs</span>
                    </div>
                </div>
                <div>
                    <Button className='ml-auto !w-13 !h-13 flex justify-center items-center !shadow-none !rounded-full !bg-transparent !border-none hover:!bg-white/50 transition-colors duration-300'>
                        <Icon icon="solar:bookmark-linear" width="24" height="24" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SurahCard