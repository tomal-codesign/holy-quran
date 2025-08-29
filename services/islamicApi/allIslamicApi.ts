import { ZakatNisabType } from "@/types/zakatNisabType";

const apiKey = "DLkEQmpZUzbG5lFJ54G9CabGtEHjwS6jB0bkdVgkSI1azuRi"

export const islamApi = {
    getZakatNisab: async (): Promise<ZakatNisabType> => {
        const response = await fetch(`https://islamicapi.com/api/v1/zakat-nisab/?standard=classical&currency=bdt&unit=g&api_key=${apiKey}`);
        if (!response.ok) {
            throw new Error('Failed to fetch zakat nisab');
        }
        return response.json();
    },
    getPrayerTime: async (latitude: string, longitude: string): Promise<any> => {
        const response = await fetch(`https://islamicapi.com/api/v1/prayer-time/?lat=${latitude}&lon=${longitude}&method=1&school=2&api_key=${apiKey}`);
        if (!response.ok) {
            throw new Error('Failed to fetch prayer times');
        }
        return response.json();
    },
}