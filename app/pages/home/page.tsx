"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useCurrentLocation } from "@/app/hooks/useCurrentLocation";
import { islamApi } from "@/services/islamicApi/allIslamicApi";
import Image from "next/image";
import { PrayerData } from "@/types/prayerData";

// 🔹 Icon Map for each prayer
const iconMap: Record<string, string> = {
  Fajr: "solar:sunrise-bold-duotone",
  Sunrise: "mdi:weather-sunset-up",
  Dhuhr: "mdi:white-balance-sunny",
  Asr: "mdi:weather-sunny-alert",
  Sunset: "mdi:weather-sunset-down",
  Maghrib: "mdi:mosque",
  Isha: "mdi:weather-night",
  Imsak: "mdi:alarm",
  Midnight: "mdi:moon-waning-crescent",
  Firstthird: "mdi:clock-time-five-outline",
  Lastthird: "mdi:clock-time-nine-outline",
};

const Page = () => {
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const coords = useCurrentLocation();

  // 🔹 Fetch Prayer Times when location is available
  useEffect(() => {
    if (!coords) {
      console.warn("Waiting for location...");
      return;
    }

    const { lat, lon, city } = coords;
    if (!lat || !lon) {
      console.error("Please allow location access to get prayer times");
      return;
    }

    (async () => {
      setIsLoading(true);
      try {
        const response = await islamApi.getPrayerTime(lat.toString(), lon.toString());
        setPrayerData(response);
        console.log("Prayer data:", response, "City:", city);
      } catch (error) {
        console.error("Error fetching prayer times:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [coords]);

  // 🔹 Calculate Next Prayer after prayerData arrives
  useEffect(() => {
    if (!prayerData) return;

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const prayerTimes = [
      { name: "Fajr", time: prayerData.data.times.Fajr },
      { name: "Dhuhr", time: prayerData.data.times.Dhuhr },
      { name: "Asr", time: prayerData.data.times.Asr },
      { name: "Maghrib", time: prayerData.data.times.Maghrib },
      { name: "Isha", time: prayerData.data.times.Isha },
    ];

    const upcoming = prayerTimes.find((p) => {
      const prayerDate = new Date(`${today}T${p.time}:00`);
      return prayerDate > now;
    });

    setNextPrayer(upcoming || prayerTimes[0]);
  }, [prayerData]);

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-sky-800 to-emerald-700 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Side: Info + Image */}
          <div>
            <h1 className="text-4xl font-bold mb-4">Prayer Times</h1>
            <p className="text-gray-300 mb-2">
              📅 {prayerData?.data.date.readable} ({prayerData?.data.date.hijri.weekday.en},{" "}
              {Number(prayerData?.data.date.hijri.day) + 1} {prayerData?.data.date.hijri.month.en} {prayerData?.data.date.hijri.year} AH)
            </p>
            <p className="text-gray-400 mb-6">
              📍 Location: {coords?.city || "Detecting..."}
            </p>

            <div className="w-full text-center">
              <Image
                className="mx-auto"
                src="/prayer-time.png"
                alt="Pattern Overlay"
                width={400}
                height={400}
              />
            </div>
          </div>

          {/* Right Side: Prayer Times */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-6xl z-10">
            {prayerData &&
              Object.entries(prayerData.data.times).map(([name, time]) => {
                const isNext = nextPrayer?.name === name;
                return (
                  <div
                    key={name}
                    className={`relative p-5 rounded-2xl shadow-lg backdrop-blur-md border transition-transform duration-300 ${isNext
                        ? "bg-yellow-400/20 border-yellow-300 scale-105"
                        : "bg-white/10 border-white/20"
                      }`}
                  >
                    {isNext && (
                      <span className="absolute -top-3 right-3 bg-yellow-400 text-black px-2 py-1 text-xs rounded-full">
                        Next
                      </span>
                    )}
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Icon icon={iconMap[name] || "mdi:mosque"} className="text-yellow-300 text-2xl" />
                      {name}
                    </h3>
                    <p className="text-2xl font-bold mt-2">{time}</p>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
