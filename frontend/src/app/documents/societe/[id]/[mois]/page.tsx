"use client"

import Button from "@/src/app/components/button";
import {useEffect, useState} from "react";
import {apiFetch} from "@/src/hook/userRefresh";
import {useDebounce} from "@/src/hook/useDebounce";
import {DocumentsList, TypeDocumentList} from "@/src/models/documents/documents.model";
import {UploadDocumentModal} from "@/src/app/documents/societe/[id]/[mois]/UploadDocumentModal";
import {useParams, useSearchParams} from "next/navigation";
import Pagination from "@/src/app/components/pagination";
import Searchbar from "@/src/app/components/searchbar";
import {TbDownload} from "react-icons/tb";
import {FaRegEye} from "react-icons/fa";
import {PdfViewerModal} from "@/src/app/documents/societe/[id]/[mois]/PDFViewModal";

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
    const [types, setTypes] = useState<TypeDocumentList[]>([])
    const [open, setOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const allSelected =
        data.length > 0 &&
        data.every(item => selectedIds.includes(item.id));

    const toggleAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.map(item => item.id));
        }
    };

    const toggleOne = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const openPdf = (url: string) => {
        setPdfUrl(`${process.env.NEXT_PUBLIC_API_URL}${url}`);
        setOpen(true);
    };

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const res = await apiFetch("/documents/types/")
                const json = await res.json()
                setTypes(Array.isArray(json) ? json : [])
            } catch (err) {
                console.error(err)
                setTypes([])
            }
        }
        fetchTypes()
    }, [])


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const url = new URL(`/documents/${id}/months/${monthId}/?type=${selectedType}`, window.location.origin);
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
    }, [pageIndex, pageSize, debouncedSearch, id, monthId, selectedType]);

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
                    <div className="flex flex-wrap gap-3 flex-1 items-center">
                        <div className="flex-1 min-w-[220px]">
                            <Searchbar
                                placeholder="Rechercher par nom de document, data..."
                                value={search}
                                onChange={(value) => {
                                    setSearch(value);
                                    setPageIndex(0);
                                }}
                            />
                        </div>

                        <select
                            className="border border-primary1 rounded-lg text-secondary1 px-3 py-2 text-sm min-w-[150px]"
                            value={selectedType ?? ""}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="null" selected>Tout les types</option>
                            {types.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nom}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                        <Button
                            variant="calltoaction1"
                            className="font-medium text-sm px-4 py-2 rounded-lg"
                            onClick={() => setOpenUpload(true)}
                        >
                            Téléverser un fichier
                        </Button>

                        <Button
                            variant="secondary1"
                            className="font-medium text-sm px-4 py-2 rounded-lg"
                        >
                            Télécharger la sélection
                        </Button>
                    </div>
                </div>


                <div className="bg-white rounded-xl shadow w-full overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-primary1 text-white">
                        <tr className="text-calltoaction1">
                            <th className="p-3 w-10">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                />
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
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => toggleOne(item.id)}
                                        />
                                    </td>
                                    <td className="p-3">{item.nom}</td>
                                    <td className="p-3">{item.type.nom}</td>
                                    <td className="p-3">
                                        {item.date_publication
                                            ? new Date(item.date_publication).toLocaleDateString("fr-FR")
                                            : "-"}
                                    </td>
                                    <td className="p-3 text-right space-x-2 text-xl">
                                        <button className="hover:text-black text-primary2"
                                                onClick={() => openPdf(item.path)}><FaRegEye/></button>
                                        <button className="hover:text-black text-primary2"><TbDownload/></button>
                                    </td>
                                </tr>
                            ))
                        )}

                        </tbody>
                    </table>

                    <Pagination
                        pageIndex={pageIndex}
                        totalPages={totalPages}
                        setPageIndex={setPageIndex}
                        pageSize={pageSize}
                        totalCount={totalCount}
                    />

                </div>
            </div>
            <UploadDocumentModal
                open={openUpload}
                onOpenChange={setOpenUpload}
                societeId={id}
                types={types}
                monthId={monthId}
            />
            <PdfViewerModal
                open={open}
                onOpenChange={setOpen}
                pdfUrl={pdfUrl}
            />
        </>
    )

}

