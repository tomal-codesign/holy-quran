"use client";
import { islamApi } from "@/services/islamicApi/allIslamicApi";
import { ZakatNisabType } from "@/types/zakatNisabType";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Input, Select } from "antd";
import React, { useEffect, useState } from "react";


const page = () => {
    const [wealth, setWealth] = useState<number>(0);
    const [standard, setStandard] = useState<"gold" | "silver">("silver");
    const [zakat, setZakat] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [zakatNisab, setZakatNisab] = useState<ZakatNisabType | null>(null);
    const [zakatDropdown, setZakatDropdown] = useState<{ value: string; label: string }[] | null>();

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const response = await islamApi.getZakatNisab();
                console.log(response);
                const dropdownOptions = Object.entries(response.data.nisab_thresholds).map(
                    ([key, value]: [string, any]) => ({
                        value: key, // gold / silver
                        label: `${key.toUpperCase()} (Weight: ${value.weight}g, Nisab: ৳${value.nisab_amount.toFixed(2)})`,
                        ...value, // spread the weight, unit_price, nisab_amount if needed
                    })
                );
                console.log(dropdownOptions)
                setZakatNisab(response);
                setZakatDropdown(dropdownOptions);
            } catch (error) {
                console.error("Error calculating zakat:", error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [wealth, standard]);

    const calculateZakat = () => {
        const nisab = zakatNisab?.data.nisab_thresholds[standard].nisab_amount;
        if (wealth >= nisab!) {
            const zakatAmount = (wealth * parseFloat(zakatNisab?.data.zakat_rate ?? "0")) / 100;
            setZakat(zakatAmount);
        } else {
            setZakat(0);
        }
    };

    return (
        <div>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10'>

                <div className="rounded-3xl bg-white/50 backdrop-blur-md shadow-md p-4 mb-6">
                    <h1 className="text-2xl font-bold mb-4 text-gray-800 !mb-4">📊 Zakat Nisab Data</h1>
                    <div className="p-4 rounded-2xl border border-green-600/40 bg-green-600/10 mb-4">
                        <p className="text-green-800 font-medium">
                            ✅ <strong>Zakat Rate:</strong> {zakatNisab?.data.zakat_rate}
                        </p>
                        <p className="text-green-700 text-sm mt-2 !mb-1">
                            {zakatNisab?.data.notes}
                        </p>
                        <p className="text-green-700 text-sm mt-2 !mb-0">
                            Last Updated: {zakatNisab?.updated_at.split("T")[0] || "N/A"}
                        </p>
                    </div>


                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 ">
                        {/* GOLD */}
                        <div className="p-4 border border-yellow-600/40 rounded-2xl bg-yellow-600/10 ">
                            <h2 className="text-lg font-semibold text-yellow-800">Gold</h2>
                            <p className="text-gray-600">Weight: {zakatNisab?.data.nisab_thresholds.gold.weight}</p>
                            <p className="text-gray-600">Unit Price: ৳{zakatNisab?.data.nisab_thresholds.gold.unit_price.toFixed(2)}</p>
                            <p className="text-gray-600">Nisab Amount: ৳{zakatNisab?.data.nisab_thresholds.gold.nisab_amount.toFixed(2)}</p>
                        </div>

                        {/* SILVER */}
                        <div className="p-4 border border-sky-600/40 bg-sky-600/10 rounded-2xl">
                            <h2 className="text-lg font-semibold text-sky-600">Silver</h2>
                            <p className="text-gray-600">Weight: {zakatNisab?.data.nisab_thresholds.silver.weight}</p>
                            <p className="text-gray-600">Unit Price: ৳{zakatNisab?.data.nisab_thresholds.silver.unit_price.toFixed(2)}</p>
                            <p className="text-gray-600">Nisab Amount: ৳{zakatNisab?.data.nisab_thresholds.silver.nisab_amount.toFixed(2)}</p>
                        </div>

                    </div>
                </div>
                <div className="flex justify-center">
                    <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl border border-green-100 flex flex-col p-6 w-full lg:w-2/5 transition-transform ">

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <Icon icon="fluent:calculator-multiple-20-regular" className="text-green-600 w-8 h-8" />
                            <h1 className="text-2xl font-bold text-gray-800 !m-0">Zakat Calculator</h1>
                        </div>

                        {/* Wealth Input */}
                        <div className="mb-5 flex flex-col gap-1">
                            <label className="block text-gray-700 mb-1 font-medium">
                                Total Wealth (BDT)
                            </label>
                            <Input
                                type="number"
                                value={wealth}
                                onChange={(e) => setWealth(Number(e.target.value))}
                                className="w-full !h-10 border !rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
                                placeholder="Enter your total wealth"
                            />
                        </div>

                        {/* Standard Selection */}
                        <div className="mb-5 calculator-dropdown flex flex-col gap-1">
                            <label className="block text-gray-700 mb-1 font-medium">
                                Nisab Standard
                            </label>
                            <Select
                                value={standard}
                                onChange={(value) => setStandard(value as "gold" | "silver")}
                                className="w-full !h-10 !rounded-xl"
                                options={zakatDropdown?.map((option) => ({
                                    value: option.value,
                                    label: option.label,
                                }))}
                            />
                        </div>

                        {/* Calculate Button */}
                        <button
                            onClick={calculateZakat}
                            className="w-full py-3 cursor-pointer rounded-xl text-white font-semibold shadow-md bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition"
                        >
                            Calculate
                        </button>

                        {/* Result */}
                        {zakat !== null && (
                            <div className={`mt-6 p-5 rounded-2xl border shadow-inner flex items-center gap-3 ${zakat > 0 ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
                                <Icon
                                    icon={zakat > 0 ? "streamline-freehand:cash-payment-bag-1" : "mdi:close-circle-outline"}
                                    className={`w-6 h-6 ${zakat > 0 ? "text-green-600" : "text-red-500"}`}
                                />                                {zakat > 0 ? (
                                    <p className="text-green-800 font-medium !m-0" >
                                        You need to pay <b>৳{zakat.toFixed(2)}</b> as Zakat.
                                    </p>
                                ) : (
                                    <p className="text-red-600 font-medium !m-0" >
                                        Your wealth is below the Nisab. No Zakat due.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default page