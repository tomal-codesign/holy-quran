import { useState, useEffect } from "react";

type LocationData = {
    lat: number;
    lon: number;
    city?: string;
} | null;

export function useCurrentLocation() {
    const [location, setLocation] = useState<LocationData>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            console.error("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                    // Call OpenStreetMap reverse geocoding API (free)
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
                    );
                    const data = await res.json();

                    const city =
                        data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        data.address?.state ||
                        "Unknown";

                    setLocation({ lat, lon, city });
                } catch (error) {
                    console.error("Failed to fetch city name:", error);
                    setLocation({ lat, lon, city: "Unknown" });
                }
            },
            (error) => {
                console.error("Error getting location:", error);
            }
        );
    }, []);

    return location;
}
