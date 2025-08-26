import { TafsirByAyat } from "@/types/tafsirByAyat";

export const tafsirApi = {
    getTafsirByAyah: async (surahId: number, ayahId: number, tafsir:string): Promise<TafsirByAyat> => {
        const response = await fetch(`https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${tafsir}/${surahId}/${ayahId}.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch tafsir');
        }
        return response.json();
    }
}