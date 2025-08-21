export const surahApi = {
    getAllSurahs: async () => {
        const response = await fetch('https://quranapi.pages.dev/api/surah.json');
        if (!response.ok) {
            throw new Error('Failed to fetch surahs');
        }
        return response.json();
    }
}