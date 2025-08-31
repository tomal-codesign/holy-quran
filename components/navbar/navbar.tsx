// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { title: "Home", href: "/pages/home", icon: "mdi:home" },
        { title: "Surahs", href: "/pages/surah", icon: "mdi:book-open-page-variant" },
        { title: "Zakat Calculator", href: "/pages/zakat-calculator", icon: "mdi:book-education-outline" },
        { title: "Tafseer", href: "/tafseer", icon: "mdi:book-education-outline" },
        { title: "Bookmarks", href: "/bookmark", icon: "mdi:bookmark" },
        { title: "Dua", href: "/dua", icon: "mdi:hand-pray", isButton: true },
    ];

    return (
        <nav className="bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-lg sticky top-0  z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link href="/pages/home" className="flex items-center space-x-2">
                        <Icon icon="mdi:islam" className="h-7 w-7 text-yellow-300" />
                        <span className="font-bold text-xl tracking-wide">
                            Holy Quran
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6 font-medium">
                        {menuItems.map((item) =>
                            item.isButton ? (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="bg-yellow-400 text-green-900 px-4 py-2 rounded-full font-semibold shadow hover:bg-yellow-300 transition flex items-center gap-1"
                                >
                                    <Icon icon={item.icon} className="w-5 h-5" /> {item.title}
                                </Link>
                            ) : (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="hover:text-yellow-300 transition flex items-center gap-1"
                                >
                                    <Icon icon={item.icon} className="w-5 h-5" /> {item.title}
                                </Link>
                            )
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="focus:outline-none"
                        >
                            {isOpen ? (
                                <Icon icon="mdi:close" className="w-7 h-7 text-yellow-300" />
                            ) : (
                                <Icon icon="mdi:menu" className="w-7 h-7 text-yellow-300" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-green-800">
                    <div className="px-4 py-3 space-y-2 font-medium">
                        {menuItems.map((item) =>
                            item.isButton ? (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className=" bg-yellow-400 text-green-900 px-4 py-2 rounded-full font-semibold text-center hover:bg-yellow-300 transition flex items-center justify-center gap-2"
                                >
                                    <Icon icon={item.icon} className="w-5 h-5" /> {item.title}
                                </Link>
                            ) : (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className=" hover:text-yellow-300 flex items-center gap-2"
                                >
                                    <Icon icon={item.icon} className="w-5 h-5" /> {item.title}
                                </Link>
                            )
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
