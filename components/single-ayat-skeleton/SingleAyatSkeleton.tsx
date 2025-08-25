"use client";

import React from "react";

const SingleAyatSkeleton = () => {
    return (
        <div className="rounded-3xl bg-white/50 backdrop-blur-md shadow-md animate-pulse flex flex-col justify-between">

            {/* Top header */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-300 w-full">
                <div className="bg-gray-300 h-[56px] w-16 rounded-xl shadow-sm"></div>
                <div className="flex items-center gap-2 flex-1 bg-gray-200/50 backdrop-blur-md shadow-sm p-2 rounded-xl">
                    <div className="bg-gray-300 h-10 w-48 rounded-md"></div> {/* dropdown */}
                    <div className="bg-gray-300 h-10 w-10 rounded-full"></div> {/* play button */}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-4">
                <div className="bg-gray-300 h-10 w-full rounded-md ml-auto"></div> {/* Arabic text */}
                <div className="bg-gray-300 h-6 w-full rounded-md"></div> {/* English text */}
                <div className="bg-gray-300 h-6 w-full rounded-md"></div> {/* Bangla text */}
            </div>
        </div>
    );
};

export default SingleAyatSkeleton;
