"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { Timeline } from "antd";

import { useCurrentLocation } from "@/app/hooks/useCurrentLocation";
import { islamApi } from "@/services/islamicApi/allIslamicApi";
import type { PrayerData } from "@/types/prayerData";
import { format, parse, subMinutes } from "date-fns";

// Static icons
import Fajr from "../../public/prayer/fajr.png";
import Dhuhr from "../../public/prayer/dhuhr.png";
import Asr from "../../public/prayer/asr.png";
import Maghrib from "../../public/prayer/maghrib.png";
import Isha from "../../public/prayer/isha.png";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type PrayerItem = {
    name: "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
    icon: any;
    time: Date;
    lastTime: Date;
};

type ProhibitedInterval = {
    name: "After Sunrise" | "Zenith (Before Dhuhr)" | "Before Maghrib";
    start: Date;
    end: Date;
};

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const todayISODate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const parseLocalTime = (timeHHmm: string, baseDateISO = todayISODate()) =>
    new Date(`${baseDateISO}T${timeHHmm}:00`);

const subMinutesFromDate = (date: Date, minutes: number) =>
    new Date(date.getTime() - minutes * 60000);

const formatDiff = (ms: number) => {
    if (ms <= 0) return "Now";
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`;
};

const within = (d: Date, start: Date, end: Date) => d >= start && d <= end;

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const PrayerTime: React.FC = () => {
    // 🔹 Location hook
    const { coords, loading: locationLoading, error, setCoords } =
        useCurrentLocation();

    // 🔹 API data
    const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Single ticking clock
    const [tick, setTick] = useState<number>(() => Date.now());

    // ── Fetch prayer times when coords available
    useEffect(() => {
        if (!coords) return;
        let mounted = true;
        (async () => {
            setIsLoading(true);
            try {
                const response = await islamApi.getPrayerTime(
                    String(coords.lat),
                    String(coords.lon)
                );
                if (mounted) setPrayerData(response);
            } catch (error) {
                console.error("Error fetching prayer times:", error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [coords]);

    // ── Build prayers & prohibited intervals
    const { prayers, prohibited } = useMemo(() => {
        if (!prayerData)
            return { prayers: [] as PrayerItem[], prohibited: [] as ProhibitedInterval[] };

        const times = prayerData.data.times;
        const today = todayISODate();

        const fajr = parseLocalTime(times.Fajr, today);
        const sunrise = parseLocalTime(times.Sunrise, today);
        const dhuhr = parseLocalTime(times.Dhuhr, today);
        const asr = parseLocalTime(times.Asr, today);
        const maghrib = parseLocalTime(times.Maghrib, today);
        const isha = parseLocalTime(times.Isha, today);

        // next day fajr (for Isha end)
        const fajrNextDay = new Date(fajr.getTime());
        fajrNextDay.setDate(fajrNextDay.getDate() + 1);

        const p: PrayerItem[] = [
            { name: "Fajr", icon: Fajr, time: fajr, lastTime: subMinutesFromDate(sunrise, 1) },
            { name: "Dhuhr", icon: Dhuhr, time: dhuhr, lastTime: subMinutesFromDate(asr, 1) },
            { name: "Asr", icon: Asr, time: asr, lastTime: subMinutesFromDate(maghrib, 15) },
            { name: "Maghrib", icon: Maghrib, time: maghrib, lastTime: subMinutesFromDate(isha, 1) },
            { name: "Isha", icon: Isha, time: isha, lastTime: subMinutesFromDate(fajrNextDay, 1) },
        ];

        const afterSunriseEnd = new Date(sunrise.getTime() + 20 * 60000);
        const beforeDhuhrStart = new Date(dhuhr.getTime() - 5 * 60000);
        const beforeMaghribStart = new Date(maghrib.getTime() - 15 * 60000);

        const pr: ProhibitedInterval[] = [
            { name: "After Sunrise", start: sunrise, end: afterSunriseEnd },
            { name: "Zenith (Before Dhuhr)", start: beforeDhuhrStart, end: dhuhr },
            { name: "Before Maghrib", start: beforeMaghribStart, end: maghrib },
        ];

        return { prayers: p, prohibited: pr };
    }, [prayerData]);

    // ── Compute current & next prayer
    const { now, currentPrayer, nextPrayer, timeLeftToNext } = useMemo(() => {
        const now = new Date(tick);

        if (!prayers.length) {
            return {
                now,
                currentPrayer: null,
                nextPrayer: null,
                timeLeftToNext: "",
            };
        }

        const current = prayers.find((p) => within(now, p.time, p.lastTime)) || null;
        const upcoming = prayers.find((p) => p.time > now) || prayers[0];
        const diff = upcoming ? upcoming.time.getTime() - now.getTime() : 0;

        return {
            now,
            currentPrayer: current,
            nextPrayer: upcoming,
            timeLeftToNext: formatDiff(diff),
        };
    }, [prayers, tick]);

    // ── Prohibited countdowns
    const prohibitedCountdowns = useMemo(() => {
        const now = new Date(tick);
        return prohibited.map((t) => {
            if (now < t.start)
                return {
                    name: t.name,
                    countdown: `Starts in ${formatDiff(t.start.getTime() - now.getTime())}`,
                };
            if (within(now, t.start, t.end))
                return {
                    name: t.name,
                    countdown: `Ends in ${formatDiff(t.end.getTime() - now.getTime())}`,
                };
            return { name: t.name, countdown: "Ended" };
        });
    }, [prohibited, tick]);

    const activeProhibited = useMemo(() => {
        const now = new Date(tick);
        return prohibited.find((t) => within(now, t.start, t.end));
    }, [prohibited, tick]);

    // ── Single 1s interval
    useEffect(() => {
        const id = setInterval(() => setTick(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    // Reset Location
    const handleResetLocation = useCallback(() => {
        try {
            localStorage.removeItem("userCoords");
        } catch { }
        setCoords(null);
        window.location.reload();
    }, [setCoords]);

    // Hijri
    const hijriText = useMemo(() => {
        const h = prayerData?.data.date.hijri;
        if (!h) return "";
        return `${h.weekday.en}, ${h.day} ${h.month.en} ${h.year} AH`;
    }, [prayerData?.data.date.hijri]);

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-sky-800 to-emerald-700 text-white py-20">
            {/* <div className="bg-[url('/bg-1.jpg')] bg-cover bg-center bg-no-repeat  text-white"> */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
                    {/* Left Side: Info + Image */}
                    <div className="col-span-9 lg:col-span-4">
                        <h1 className="text-4xl font-bold mb-4">Prayer Times</h1>

                        <p className="text-gray-300 mb-2 flex items-center gap-2">
                            <Icon icon="fluent-color:calendar-32" width="26" height="26" />
                            {prayerData?.data.date.readable} ({hijriText})
                        </p>

                        <p className="text-gray-400 mb-6">
                            <span className="flex items-center gap-2">
                                <Icon icon="fluent-color:location-ripple-20" width="26" height="26" />
                                Location: {coords?.city || "Detecting..."}
                                <button
                                    className="cursor-pointer underline !text-yellow-600 hover:!text-yellow-700 rounded-md text-sm"
                                    onClick={handleResetLocation}
                                    type="button"
                                >
                                    Reset Location
                                </button>
                            </span>
                        </p>

                        <div className="w-full text-center opacity-60 h-[200px]">
                            <Image src='/banner-bg.png' alt="banner-bg" className="w-full" width={800} height={800} />
                        </div>

                        <div className="relative z-0">
                            <div className="absolute top-0 right-0 -z-10 opacity-20">
                                {currentPrayer ? (
                                    <Image src={currentPrayer.icon} alt="banner-bg" className="w-full" width={100} height={100} />
                                ) :
                                    (
                                        <Image src={nextPrayer?.icon} alt="banner-bg" className="w-full" width={100} height={100} />
                                    )
                                }
                            </div>
                            <div className="relative z-20">
                                <h1 className="text-4xl font-bold">{`${!currentPrayer?.name ? "Next" : "Current"}: ${!currentPrayer?.name ? nextPrayer?.name : currentPrayer?.name}`}</h1>

                                {currentPrayer ? (
                                    <div className="flex flex-col gap-4">
                                        <p className="text-lg text-white !m-0 flex items-center gap-2">
                                            <Icon icon="fluent-color:calendar-clock-16" width="30" height="30" /> Time Start : {currentPrayer.time.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })}
                                        </p>
                                        <p className="text-lg text-yellow-400 !m-0 flex items-center gap-2"><Icon icon="fluent-color:clock-alarm-20" width="30" height="30" /> Time Left : {timeLeftToNext}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <p className="text-lg text-white !m-0 flex items-center gap-2">
                                            <Icon icon="fluent-color:calendar-clock-16" width="30" height="30" /> Time Start : {nextPrayer?.time.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })}
                                        </p>
                                        <p className="text-lg text-yellow-400 flex !m-0 items-center gap-2"><Icon icon="fluent-color:clock-alarm-20" width="30" height="30" /> Time Left : {timeLeftToNext}</p>
                                    </div>

                                )}
                            </div>
                            {activeProhibited && (
                                <div className="grid grid-cols-1 gap-4 mt-4 relative z-20">
                                    <div className="p-2 rounded-2xl bg-red-400/40 border border-red-400">
                                        <p className="text-yellow-200 text-sm !m-0 flex items-center gap-2">
                                            <Icon icon="fluent-emoji-flat:prohibited" width="20" height="20" /> Prohibited time is running:
                                            {
                                                prohibitedCountdowns.find((c) => c.name === activeProhibited.name)?.countdown
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="my-6 grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-20">
                                <div className="flex items-center gap-4 bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                    <div className="bg-white/20 p-2 rounded-xl">
                                        <Icon icon="f7:moon-zzz" width="30" height="30" />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm text-gray-300 !m-0">Sehri time Start</p>
                                        <p className="!text-lg text-white !font-semibold !m-0 leading-4">
                                            {prayerData?.data?.times?.Fajr
                                                ? format(
                                                    subMinutes(
                                                        parse(prayerData.data.times.Fajr, "HH:mm", new Date()),
                                                        1
                                                    ),
                                                    "hh:mm a"
                                                )
                                                : "--"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                    <div className="bg-white/20 p-2 rounded-xl">
                                        <Icon icon="solar:sunset-linear" width="30" height="30" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm text-gray-300 !m-0">Iftar time</p>
                                        <p className="!text-lg text-white !font-semibold !m-0 leading-4">
                                            {prayerData?.data?.times?.Maghrib
                                                ? format(
                                                    parse(prayerData.data.times.Maghrib, "HH:mm", new Date()),
                                                    "hh:mm a"
                                                )
                                                : "--"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 italic text-sm text-center relative z-20">
                                Note: Prayer times are calculated based on your location. Please ensure your device's location services are enabled for accurate results.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Prayer Times + Prohibited */}
                    <div className="space-y-10 col-span-9 lg:col-span-5">
                        {/* ✅ Prayer Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {prayers.map((p) => {
                                const isNext = nextPrayer?.name === p.name;
                                return (
                                    <div
                                        key={p.name}
                                        className={`relative p-3 rounded-2xl shadow-lg backdrop-blur-md border transition-transform duration-300 ${isNext ? "bg-yellow-400/20 border-yellow-300 scale-102" : "bg-white/10 border-white/20"
                                            }`}
                                    >
                                        {isNext && (
                                            <span className="absolute -top-3 right-3 bg-yellow-400 text-black px-2 py-1 text-xs rounded-full">
                                                Next
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Image src={p.icon} alt={p.name} width={40} height={40} />
                                            <h3 className="text-xl font-semibold flex items-center gap-2 !m-0">{p.name}</h3>
                                        </div>
                                        <div className="mt-6 ml-4">
                                            <Timeline
                                                items={[
                                                    {
                                                        children: (
                                                            <div className="flex flex-col gap-1">
                                                                <p className="text-sm text-gray-300 !m-0 !mt-0.5">Start time</p>
                                                                <p className="!text-lg text-white !font-semibold !m-0">
                                                                    {p.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                                </p>
                                                            </div>
                                                        ),
                                                    },
                                                    {
                                                        children: (
                                                            <div className="flex flex-col gap-1">
                                                                <p className="text-sm text-gray-300 !m-0 !mt-0.5">End time</p>
                                                                <p className="!text-lg text-white !font-semibold !m-0">
                                                                    {p.lastTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                                </p>
                                                            </div>
                                                        ),
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ✅ Prohibited Times */}
                        {/* <div>
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-2xl font-bold !m-0">🚫 Prohibited Times</h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {prohibited.map((t) => (
                                    <div key={t.name} className="p-4 rounded-2xl bg-red-400/40 border border-red-400">
                                        <h3 className="text-lg text-red-400 font-semibold">{t.name}</h3>
                                        <p className="text-sm">From: {t.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                                        <p className="text-sm !m-0">To: {t.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                                        <p className="text-xs text-yellow-200 mt-1">
                                            {prohibitedCountdowns.find((c) => c.name === t.name)?.countdown}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrayerTime;
