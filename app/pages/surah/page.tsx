"use client"
import { surahApi } from '@/services/allSurahApi';
import { surah } from '@/types/surah';
import { Icon } from '@iconify/react/dist/iconify.js'
import { Input } from 'antd';
import React, { useEffect, useState } from 'react'
import SurahCard from '@/components/surah-card/SurahCard';
import SurahCardSkeleton from '@/components/skeleton/SurahCardSkeleton';
import Link from 'next/link';

const page = () => {
    // Fetch surahs data from the API
    const [loading, setLoading] = useState(false);
    const [allSurahs, setAllSurahs] = React.useState<surah[]>([]);
    const [surahs, setSurahs] = React.useState<surah[]>([]);
    useEffect(() => {
        const fetchSurahs = async () => {
            setLoading(true);
            try {
                const data = await surahApi.getAllSurahs();
                data.map((surah: surah, index: number) => surah.id = index + 1);
                setAllSurahs(data);
                setSurahs(data);
            } catch (error) {
                console.error('Error fetching surahs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSurahs();
    }, []);
    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toLowerCase().trim();

        if (!query) {
            setSurahs(allSurahs);
            return;
        }

        // Split query into words
        const words = query.split(/\s+/);

        const filtered = allSurahs.filter((surah) => {
            const name = surah.surahName.toLowerCase();
            const translation = surah.surahNameTranslation.toLowerCase();

            // Check if any word is included
            return words.some(word => name.includes(word) || translation.includes(word));
        });

        setSurahs(filtered);
    };


    return (
        <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <div className='bg-[url(/search-bg.jpg)] px-16 py-20 flex flex-col items-center gap-6 rounded-3xl'>
                    <h2 className='text-3xl font-bold text-white'>Read the Quran, feel the peace.</h2>
                    <div className='relative w-full md:w-1/2 lg:w-1/2 rounded-full text-white'>
                        <Input
                            className='w-full !rounded-full !bg-white/30 backdrop-blur-md h-11 !text-white border !border-white/40 pl-11 pr-18'
                            size="large" placeholder="Search Surah..."
                            prefix={<Icon icon="ic:sharp-search" width="20" height="20" />}
                            onChange={onSearch}
                        />
                    </div>
                </div>
            </div>
            <div>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10'>
                    <h2 className='text-2xl font-bold mb-6 text-gray-800'>Surahs</h2>
                    <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
                        {loading ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <SurahCardSkeleton key={index} />
                            ))
                        ) : surahs.length === 0 ? (
                            <div className='col-span-2 text-center text-gray-500'>No Surahs found</div>
                        ) : null}
                        {surahs.map((surah, index) => (
                            <Link href={`/pages/surah/${surah.id}`} key={index} >
                                <SurahCard surah={surah} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page