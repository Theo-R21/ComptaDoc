"use client";

import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {apiFetch} from "@/src/hook/userRefresh";
import {FaArrowRight, FaList} from "react-icons/fa";
import {SocieteInfo} from "@/src/models/societe/societe.model";
import Searchbar from "@/src/app/components/searchbar";
import {HiSquares2X2} from "react-icons/hi2";
import {useDebounce} from "@/src/hook/useDebounce";
import Pagination from "@/src/app/components/pagination";
import Button from "@/src/app/components/button";
import {FaPlus} from "react-icons/fa6";
import {AddSocieeteModal} from "@/src/app/documents/societe/AddSocieeteModal";
import {useCurrentUser} from "@/src/hook/useCurrent";
import {hasRole} from "@/src/lib/permissions";


export default function Documents() {
    const router = useRouter();
    const [data, setData] = useState<SocieteInfo[]>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(12);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search);
    const [openUpload, setOpenUpload] = useState(false);
    const {user} = useCurrentUser();

    const fetchSocietes = async (page = pageIndex, searchTerm = debouncedSearch) => {
        setLoading(true);
        try {
            const url = new URL("/societe/", window.location.origin);

            url.searchParams.set("page", (page + 1).toString());
            url.searchParams.set("page_size", pageSize.toString());

            if (searchTerm) {
                url.searchParams.set("search", searchTerm);
            }

            const res = await apiFetch(url.pathname + "?" + url.searchParams.toString(), {}, router);
            if (!res) return;
            const json = await res.json();

            setData(json.results);
            setTotalCount(json.count);

        } catch (err) {
            console.error("Erreur API :", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchSocietes(pageIndex, debouncedSearch);
    }, [pageIndex, debouncedSearch]);


    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <>
            <main className="flex-1 p-8 overflow-auto bg-gray-50">
                <header className="mb-8 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary1">Documents</h1>
                        <p className="text-sm text-primary2">
                            Gérer et consultez facilement tous vos documents client
                        </p>
                    </div>
                </header>

                <div className="flex items-center justify-between gap-4 px-4 py-2 mb-4 rounded-md">
                    <div className="flex-1">
                        <Searchbar
                            placeholder="Rechercher par nom, société..."
                            value={search}
                            onChange={(value) => {
                                setSearch(value);
                                setPageIndex(0);
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {hasRole(user, ["comptable"]) && (
                            <Button
                                variant="calltoaction1"
                                className="flex items-center gap-2 font-medium text-sm px-4 py-2 rounded-lg"
                                onClick={() => setOpenUpload(true)}
                            >
                                <FaPlus className="w-4 h-4"/>
                                <span>Société</span>
                            </Button>
                        )}

                        <p className="text-sm font-medium text-primary1 whitespace-nowrap">
                            Affichage :
                        </p>

                        <div className="flex items-center gap-1 bg-primary1/5 border border-primary1/20 rounded-md p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md transition ${viewMode === "grid" ? "bg-calltoaction1 text-primary1" : "hover:bg-primary1/10 text-primary1"} `}>
                                <HiSquares2X2 size={18}/>
                            </button>

                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-md transition ${viewMode === "list" ? "bg-calltoaction1 text-primary1" : "hover:bg-primary1/10 text-primary1"}`}>
                                <FaList size={18}/>
                            </button>

                        </div>
                    </div>
                </div>

                <div className="mb-6 h-px w-full bg-gray-200"/>
                {viewMode === "grid" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        {data.map((item, index) => (
                            <div
                                key={index}
                                className="
                                    group relative rounded-xl border border-primary1/20
                                    bg-primary1 text-white
                                    p-5 cursor-pointer
                                    transition-all
                                    hover:shadow-lg hover:-translate-y-0.5
                                "
                                onClick={() => router.push(`/documents/societe/${item.id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-11 h-11 rounded-full bg-primary3 flex items-center justify-center flex-shrink-0">
                                        <span className="text-primary1 font-semibold text-sm">
                                            {item.nom?.charAt(0)}
                                        </span>
                                    </div>

                                    <p className="text-lg font-semibold tracking-tight">
                                        {item.nom}
                                    </p>
                                </div>

                                <div className="mt-4 space-y-1 text-sm text-primary3/90">
                                    <p>
                                        <span className="opacity-70">Propriétaire :</span>{" "}
                                        {item.user.last_name} {item.user.first_name}
                                    </p>
                                    <p>
                                        <span className="opacity-70">ID Scte :</span>{" "}
                                        {item.ID_SCTE || "-"}
                                    </p>
                                </div>

                                <div className="flex justify-end mt-5">
                                    <div
                                        className="flex items-center justify-center w-9 h-9 rounded-full bg-primary3/10 group-hover:bg-primary3/20 transition"
                                    >
                                        <FaArrowRight
                                            className="text-calltoaction1 group-hover:translate-x-1 transition-transform"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {viewMode === "list" && (
                    <div className="flex flex-col gap-2">
                        {data.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white border border-primary1/50 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-primary1/10 transition cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"/>
                                    <div>
                                        <p className="font-semibold text-primary1">
                                            {item.nom}
                                        </p>
                                        <p className="text-sm text-primary2">
                                            {item.user.last_name} {item.user.first_name}
                                        </p>
                                    </div>
                                </div>

                                <FaArrowRight className="text-calltoaction1"
                                              onClick={() => router.push(`/documents/societe/${item.id}`)}/>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination
                    pageIndex={pageIndex}
                    totalPages={totalPages}
                    setPageIndex={setPageIndex}
                    pageSize={pageSize}
                    totalCount={totalCount}
                />

            </main>
            {hasRole(user, ["comptable"]) && (
                <AddSocieeteModal
                    open={openUpload}
                    onOpenChange={setOpenUpload}
                    onSocieteCreated={() => {
                        setPageIndex(0);
                        fetchSocietes(0, debouncedSearch);
                    }}
                />
            )}
        </>
    );
}
