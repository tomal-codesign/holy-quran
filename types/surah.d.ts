export interface surah {
    id: number;
    surahName: string;
    surahNameArabic: string;
    surahNameArabicLong: number;
    surahNameTranslation: string;
    revelationPlace: string;
    totalAyah: number;
}
export interface surahDetails extends surah {
    surahName: string;
    surahNameArabic: string;
    surahNameArabicLong: number;
    surahNameTranslation: string;
    revelationPlace: string;
    totalAyah: number;
    surahNo: number;
    audio: { reciter: string; url: string, originalUrl: string }[];
    english: string[];
    arabic1: string[];
    arabic2: string[];
    bengali: string[];
    urdu: string[];
    uzbek: string[];
}
export interface ayatDetails extends surah {
    surahName: string;
    surahNameArabic: string;
    surahNameArabicLong: number;
    surahNameTranslation: string;
    revelationPlace: string;
    totalAyah: number;
    surahNo: number;
    ayahNo: number;
    audio: { reciter: string; url: string, originalUrl: string }[];
    english: string;
    arabic1: string;
    arabic2: string;
    bengali: string;
    urdu: string;
    uzbek: string;
}