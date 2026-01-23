"use client";
import {FaArrowRight, FaLock, FaLockOpen} from "react-icons/fa";
import {Switch} from "@/src/app/components/ui/switch";
import {useEffect, useState} from "react";
import {apiFetch} from "@/src/hook/userRefresh";
import {useParams, useRouter} from "next/navigation";
import {SocieteMonthInfo} from "@/src/models/societe/societe.model";

export default function Societe() {
    const {id} = useParams()
    const [date, setDate] = useState<SocieteMonthInfo[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = new URL(`/societe/${id}/months/`, window.location.origin);
                const res = await apiFetch(url.pathname);
                const json = await res.json();
                setDate(json)
            } catch (error) {
                console.error("Erreur API :", error);
            } finally {
                return
            }
        };

        fetchData();
    }, [id]);

    const handleChange = async (
        monthItem: SocieteMonthInfo,
        checked: boolean
    ) => {
        const newStatus = checked ? "OPEN" : "CLOSED";

        try {
            const url = new URL(`/societe/${id}/months/${monthItem.month}/`, window.location.origin);
            console.log(url)
            const res = await apiFetch(
                url.pathname,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({status: newStatus}),
                }
            );
            console.log(res)
            if (!res.ok) throw new Error("Erreur lors de la mise à jour");

            const updatedMonth = await res.json();

            setDate((prev) =>
                prev.map((item) =>
                    item.month === updatedMonth.month ? updatedMonth : item
                )
            );
        } catch (error) {
            console.error("Erreur API :", error);
        }
    };


    return (
        <main className="flex-1 p-8 overflow-auto bg-gray-50">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary1">Gestion des périodes</h1>
                    <p className="text-primary2">
                        Année fiscale & statut des mois
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Sélecteur année */}
                    <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
                        <span className="text-sm text-secondary2">Année</span>
                        <select
                            className="bg-transparent text-sm font-medium text-secondary1 focus:outline-none"
                        >
                            <option>2026</option>
                            <option>2025</option>
                            <option>2024</option>
                        </select>
                    </div>

                    {/* Sélecteur statut */}
                    <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
                        <span className="text-sm text-secondary2">Statut</span>
                        <select
                            className="bg-transparent text-sm font-medium text-secondary1 focus:outline-none"
                        >
                            <option>Tous</option>
                            <option>Ouvertes</option>
                            <option>Fermées</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="mb-6 h-px w-full bg-gray-200"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {date.map((item, index) => {
                    const isOpen = item.status === "OPEN"

                    return (
                        <div
                            key={index}
                            className={`
                                group relative rounded-xl border p-5
                                transition-all cursor-pointer
                                ${isOpen
                                ? "bg-white border-primary2 shadow-md hover:shadow-lg"
                                : "bg-gray-100 border-gray-200 opacity-80"}
                                hover:-translate-y-0.5
                            `}
                        >
                            {isOpen && (
                                <span className="absolute left-0 top-4 h-12 w-1 rounded-r bg-primary1"/>
                            )}

                            <div>
                                <p className="text-lg font-semibold tracking-tight text-primary1">
                                    {item.month_name} {item.year}
                                </p>

                                <p
                                    className={`mt-1 text-sm font-medium ${
                                        isOpen
                                            ? "text-calltoactionsuccess"
                                            : "text-red-700"
                                    }`}
                                >
                                    {isOpen
                                        ? "Période ouverte"
                                        : "Période fermée"}
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-6">
                                <div className="flex items-center gap-3 bg-primary3/60 rounded-full px-3 py-1">
                                    <div
                                        className="flex items-center justify-center w-6 h-6 rounded-full bg-calltoaction1/20">
                                        <FaLock
                                            className={`text-xs ${
                                                isOpen
                                                    ? "text-secondary2/40"
                                                    : "text-calltoaction2"
                                            }`}
                                        />
                                    </div>

                                    <Switch
                                        checked={isOpen}
                                        onCheckedChange={(checked) =>
                                            handleChange(item, checked)
                                        }
                                        className="
                                            data-[state=checked]:bg-calltoaction1
                                            data-[state=unchecked]:bg-secondary2
                                            transition-colors
                                        "
                                    />
                                    <div
                                        className="flex items-center justify-center w-6 h-6 rounded-full bg-primary1/40">
                                        <FaLockOpen
                                            className={`text-sm ${
                                                isOpen
                                                    ? "text-primary1"
                                                    : "text-primary1/60"
                                            }`}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        router.push(
                                            `/documents/societe/${id}/${item.month_name}?monthId=${item.id}`
                                        )
                                    }
                                    className="
                                        p-2 rounded-lg
                                        hover:bg-primary3/60
                                        transition
                                    "
                                >
                                    <FaArrowRight
                                        className="
                                            text-secondary2
                                            group-hover:text-primary2
                                            group-hover:translate-x-1
                                            transition-all
                                        "
                                    />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </main>
    )
}