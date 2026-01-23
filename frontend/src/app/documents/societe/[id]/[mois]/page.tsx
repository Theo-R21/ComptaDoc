"use client"

import Button from "@/src/app/components/button";
import {useEffect, useState} from "react";
import {apiFetch} from "@/src/hook/userRefresh";
import {useDebounce} from "@/src/hook/useDebounce";
import {DocumentsList} from "@/src/models/documents/documents.model";
import {UploadDocumentModal} from "@/src/app/documents/societe/[id]/[mois]/UploadDocumentModal";
import {useParams, useSearchParams} from "next/navigation";

// type PageProps = {
//     params: {
//         id: string
//         mois: string
//     }
//     searchParams: {
//         monthId: number
//     }
// }

export default function Page() {
    const params = useParams()
    const searchParams = useSearchParams()

    const id = params.id
    const mois = params.mois as string
    const monthId = Number(searchParams.get("monthId"))

    const [data, setData] = useState<DocumentsList[]>([])
    const [loading, setLoading] = useState(false)
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize] = useState(12)
    const [totalCount, setTotalCount] = useState(0)
    const totalPages = Math.ceil(totalCount / pageSize)
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search)
    const [openUpload, setOpenUpload] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const url = new URL(`/documents/${id}/months/${monthId}/`, window.location.origin);
                url.searchParams.set("page", (pageIndex + 1).toString());
                url.searchParams.set("page_size", pageSize.toString());

                if (debouncedSearch) {
                    url.searchParams.set("search", debouncedSearch);
                }

                const res = await apiFetch(url.pathname + "?" + url.searchParams.toString());
                const json = await res.json();

                setData(json.results);
                setTotalCount(json.count);
            } catch (error) {
                console.error("Erreur API :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [pageIndex, pageSize, debouncedSearch, id, monthId]);
    console.log(data)

    return (
        <>

            <div className="w-full min-h-screen bg-gray-50 px-6 py-6 space-y-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Documents du client {id}
                    </h1>
                    <p className="text-primary2">
                        Vue du mois : {mois}
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
                    <div className="bg-white rounded-xl shadow p-6 space-y-4 w-full">
                        <h2 className="font-medium text-gray-800">
                            Vue d’ensemble
                        </h2>

                        <div className="flex justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Documents</p>
                                <p className="text-2xl font-semibold">80</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Factures</p>
                                <p className="text-2xl font-semibold">40%</p>
                            </div>
                        </div>

                        <div className="h-36 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            Graphique circulaire
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6 xl:col-span-2 w-full">
                        <h2 className="font-medium text-gray-800 mb-4">
                            Activité mensuelle
                        </h2>

                        <div className="h-auto bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            Graphique barres
                        </div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-4 w-full">
                    <div className="flex flex-wrap gap-3 flex-1">
                        <input
                            type="text"
                            placeholder="Rechercher par nom, date..."
                            className="flex-1 min-w-[260px] border border-primary1 text-secondary1 rounded-lg px-4 py-2 text-sm"
                        />

                        <select className="border border-primary1 rounded-lg text-secondary1 px-3 py-2 text-sm">
                            <option>Type de document</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="calltoaction1"
                            className="font-medium text-sm px-4 py-2 rounded-lg"
                            onClick={() => setOpenUpload(true)}
                        >
                            Téléverser un fichier
                        </Button>

                        <Button variant="secondary1" className="font-medium text-sm px-4 py-2 rounded-lg">
                            Télécharger la sélection
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow w-full overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-primary1 text-white">
                        <tr className="text-calltoaction1">
                            <th className="p-3 w-10">
                                <input type="checkbox"/>
                            </th>
                            <th className="p-3 text-left">Nom du document</th>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-left">Date de publication</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="text-black">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="p-4 text-center text-gray-500 italic"
                                >
                                    Aucun document disponible
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr
                                    key={index}
                                    className="border-b last:border-none hover:bg-gray-50"
                                >
                                    <td className="p-3">
                                        <input type="checkbox"/>
                                    </td>
                                    <td className="p-3">{item.nom}</td>
                                    <td className="p-3">{item.type.nom}</td>
                                    <td className="p-3">
                                        {item.date_publication
                                            ? new Date(item.date_publication).toLocaleDateString("fr-FR")
                                            : "-"}
                                    </td>
                                    <td className="p-3 text-right space-x-2">
                                        <button className="hover:text-black text-gray-500">👁</button>
                                        <button className="hover:text-black text-gray-500">⬇</button>
                                    </td>
                                </tr>
                            ))
                        )}

                        </tbody>
                    </table>

                    <div className="flex justify-end mt-2 p-2">
                        <div className="flex items-center gap-1 bg-primary1 px-2 py-1 rounded-md shadow-sm">

                            <button
                                onClick={() => setPageIndex(0)}
                                disabled={pageIndex === 0}
                                className="px-2 py-1 rounded  text-calltoaction1 disabled:opacity-40">
                                «
                            </button>

                            <button
                                onClick={() => setPageIndex(p => Math.max(p - 1, 0))}
                                disabled={pageIndex === 0}
                                className="px-2 py-1 rounded  text-calltoaction1 disabled:opacity-40">
                                ‹
                            </button>

                            <button
                                onClick={() => setPageIndex(0)}
                                className={`px-2 py-1 rounded ${pageIndex === 0 ? "bg-calltoaction1 text-primary1 font-semibold" : "bg-primary1 text-white"}`}>
                                1
                            </button>

                            {pageIndex > 2 && (
                                <span className="px-2 text-primary2 select-none">…</span>
                            )}

                            {pageIndex > 0 && pageIndex < totalPages - 1 && (
                                <button className="px-2 py-1 rounded bg-calltoaction1 text-primary1 font-semibold">
                                    {pageIndex + 1}
                                </button>
                            )}

                            {pageIndex < totalPages - 3 && (
                                <span className="px-2 text-primary2 select-none">…</span>
                            )}

                            {totalPages > 1 && (
                                <button
                                    onClick={() => setPageIndex(totalPages - 1)}
                                    className={`px-2 py-1 rounded ${pageIndex === totalPages - 1 ? "bg-calltoaction1 text-primary1 font-semibold" : " bg-primary1 text-white"}`}>
                                    {totalPages}
                                </button>
                            )}

                            <button
                                onClick={() =>
                                    setPageIndex(p =>
                                        (p + 1) * pageSize < totalCount ? p + 1 : p
                                    )}
                                disabled={pageIndex === totalPages - 1}
                                className="px-2 py-1 rounded  text-calltoaction1 disabled:opacity-40">
                                ›
                            </button>

                            <button onClick={() => setPageIndex(totalPages - 1)} disabled={pageIndex === totalPages - 1}
                                    className="px-2 py-1 rounded  text-calltoaction1 disabled:opacity-40">
                                »
                            </button>

                        </div>
                    </div>
                </div>
            </div>
            <UploadDocumentModal
                open={openUpload}
                onOpenChange={setOpenUpload}
                societeId={id}
                monthId={monthId}
            />
        </>
    )

}

