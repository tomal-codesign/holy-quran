"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useCurrentLocation } from "@/app/hooks/useCurrentLocation";
import { islamApi } from "@/services/islamicApi/allIslamicApi";
import Image from "next/image";
import { PrayerData } from "@/types/prayerData";
import Fajr from "../../../public/prayer/fajr.png";
import Dhuhr from "../../../public/prayer/dhuhr.png";
import Asr from "../../../public/prayer/asr.png";
import Maghrib from "../../../public/prayer/maghrib.png";
import Isha from "../../../public/prayer/isha.png";
import { Timeline } from "antd";


const Page = () => {
  const [coords, setCoords] = useState<{ lat: number; lon: number; city?: string } | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date } | null>(null);
  const [CurrentPrayer, setCurrentPrayer] = useState<{ name: string; time: Date } | null>(null);
  const [prohibitedCountdowns, setProhibitedCountdowns] = useState<
    { name: string; countdown: string }[]
  >([]);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<
    { name: string; icon: any; time: Date; lastTime: Date }[]
  >([]);
  const [prohibitedTimes, setProhibitedTimes] = useState<
    { name: string; start: Date; end: Date }[]
  >([]);

  // ✅ Check localStorage first
  useEffect(() => {
    const savedCoords = localStorage.getItem("userCoords");

    if (savedCoords) {
      setCoords(JSON.parse(savedCoords));
    } else {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newCoords = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            city: "",
          };

          try {
            // 🌍 Reverse geocoding (OpenStreetMap API)
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
            );
            const data = await res.json();

            newCoords.city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.county ||
              data.address.state ||
              "Unknown";

          } catch (err) {
            console.error("City fetch error:", err);
            newCoords.city = "Unknown";
          }

          setCoords(newCoords);
          localStorage.setItem("userCoords", JSON.stringify(newCoords));
        },
        (err) => {
          console.error("Location error:", err);
        }
      );
    }
  }, []);



  // 🔹 Fetch Prayer Times
  useEffect(() => {
    if (!coords) return;

    (async () => {
      setIsLoading(true);
      try {
        const response = await islamApi.getPrayerTime(coords.lat.toString(), coords.lon.toString());
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
    };
    const fajrNextDay = new Date(parseTime(prayerData.data.times.Fajr));
    fajrNextDay.setDate(fajrNextDay.getDate() + 1);

    // ✅ Prayer times
    const prayers = [
      {
        name: "Fajr",
        icon: Fajr,
        time: parseTime(prayerData.data.times.Fajr),
        lastTime: subtractOneMinute(prayerData.data.times.Sunrise),
      },
      {
        name: "Dhuhr",
        icon: Dhuhr,
        time: parseTime(prayerData.data.times.Dhuhr),
        lastTime: subtractOneMinute(prayerData.data.times.Asr),
      },
      {
        name: "Asr",
        icon: Asr,
        time: parseTime(prayerData.data.times.Asr),
        lastTime: subtractMinutes(prayerData.data.times.Maghrib, 15),
      },
      {
        name: "Maghrib",
        icon: Maghrib,
        time: parseTime(prayerData.data.times.Maghrib),
        lastTime: subtractOneMinute(prayerData.data.times.Isha),
      },
      {
        name: "Isha",
        icon: Isha,
        time: parseTime(prayerData.data.times.Isha),
        lastTime: new Date(fajrNextDay.getTime() - 60 * 1000),
      },
    ];

    setPrayerTimes(prayers);



    const now = new Date();
    // ✅ Current Prayer
    const currentPrayer = prayers.find(
      (p) => p.time <= now && now <= p.lastTime
    );
    setCurrentPrayer(currentPrayer || prayers[0]);

    const upcoming = prayers.find((p) => p.time > now);
    setNextPrayer(upcoming || prayers[0]);

    // ✅ Prohibited times
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

  useEffect(() => {
    if (!nextPrayer) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = nextPrayer.time.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Now");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer]);

  useEffect(() => {
    if (prohibitedTimes.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();

      const updated = prohibitedTimes.map((t) => {
        if (now < t.start) {
          // Before prohibited time starts
          const diff = t.start.getTime() - now.getTime();
          return { name: t.name, countdown: "Starts in " + formatDiff(diff) };
        } else if (now >= t.start && now <= t.end) {
          // During prohibited time
          const diff = t.end.getTime() - now.getTime();
          return { name: t.name, countdown: "Ends in " + formatDiff(diff) };
        } else {
          // Already ended
          return { name: t.name, countdown: "Ended" };
        }
      });

      setProhibitedCountdowns(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [prohibitedTimes]);

  // 🔹 Helper function to format time difference
  const formatDiff = (diff: number) => {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`;
  };
  const prohibitedCountdown = prohibitedCountdowns.find((c) => c.name === prohibitedTimes.map(t => t.name).find(name => {
    const now = new Date();
    const t = prohibitedTimes.find(pt => pt.name === name);
    return t && now >= t.start && now <= t.end;
  }));

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-sky-800 to-emerald-700 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
          {/* Left Side: Info + Image */}
          <div className="col-span-9 lg:col-span-4">
            <h1 className="text-4xl font-bold mb-4">Prayer Times</h1>
            <p className="text-gray-300 mb-2 flex items-center gap-2">
              <Icon icon="fluent-color:calendar-32" width="26" height="26" />{prayerData?.data.date.readable} (
              {prayerData?.data.date.hijri.weekday.en},{" "}
              {Number(prayerData?.data.date.hijri.day) + 1}{" "}
              {prayerData?.data.date.hijri.month.en}{" "}
              {prayerData?.data.date.hijri.year} AH)
            </p>
            <p className="text-gray-400 mb-6">
              <span className="flex items-center gap-2">
                <Icon icon="fluent-color:location-ripple-20" width="26" height="26" /> Location: {coords?.city || "Detecting..."}
                <button
                  className="cursor-pointer underline !text-yellow-600 hover:!text-yellow-700 rounded-md text-sm"
                  onClick={() => {
                    localStorage.removeItem("userCoords");
                    setCoords(null);
                    window.location.reload();
                  }}
                  type="button">
                  Reset Location
                </button>
              </span>
            </p>

            <div className="w-full text-center py-10">
              <Image
                className=""
                src="/banner.png"
                alt="Pattern Overlay"
                width={400}
                height={400}
              />
            </div>
            <div>
              <h1>Now: {CurrentPrayer?.name} prayer</h1>
              <div>
                <h1>Now: {CurrentPrayer?.name} prayer</h1>
                <p className="text-lg text-yellow-400 mt-2">
                  ⏳ Time Left ({CurrentPrayer?.name}): {timeLeft}
                </p>
              </div>
              <p className="text-gray-400 italic text-sm text-center">
                Note: Prayer times are calculated based on your location. Please ensure your device's location services are enabled for accurate results.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div
                  className="p-4 rounded-2xl bg-red-400/40 border border-red-400"
                >
                  {prohibitedCountdown ? (
                    <div className="p-4 rounded-2xl bg-red-400/40 border border-red-400">
                      <p className="text-yellow-200 text-sm mt-2 italic">
                        ⏳ Prohibited time is running: {prohibitedCountdown.countdown}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>


          </div>


          {/* Right Side: Prayer Times + Prohibited */}
          <div className="space-y-10 col-span-9 lg:col-span-5">
            {/* ✅ Prayer Times */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {prayerTimes.map((props) => {
                const isNext = nextPrayer?.name === props.name;
                return (
                  <div
                    key={props.name}
                    className={`relative p-3 rounded-2xl shadow-lg backdrop-blur-md border transition-transform duration-300 ${isNext
                      ? "bg-yellow-400/20 border-yellow-300 scale-102"
                      : "bg-white/10 border-white/20"
                      }`}
                  >
                    {isNext && (
                      <span className="absolute -top-3 right-3 bg-yellow-400 text-black px-2 py-1 text-xs rounded-full">
                        Next
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <Image src={props.icon} alt={props.name} width={40} height={40} />
                      <h3 className="text-xl font-semibold flex items-center gap-2 !m-0">
                        {props.name}
                      </h3>
                    </div>
                    <div className="mt-6 ml-4">
                      <Timeline
                        items={[
                          {
                            children: <div className="flex flex-col gap-1">
                              <p className="text-sm text-gray-300 !m-0 !mt-0.5">Start time</p>
                              <p className="!text-lg text-white !font-semibold !m-0">
                                {props.time.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>,
                          },
                          {
                            children: <div className="flex flex-col gap-1">
                              <p className="text-sm text-gray-300 !m-0 !mt-0.5">End time</p>
                              <p className="!text-lg text-white !font-semibold !m-0">
                                {props.lastTime.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>,
                          },
                        ]}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ✅ Prohibited Times 🚀 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold !m-0">🚫 Prohibited Times</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {prohibitedTimes.map((t) => (
                  <div
                    key={t.name}
                    className="p-4 rounded-2xl bg-red-400/40 border border-red-400"
                  >
                    <h3 className="text-lg text-red-400 font-semibold">{t.name}</h3>
                    <p className="text-sm">
                      From:{" "}
                      {t.start.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm !m-0">
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
