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
            <p>Societe</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {date.map((item, index) => (
                    <div
                        key={index}
                        className="bg-primary1 text-white rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="font-semibold text-2xl leading-tight">
                                    {item.month_name} {item.year}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-1 text-sm text-gray-200">
                            <p>
                                Propriétaire :
                            </p>
                            <p>Numéro de téléphone :</p>
                        </div>

                        <div className="flex justify-between mt-4">
                            <div className="flex gap-2">
                                <FaLock className="text-red-600 text-lg"/>
                                <Switch
                                    checked={item.status === "OPEN"}
                                    onCheckedChange={(checked) => handleChange(item, checked)}
                                />
                                <FaLockOpen className="text-calltoactionsuccess text-lg"/>
                            </div>
                            <FaArrowRight className="text-calltoaction1 text-lg" onClick={() => router.push(`/documents/societe/${id}/${item.month_name}?monthId=${item.id}`)}/>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}