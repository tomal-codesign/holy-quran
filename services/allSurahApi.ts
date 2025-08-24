import { surahDetails } from "@/types/surah";

export const surahApi = {
    getAllSurahs: async () => {
        const response = await fetch('https://quranapi.pages.dev/api/surah.json');
        if (!response.ok) {
            throw new Error('Failed to fetch surahs');
        }
        return response.json();
    },
    getSurahById: async (id: number): Promise<surahDetails> => {
        const response = await fetch(`https://quranapi.pages.dev/api/${id}.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch surah');
        }
        return response.json();
    },
}