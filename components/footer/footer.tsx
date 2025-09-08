// components/Footer.tsx
export default function Footer() {
    return (
        <footer className="relative bg-gradient-to-r from-green-800 via-emerald-700 to-green-800 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white">
            {/* Top subtle border */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-8">

                {/* Quranic Phrase */}
                <div className="text-center md:text-left max-w-md">
                    <p className="italic text-emerald-100 text-sm md:text-base leading-relaxed">
                        “This is the Book about which there is no doubt, a guidance for those conscious of Allah.”
                    </p>
                    <span className="block text-xs mt-2 text-emerald-300">— Surah Al-Baqarah 2:2</span>
                </div>

                {/* Copyright + Developer Credit */}
                <div className="text-center md:text-right space-y-1">
                    <p className="text-sm text-gray-200">
                        © {new Date().getFullYear()} Holy Quran. All rights reserved.
                    </p>
                    <p className="text-sm">
                        Design & Developed by{" "}
                        <a href="https://tomal-codesign.vercel.app" target="_blank" className="font-semibold bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 text-transparent bg-clip-text hover:from-emerald-200 hover:via-white hover:to-emerald-300 transition-all duration-300">
                            Tomal Ahmed
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
