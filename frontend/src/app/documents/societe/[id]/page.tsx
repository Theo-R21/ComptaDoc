"use client";
import {FaArrowLeft, FaArrowRight, FaLock, FaLockOpen} from "react-icons/fa";
import {Switch} from "@/src/app/components/ui/switch";
import {useEffect, useState} from "react";
import {apiFetch} from "@/src/hook/userRefresh";
import {useParams, useRouter} from "next/navigation";
import {SocieteMonthInfo} from "@/src/models/societe/societe.model";
import {hasRole} from "@/src/lib/permissions";
import {useCurrentUser} from "@/src/hook/useCurrent";

export default function Societe() {
    const {id} = useParams()
    const [date, setDate] = useState<SocieteMonthInfo[]>([]);
    const [years, setYears] = useState<number[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const router = useRouter();
    const {user} = useCurrentUser();

    useEffect(() => {
        const fetchDataYear = async () => {
            try {
                const res = await apiFetch(`/societe/${id}/year`);
                const json: number[] = await res.json();

                setYears(json);
                if (json.length > 0) {
                    setSelectedYear(json[0]);
                }
            } catch (error) {
                console.error("Erreur API:", error);
            }
        };

        fetchDataYear();
    }, [id]);

    useEffect(() => {
        if (!selectedYear) return;

        const fetchMonths = async () => {
            try {
                let url = `/societe/${id}/months/?year=${selectedYear}`;

                if (statusFilter !== "ALL") {
                    url += `&status=${statusFilter}`;
                }

                const res = await apiFetch(url);
                const json = await res.json();
                setDate(json);
            } catch (error) {
                console.error("Erreur API :", error);
            }
        };

        fetchMonths();
    }, [id, selectedYear, statusFilter]);


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
            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary1">Gestion des périodes</h1>
                    <p className="text-sm text-primary2">
                        Année fiscale & statut des mois
                    </p>
                    {hasRole(user, ["comptable"]) && (
                        <p
                            onClick={() => router.push(`/documents/comptable`)}
                            className="flex items-center mt-2 gap-2 cursor-pointer text-primary2 transition-all duration-300
                   hover:text-primary1 hover:translate-x-1"
                        >
                            <FaArrowLeft/>
                            retour
                        </p>
                    )}

                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
                        <span className="text-sm text-secondary2">Année</span>
                        <select
                            className="bg-transparent text-sm font-medium text-secondary1 focus:outline-none"
                            value={selectedYear ?? ""}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
                        <span className="text-sm text-secondary2">Statut</span>
                        <select
                            className="bg-transparent text-sm font-medium text-secondary1 focus:outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">Tous</option>
                            <option value="OPEN">Ouverts</option>
                            <option value="CLOSED">Fermés</option>
                        </select>

                    </div>
                </div>
            </header>

            <div className="mb-6 h-px w-full bg-gray-200"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {date.map((item, index) => {
                    const isOpen = item.status === "OPEN";

                    return (
                        <div
                            key={index}
                            className={`group relative rounded-xl border p-5 transition-all
                                        ${isOpen
                                            ? "bg-white border-primary2 shadow-md hover:shadow-lg cursor-pointer"
                                            : "bg-gray-100 border-gray-200 opacity-80 cursor-not-allowed"
                                        } hover:-translate-y-0.5`}
                            onClick={() => {if (isOpen) {router.push(`/documents/societe/${id}/${item.month_name}?monthId=${item.id}`);}}}
                        >

                            {isOpen && (
                                <span className="absolute left-0 top-4 h-12 w-1 rounded-r bg-primary1"/>
                            )}

                            <div>
                                <p className="text-lg font-semibold tracking-tight text-primary1">
                                    {item.month_name} {item.year}
                                </p>
                                <p
                                    className={`mt-1 text-sm font-medium ${isOpen ? "text-calltoactionsuccess" : "text-red-700"}`}
                                >
                                    {isOpen ? "Période ouverte" : "Période fermée"}
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-6">
                                <div className="flex items-center gap-3 bg-primary3/60 rounded-full px-3 py-1">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-calltoaction1/20">
                                        <FaLock className={`text-xs ${isOpen ? "text-secondary2/40" : "text-calltoaction2"}`}/>
                                    </div>

                                    <Switch
                                        checked={isOpen}
                                        onCheckedChange={(checked) =>
                                            handleChange(item, checked)
                                        }
                                        className="data-[state=checked]:bg-calltoaction1 data-[state=unchecked]:bg-secondary2 transition-colors"
                                    />
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary1/40">
                                        <FaLockOpen
                                            className={`text-sm ${isOpen ? "text-primary1" : "text-primary1/60"}`}
                                        />
                                    </div>
                                </div>

                                <button
                                    className={`p-2 rounded-lg transition ${isOpen ? "bg-primary3/60" : "cursor-not-allowed opacity-50"}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isOpen) {
                                            router.push(
                                                `/documents/societe/${id}/${item.month_name}?monthId=${item.id}`
                                            );
                                        }
                                    }}
                                >
                                    <FaArrowRight
                                        className={`${isOpen ? "text-primary2 group-hover:translate-x-1" : "text-secondary2"} transition-all`}
                                    />
                                </button>
                            </div>
                        </div>
                    );
                })}

            </div>
        </main>
    )
}