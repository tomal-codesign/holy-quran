// app/hooks/useCurrentLocation.ts
"use client";
import { useEffect, useRef, useState } from "react";

type Coords = { lat: number; lon: number; city?: string };

export function useCurrentLocation() {
    const [coords, setCoords] = useState<Coords | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const locationLoadedRef = useRef(false);

    useEffect(() => {
        if (locationLoadedRef.current) return;
        locationLoadedRef.current = true;

        // 🔹 First check saved coords
        try {
            const saved = localStorage.getItem("userCoords");
            if (saved) {
                setCoords(JSON.parse(saved));
                setLoading(false);
                return;
            }
        } catch {
            console.warn("LocalStorage unavailable");
        }

        // 🔹 Permissions check
        if (navigator.permissions) {
            navigator.permissions
                .query({ name: "geolocation" as PermissionName })
                .then((result) => {
                    console.log("Geo Permission:", result.state);
                    if (result.state === "denied") {
                        setError("Geolocation denied by browser");
                    }
                })
                .catch(() => { });
        }

        // 🔹 Request current location
        if (!navigator.geolocation) {
            setError("Geolocation not supported");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const base: Coords = {
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    city: "",
                };

                try {
                    const controller = new AbortController();
                    const id = setTimeout(() => controller.abort(), 8000);

                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
                        { signal: controller.signal }
                    );

                    clearTimeout(id);

                    if (res.ok) {
                        const data = await res.json();
                        base.city =
                            data?.address?.city ||
                            data?.address?.town ||
                            data?.address?.village ||
                            data?.address?.county ||
                            data?.address?.state ||
                            "Unknown";
                    } else {
                        base.city = "Unknown";
                    }
                } catch {
                    base.city = "Unknown";
                }

                setCoords(base);
                setLoading(false);

                try {
                    localStorage.setItem("userCoords", JSON.stringify(base));
                } catch { }
            },
            (err) => {
                console.error("Location error:", err);
                setError("Location unavailable, fallback to Dhaka");
                setCoords({ lat: 23.8103, lon: 90.4125, city: "Dhaka Division" });
                setLoading(false);
            }
        );
    }, []);

    return { coords, loading, error, setCoords };
}
