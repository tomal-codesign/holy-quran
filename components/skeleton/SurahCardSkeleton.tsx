import React from 'react';
import { Skeleton, Button } from 'antd';
import { Icon } from '@iconify/react/dist/iconify.js';

const SurahCardSkeleton = () => {
    return (
        <div className='rounded-3xl bg-white/50 backdrop-blur-md shadow-md flex items-center animate-pulse'>
            {/* ID placeholder */}
            <div className='w-18 h-full flex items-center justify-center text-xl font-bold text-gray-400 rounded-l-lg border-r border-gray-300'>
                <Skeleton.Avatar shape="square" size={40} active />
            </div>

            {/* Content placeholder */}
            <div className='p-4 flex-1 flex justify-between items-center gap-4'>
                <div className='flex flex-col gap-1 flex-1'>
                    {/* Surah Name */}
                    <Skeleton.Input style={{ width: '60%' }} active size="default" />

                    {/* Translation */}
                    <Skeleton.Input style={{ width: '40%' }} active size="small" />

                    {/* Revelation Place + Ayahs */}
                    <div className='flex items-center gap-2'>
                        <Skeleton.Avatar shape="square" size={20} active />
                        <Skeleton.Input style={{ width: 60 }} active size="small" />
                    </div>
                </div>

                {/* Bookmark button */}
                <div>
                    <Button className='ml-auto !w-13 !h-13 flex justify-center items-center !shadow-none !rounded-full !bg-transparent !border-none'>
                        <Icon icon="solar:bookmark-linear" width="24" height="24" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SurahCardSkeleton;
