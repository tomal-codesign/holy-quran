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
  Maghrib: "mdi:weather-sunset-down",
  Isha: "mdi:weather-night",
  Imsak: "mdi:alarm",
  Midnight: "mdi:moon-waning-crescent",
  Firstthird: "mdi:clock-time-five-outline",
  Lastthird: "mdi:clock-time-nine-outline",
};

const Page = () => {
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<
    { name: string; icon: string; time: Date; lastTime: Date }[]
  >([]);
  const [prohibitedTimes, setProhibitedTimes] = useState<
    { name: string; start: Date; end: Date }[]
  >([]);
  const coords = useCurrentLocation();

  // 🔹 Fetch Prayer Times when location is available
  useEffect(() => {
    if (!coords) return;

    const { lat, lon } = coords;
    if (!lat || !lon) return;

    (async () => {
      setIsLoading(true);
      try {
        const response = await islamApi.getPrayerTime(lat.toString(), lon.toString());
        setPrayerData(response);
      } catch (error) {
        console.error("Error fetching prayer times:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [coords]);

  // 🔹 Calculate Prayer Times + Prohibited Times
  useEffect(() => {
    if (!prayerData) return;

    const today = new Date().toISOString().split("T")[0];

    const parseTime = (time: string) => new Date(`${today}T${time}:00`);

    const subtractOneMinute = (time: string) => {
      const date = parseTime(time);
      date.setMinutes(date.getMinutes() - 1);
      return date;
    };
    const subtractMinutes = (time: string, minutes: number) => {
      const [hour, minute] = time.split(":").map(Number);
      const date = new Date();
      date.setHours(hour, minute);
      date.setMinutes(date.getMinutes() - minutes);
      return date;
    }

    // ✅ Prayer times
    const prayers = [
      {
        name: "Fajr",
        icon: iconMap.Fajr,
        time: parseTime(prayerData.data.times.Fajr),
        lastTime: subtractOneMinute(prayerData.data.times.Sunrise),
      },
      {
        name: "Dhuhr",
        icon: iconMap.Dhuhr,
        time: parseTime(prayerData.data.times.Dhuhr),
        lastTime: subtractOneMinute(prayerData.data.times.Asr),
      },
      {
        name: "Asr",
        icon: iconMap.Asr,
        time: parseTime(prayerData.data.times.Asr),
        lastTime: subtractMinutes(prayerData.data.times.Maghrib, 15),
      },
      {
        name: "Maghrib",
        icon: iconMap.Maghrib,
        time: parseTime(prayerData.data.times.Maghrib),
        lastTime: subtractOneMinute(prayerData.data.times.Isha),
      },
      {
        name: "Isha",
        icon: iconMap.Isha,
        time: parseTime(prayerData.data.times.Isha),
        lastTime: subtractOneMinute(prayerData.data.times.Fajr),
      },
    ];

    setPrayerTimes(prayers);

    // ✅ Next prayer calculation
    const now = new Date();
    const upcoming = prayers.find((p) => p.time > now);
    setNextPrayer(upcoming || prayers[0]);

    // ✅ Prohibited times calculation
    const sunrise = parseTime(prayerData.data.times.Sunrise);
    const dhuhr = parseTime(prayerData.data.times.Dhuhr);
    const maghrib = parseTime(prayerData.data.times.Maghrib);

    const afterSunrise = new Date(sunrise);
    afterSunrise.setMinutes(afterSunrise.getMinutes() + 20);

    const beforeDhuhr = new Date(dhuhr);
    beforeDhuhr.setMinutes(beforeDhuhr.getMinutes() - 5);

    const beforeMaghrib = new Date(maghrib);
    beforeMaghrib.setMinutes(beforeMaghrib.getMinutes() - 15);

    setProhibitedTimes([
      { name: "After Sunrise", start: sunrise, end: afterSunrise },
      { name: "Zenith (Before Dhuhr)", start: beforeDhuhr, end: dhuhr },
      { name: "Before Maghrib", start: beforeMaghrib, end: maghrib },
    ]);
  }, [prayerData]);

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-sky-800 to-emerald-700 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Info + Image */}
          <div>
            <h1 className="text-4xl font-bold mb-4">Prayer Times</h1>
            <p className="text-gray-300 mb-2">
              📅 {prayerData?.data.date.readable} (
              {prayerData?.data.date.hijri.weekday.en},{" "}
              {Number(prayerData?.data.date.hijri.day) + 1}{" "}
              {prayerData?.data.date.hijri.month.en}{" "}
              {prayerData?.data.date.hijri.year} AH)
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

          {/* Right Side: Prayer Times + Prohibited */}
          <div className="space-y-10">
            {/* ✅ Prayer Times */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {prayerTimes.map((props) => {
                const isNext = nextPrayer?.name === props.name;
                return (
                  <div
                    key={props.name}
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
                      <Icon
                        icon={props.icon || "mdi:mosque"}
                        className="text-yellow-300 text-2xl"
                      />
                      {props.name}
                    </h3>
                    <div className="flex flex-col items-start gap-2 mt-2">
                      <div>
                        <p className="text-sm">Start time</p>
                        <p className="text-md font-medium">
                          {props.time.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">End time</p>
                        <p className="text-md font-medium">
                          {props.lastTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ✅ Prohibited Times 🚀 */}
            <div>
              <h2 className="text-2xl font-bold mb-4">🚫 Prohibited Times</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {prohibitedTimes.map((t) => (
                  <div
                    key={t.name}
                    className="p-4 rounded-2xl bg-red-400/20 border border-red-300"
                  >
                    <h3 className="text-lg font-semibold">{t.name}</h3>
                    <p className="text-sm">
                      From:{" "}
                      {t.start.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm">
                      To:{" "}
                      {t.end.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
