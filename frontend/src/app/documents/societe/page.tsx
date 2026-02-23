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
import {SocieteModal} from "@/src/app/components/modal/SocieteModal";
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
                                        group relative rounded-2xl overflow-hidden
                                        border border-primary3/60
                                        bg-white shadow-sm
                                        p-5 cursor-pointer
                                        transition-all duration-300
                                        hover:shadow-xl hover:-translate-y-1
                                    "
                                onClick={() => router.push(`/documents/societe/${item.id}`)}
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-primary1"/>

                                <div
                                    className="absolute top-0 right-0 w-24 h-24 bg-primary3/30 rounded-full blur-2xl pointer-events-none"/>

                                <div className="flex items-center gap-3 mt-2">
                                    <div
                                        className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary1 to-primary2 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <span className="text-white font-bold text-sm">
                                            {item.nom?.charAt(0)}
                                        </span>
                                    </div>
                                    <p className="text-base font-bold tracking-tight text-primary1 leading-tight">
                                        {item.nom}
                                    </p>
                                </div>

                                <div className="my-3 h-px bg-primary3/60"/>

                                <div className="space-y-1.5 text-sm">
                                    <p className="flex items-center gap-2 text-secondary1">
                                        <span className="text-primary2 font-medium">Propriétaire</span>
                                        <span className="text-secondary2">·</span>
                                        {item.user.last_name} {item.user.first_name}
                                    </p>
                                    <p className="flex items-center gap-2 text-secondary1">
                                        <span className="text-primary2 font-medium">ID Scte</span>
                                        <span className="text-secondary2">·</span>
                                        {item.ID_SCTE || "-"}
                                    </p>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <div
                                        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary1 group-hover:bg-primary2 transition-colors duration-300">
                                        <FaArrowRight
                                            className="text-calltoaction1 text-xs group-hover:translate-x-0.5 transition-transform"/>
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
                                className="group relative overflow-hidden bg-white border border-primary3/60 rounded-xl px-4 py-3 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                                onClick={() => router.push(`/documents/societe/${item.id}`)}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary1 rounded-l-xl"/>

                                <div
                                    className="absolute right-0 top-0 w-20 h-20 bg-primary3/20 rounded-full blur-2xl pointer-events-none"/>

                                <div className="flex items-center gap-4 pl-2">

                                    <div
                                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary1 to-primary2 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <span className="text-white font-bold text-sm">
                                            {item.nom?.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary1">
                                            {item.nom}
                                        </p>
                                        <p className="text-sm text-primary2">
                                            {item.user.last_name} {item.user.first_name}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-primary1 group-hover:bg-primary2 transition-colors duration-300">
                                    <FaArrowRight
                                        className="text-calltoaction1 text-xs group-hover:translate-x-0.5 transition-transform"/>
                                </div>
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
                <SocieteModal
                    open={openUpload}
                    onOpenChange={setOpenUpload}
                    mode="create"
                    onSuccess={() => {
                        setPageIndex(0);
                        fetchSocietes(0, debouncedSearch);
                    }}
                />
            )}
        </>
    );
}
