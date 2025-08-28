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
}