"use client";
import React from 'react'
import { Button, Select, Space } from "antd";
import { DownloadOutlined, PlayCircleOutlined, DownOutlined } from "@ant-design/icons";

const page = () => {
    const items = [
        { value: "1", label: "Mishary Rashid Al Afasy" },
        { value: "2", label: "Abdul Basit" },
        { value: "3", label: "Saad Al Ghamdi" },
    ]
    const handleChange = (value: string) => {
        console.log(`selected ${value}`);
    };

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10'>


            <div
                className="rounded-3xl bg-white/50 backdrop-blur-md shadow-md flex items-center justify-between p-4"
            >
                {/* Left side (Surah name + subtitle) */}
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold text-gray-800 !m-0">Al-Faatiha</h2>
                    <p className="text-sm text-gray-500 !m-0 ">The Opening</p>
                </div>

                {/* Right side (Dropdown + buttons) */}
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md p-2 rounded-xl border border-[#99B8E4]">
                    <Select
                        defaultValue="1"
                        style={{ width: 200 }}
                        onChange={handleChange}
                        options={items}
                    />
                    {/* Play Button */}
                    <Button
                        shape="circle"
                        icon={<PlayCircleOutlined />}
                        className="bg-white shadow-sm"
                    />

                    {/* Download Button */}
                    <Button
                        shape="circle"
                        icon={<DownloadOutlined />}
                        className="bg-white shadow-sm"
                    />
                </div>
            </div>
        </div>
    )
}

export default page