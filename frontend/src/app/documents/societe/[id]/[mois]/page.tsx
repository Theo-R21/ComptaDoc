"use client"

import Button from "@/src/app/components/button";
import {useCallback, useEffect, useMemo, useState} from "react";
import {apiFetch} from "@/src/hook/userRefresh";
import {useDebounce} from "@/src/hook/useDebounce";
import {DocumentsList, TypeDocumentList} from "@/src/models/documents/documents.model";
import {UploadDocumentModal} from "@/src/app/documents/societe/[id]/[mois]/UploadDocumentModal";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import Pagination from "@/src/app/components/pagination";
import Searchbar from "@/src/app/components/searchbar";
import {TbDownload} from "react-icons/tb";
import {FaArrowLeft, FaRegEye} from "react-icons/fa";
import {PdfViewerModal} from "@/src/app/documents/societe/[id]/[mois]/PDFViewModal";
import {SocieteInfo} from "@/src/models/societe/societe.model";
import {Badge} from "@/src/app/components/ui/badge";
import {Pie, PieChart, ResponsiveContainer, Sector, Tooltip} from "recharts";

export default function Page() {
    const params = useParams();
    const searchParams = useSearchParams();

    const id = params.id;
    const mois = params.mois as string;
    const monthId = String(searchParams.get("monthId"));

    const router = useRouter();
    const [data, setData] = useState<DocumentsList[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(12);
    const [totalCount, setTotalCount] = useState(0);
    const totalPages = Math.ceil(totalCount / pageSize);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search);
    const [openUpload, setOpenUpload] = useState(false);
    const [types, setTypes] = useState<TypeDocumentList[]>([]);
    const [open, setOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [downloading, setDownloading] = useState(false);
    const [societeData, setSocieteData] = useState<SocieteInfo | null>(null);
    const [stats, setStats] = useState<{
        total: number;
        par_type: { type__nom: string; count: number }[];
        dernier_depot: string | null;
        types_distincts: number;
    } | null>(null);

    interface SectorProps {
        cx: number;
        cy: number;
        innerRadius: number;
        outerRadius: number;
        startAngle: number;
        endAngle: number;
        index: number;
    }

    const COLORS = ["#1D3557", "#3A6EA5", "#FBC02D", "#4CAF50", "#9E9E9E"];

    const allSelected = useMemo(
        () => (data?.length || 0) > 0 && data.every(d => selectedIds.includes(d.id)),
        [data, selectedIds]
    );

    const toggleAll = useCallback(() => {
        setSelectedIds(allSelected ? [] : data.map(d => d.id));
    }, [allSelected, data]);

    const toggleOne = useCallback((id: number) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    }, []);

    const openPdf = useCallback((url: string) => {
        setPdfUrl(`${process.env.NEXT_PUBLIC_API_URL}${url}`);
        setOpen(true);
    }, []);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const res = await apiFetch("/documents/types/");
                if (!res) return;
                const json = await res.json();
                setTypes(Array.isArray(json) ? json : []);
            } catch {
                setTypes([]);
            }
        };
        fetchTypes();
    }, []);

    const fetchDocument = async (page = pageIndex, searchTerm = debouncedSearch, type = selectedType) => {
        setLoading(true);
        const controller = new AbortController();
        try {
            const url = new URL(
                `/documents/${id}/months/${monthId}/`,
                window.location.origin
            );

            url.searchParams.set("page", String(page + 1));
            url.searchParams.set("page_size", String(pageSize));

            if (searchTerm) {
                url.searchParams.set("search", searchTerm);
            }

            if (type) {
                url.searchParams.set("type", type);
            }

            const res = await apiFetch(
                url.pathname + "?" + url.searchParams.toString(),
                {signal: controller.signal},
                router
            );
            if (!res) return;
            const json = await res.json();
            setData(json.results);
            setStats(json.stats);
            setTotalCount(json.count);
        } catch (err: unknown) {
            if (err instanceof DOMException && err.name === "AbortError") {
                console.error(err.message);
            } else if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error("Erreur inconnue", err);
            }
        } finally {
            setLoading(false);
        }
        return () => controller.abort();

    };


    useEffect(() => {
        fetchDocument(pageIndex, debouncedSearch);
        fetchSociete()
    }, [pageIndex, debouncedSearch, selectedType]);

    const fetchSociete = async () => {
        const controller = new AbortController();
        try {

            const res = await apiFetch(
                `/societe/${id}/`,
                {signal: controller.signal},
                router
            );
            if (!res) return;
            const json = await res.json();
            setSocieteData(json);
        } catch (err: unknown) {
            if (err instanceof DOMException && err.name === "AbortError") {
                console.error(err.message);
            } else if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error("Erreur inconnue", err);
            }
        } finally {
            setLoading(false);
        }
        return () => controller.abort();

    }

    const downloadPDF = useCallback(async (documentId: number, filename: string) => {
        const res = await apiFetch(`/documents/${documentId}/download/`, {
            method: "GET",
            credentials: "include",
        });
        if (!res) return;

        const blob = await res.blob();
        if (blob.type === "text/html") return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }, []);

    const downloadSelection = useCallback(async () => {
        if (!selectedIds.length || downloading) return;

        setDownloading(true);
        try {
            const res = await apiFetch("/documents/download-multiple/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({ids: selectedIds}),
            });

            if (!res) return;

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "documents.zip";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } finally {
            setDownloading(false);
        }
    }, [selectedIds, downloading]);


    return (
        <>
            <main className="flex-1 w-full min-h-screen bg-gray-50 px-6 py-6 space-y-6">
                <header className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-primary1">
                            {societeData?.nom}
                        </h1>
                        <Badge variant="info">
                            {societeData?.ID_SCTE}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                        Propriétaire —{" "}
                        <span className="font-medium text-gray-700">
                            {societeData?.user.first_name} {societeData?.user.last_name}
                        </span>
                    </p>
                    <p className="text-sm text-primary2 mt-1">
                        Vue du mois : <span className="font-medium">{mois}</span>
                    </p>
                    <p
                        onClick={() => router.push(`/documents/societe/${id}/`)}
                        className="flex items-center mt-2 gap-2 cursor-pointer text-primary2 transition-all duration-300 hover:text-primary1 hover:translate-x-1"
                    >
                        <FaArrowLeft className="transition-colors duration-300"/>
                        <span className="hover:underline">retour</span>
                    </p>
                </header>

                <div className="mb-6 h-px w-full bg-gray-200"/>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
                    <div className="bg-white rounded-xl shadow border border-primary3/60 p-6 space-y-4">
                        <h2 className="font-medium text-primary1">Vue d'ensemble</h2>

                        <div className="flex justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Documents</p>
                                <p className="text-2xl font-semibold text-primary1">{stats?.total ?? "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Types</p>
                                <p className="text-2xl font-semibold text-primary1">{stats?.types_distincts ?? "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Dernier dépôt</p>
                                <p className="text-sm font-semibold text-primary1">
                                    {stats?.dernier_depot
                                        ? new Date(stats.dernier_depot).toLocaleDateString("fr-FR")
                                        : "-"}
                                </p>
                            </div>
                        </div>

                        {stats?.par_type?.length ? (
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie
                                        data={stats.par_type}
                                        dataKey="count"
                                        nameKey="type__nom"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={60}
                                        innerRadius={35}
                                        fill="#1D3557"
                                        shape={(props: SectorProps) => (
                                            <Sector
                                                cx={props.cx}
                                                cy={props.cy}
                                                innerRadius={props.innerRadius}
                                                outerRadius={props.outerRadius}
                                                startAngle={props.startAngle}
                                                endAngle={props.endAngle}
                                                fill={COLORS[props.index % COLORS.length]}
                                            />
                                        )}
                                    />
                                    <Tooltip formatter={(value, name) => [value, name]}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div
                                className="h-36 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                Aucun document
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow border border-primary3/60 p-6 xl:col-span-2">
                        <h2 className="font-medium text-primary1 mb-4">Répartition par type</h2>

                        {stats?.par_type?.length ? (
                            <div className="space-y-3">
                                {stats.par_type.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{backgroundColor: ["#1D3557", "#3A6EA5", "#FBC02D", "#4CAF50", "#9E9E9E"][index % 5]}}
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-secondary1 font-medium">{item.type__nom}</span>
                                                <span className="text-primary1 font-semibold">{item.count}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full">
                                                <div
                                                    className="h-1.5 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${Math.round((item.count / (stats?.total || 1)) * 100)}%`,
                                                        backgroundColor: ["#1D3557", "#3A6EA5", "#FBC02D", "#4CAF50", "#9E9E9E"][index % 5]
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-xs text-secondary2 w-8 text-right">
                                            {Math.round((item.count / (stats?.total || 1)) * 100)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="h-36 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                Aucune donnée
                            </div>
                        )}
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
                            <option value="null">Tout les types</option>
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
                            disabled={selectedIds.length === 0}
                            onClick={downloadSelection}
                        >
                            Télécharger la sélection
                        </Button>
                    </div>
                </div>


                <div className="bg-white rounded-xl shadow w-full overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-primary1 text-white border-b">
                        <tr className="text-calltoaction1 uppercase text-xs tracking-wide">
                            <th className="px-6 py-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th className="px-6 py-4 text-left">Nom du document</th>
                            <th className="px-6 py-4 text-left">Type</th>
                            <th className="px-6 py-4 text-left">Date de publication</th>
                            <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        {(data?.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-6 text-center text-gray-400 italic">
                                    Aucun document disponible
                                </td>
                            </tr>
                        ) : (
                            data?.map((item, index) => (
                                <tr key={index} className=" hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 ">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => toggleOne(item.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{item.nom}</td>
                                    <td className="px-6 py-4 ">
                                        <Badge variant="calltoaction">
                                            {item.type.nom}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {item.date_publication
                                            ? new Date(item.date_publication).toLocaleDateString("fr-FR")
                                            : "-"}
                                    </td>
                                    <td className="px-6 py-4 space-x-2 text-xl">
                                        <button
                                            className="hover:text-black cursor-pointer text-primary2"
                                            onClick={() => openPdf(item.path)}
                                        >
                                            <FaRegEye/>
                                        </button>
                                        <button
                                            className="hover:text-black cursor-pointer text-primary2"
                                            onClick={() => downloadPDF(item.id, item.nom)}
                                        >
                                            <TbDownload/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ))}

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
            </main>
            <UploadDocumentModal
                open={openUpload}
                onOpenChange={setOpenUpload}
                societeId={id}
                monthId={monthId}
                types={types}
                onDocumentUploaded={() => {
                    setPageIndex(0);
                    fetchDocument(0, debouncedSearch);
                }}
            />
            <PdfViewerModal
                open={open}
                onOpenChange={setOpen}
                pdfUrl={pdfUrl}
            />
        </>
    )

}

