"use client";

import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {apiFetch} from "@/src/hook/userRefresh";


export default function Documents() {
    const router = useRouter();
    const [data, setData] = useState<[]>([]);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState("");
    // const {refreshCurrentUser} = useCurrentUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiFetch("/societe/");
                const json = await res.json();
                setData(json);
                console.log("Données reçues :", json);
            } catch (error) {
                console.error("Erreur API :", error);
            }
        };

        fetchData();
    }, []);
    return (
        <main className="flex-1 p-8 space-y-8 overflow-auto">
            <header>
                <h1 className="text-2xl font-bold text-primary1">Documents</h1>
                <p className="text-primary2 ">
                    Gérer et consultez facilement tous vos documents client
                </p>

                <div className="m-5">
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((item, index) => (
                        <div key={index} className="bg-primary1 text-white rounded-xl p-6 space-y-2 relative cursor-pointer hover:shadow-lg transition-shadow">
                            {JSON.stringify(item)}
                        </div>
                    ))}
                </div>
            </header>
        </main>

    );
}
