
export interface PrayerData {
    code: number;
    status: string;
    data: {
        times: {
            Fajr: string;
            Sunrise: string;
            Dhuhr: string;
            Asr: string;
            Sunset: string;
            Maghrib: string;
            Isha: string;
            Imsak: string;
            Midnight: string;
            Firstthird: string;
            Lastthird: string;
        };
        date: {
            readable: string;
            timestamp: string;
            hijri: {
                date: string;
                format: string;
                day: string;
                weekday: {
                    en: string;
                    ar: string;
                };
                month: {
                    en: string;
                    ar: string;
                };
                year: string;
            };
        };
        prohibited_times: {
            sunrise: {
                start: string;
                end: string;
            };
            noon: {
                start: string;
                end: string;
            };
            sunset: {
                start: string;
                end: string;
            };
        }
        timezone: {
            name: string;
            now: string;
            offset: string;
        }
    };
};
