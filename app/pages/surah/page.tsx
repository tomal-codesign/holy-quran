import { Input } from '@/components/ui/input'
import { Icon } from '@iconify/react/dist/iconify.js'
import React from 'react'
// import img from  "../../../public"

const page = () => {
    return (
        <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className='bg-[url(/search-bg.jpg)] px-16 py-20 flex flex-col items-center gap-6 rounded-3xl'>
                    <h2 className='text-3xl font-bold text-white'>Read the Quran, feel the peace.</h2>
                    <div className='relative w-full md:w-1/2 lg:w-1/2 rounded-full'>
                        <Input
                            className='w-full rounded-full bg-white/30 backdrop-blur-md h-11 text-white border border-white/40 pl-11 pr-18'
                            placeholder='Search Surah...' />
                        <Icon className='absolute left-4 top-1/2 -translate-y-1/2' icon="ic:sharp-search" width="20" height="20" />
                        <span className='absolute right-4 top-1/2 -translate-y-1/2 text-[#ddd] text-[12px] bg-white/30 py-1 px-3 rounded-full'>Enter</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page