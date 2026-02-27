"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {FaCheckCircle, FaTimesCircle} from "react-icons/fa";
import Pagination from "@/src/app/components/pagination";
import Searchbar from "@/src/app/components/searchbar";
import {apiFetch} from "@/src/hook/userRefresh";
import {useDebounce} from "@/src/hook/useDebounce";
import {UserInfoModel} from "@/src/models/user/user.model";
import Button from "@/src/app/components/button";
import {FaPlus} from "react-icons/fa6";
import {AddUserModal} from "@/src/app/components/modal/AddUserModal";
import {Badge} from "@/src/app/components/ui/badge";

export default function Gestion() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [users, setUsers] = useState<UserInfoModel[]>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(12);
    const [totalCount, setTotalCount] = useState(0);
    const totalPages = Math.ceil(totalCount / pageSize);
    const debouncedSearch = useDebounce(search);

    const [openCreate, setOpenCreate] = useState(false);

    const fetchUser = async (page = pageIndex, searchTerm = debouncedSearch) => {
        setLoading(true);
        try {
            const url = new URL("/user/", window.location.origin);
            url.searchParams.set("page", (page + 1).toString());
            url.searchParams.set("page_size", pageSize.toString());
            if (searchTerm) url.searchParams.set("search", searchTerm);

            const res = await apiFetch(url.pathname + "?" + url.searchParams.toString(), {}, router);
            if (!res) return;
            const json = await res.json();

            setUsers(json.results);
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
    };


    useEffect(() => {
        fetchUser(pageIndex, debouncedSearch);
    }, [pageIndex, debouncedSearch]);

    return (
        <>
            <main className="flex-1 p-8 overflow-auto bg-gray-50">
                <header className="mb-8 space-y-4">
                    <div>
                        <h1 className="text-2xl font-bold text-primary1">
                            Gestion des utilisateurs
                        </h1>
                        <p className="text-sm text-primary2">
                            Consultez et gérez les utilisateurs de la plateforme
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 px-4 py-2 mb-4 items-center">
                        <div className="flex-1 min-w-[260px]">
                            <Searchbar
                                placeholder="Rechercher par nom, email ou téléphone…"
                                value={search}
                                onChange={(value) => {
                                    setSearch(value);
                                    setPageIndex(0);
                                }}
                            />
                        </div>
                        <Button
                            variant="calltoaction1"
                            className="flex items-center gap-2 font-medium text-sm px-4 py-2 rounded-lg"
                            onClick={() => setOpenCreate(true)}
                        >
                            <FaPlus className="w-4 h-4"/>
                            <span>Utilisateur</span>
                        </Button>
                    </div>
                </header>
                <div className="mb-6 h-px w-full bg-gray-200"/>
                <div className="bg-white rounded-xl shadow w-full overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-primary1 text-white border-b">
                        <tr className="text-calltoaction1 uppercase text-xs tracking-wide">
                            <th className="px-6 py-4 text-left">Utilisateur</th>
                            <th className="px-6 py-4 text-left">Téléphone</th>
                            <th className="px-6 py-4 text-center">Actif</th>
                            <th className="px-6 py-4 text-center">Admin</th>
                            <th className="px-6 py-4 text-left">Création</th>
                            <th className="px-6 py-4 text-left">Dernière connexion</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y">
                        {users.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-6 text-center text-gray-400 italic"
                                >
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        ) : (
                            users.map((item, index) => (
                                <tr
                                    key={index}
                                    onClick={() => router.push(`/gestion/${item.id}/`)}
                                    className="cursor-pointer hover:bg-gray-50 transition"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">
                                            {item.first_name} {item.last_name}
                                        </span>
                                            <span className="text-xs text-gray-500">
                                            {item.email}
                                        </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-gray-700">
                                        {item.phone || "-"}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        {item.is_active ? (
                                            <Badge variant="accepted">
                                                <FaCheckCircle/>
                                                Actif
                                            </Badge>
                                        ) : (
                                             <Badge variant="denied">
                                            <FaTimesCircle/>
                                            Inactif
                                             </Badge>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        {item.is_superuser ? (
                                            <Badge variant="info">
                                                <FaCheckCircle/>
                                                Oui
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <FaTimesCircle/>
                                                Non
                                            </Badge>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {item.date_joined
                                            ? new Date(item.date_joined).toLocaleDateString("fr-FR")
                                            : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {item.last_login
                                            ? new Date(item.last_login).toLocaleDateString("fr-FR")
                                            : "-"}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>

                    <div className="border-t">
                        <Pagination
                            pageIndex={pageIndex}
                            totalPages={totalPages}
                            setPageIndex={setPageIndex}
                            pageSize={pageSize}
                            totalCount={totalCount}
                        />
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}
            </main>
            <AddUserModal
                open={openCreate}
                onOpenChange={setOpenCreate}
                onSocieteCreated={() => {
                    setPageIndex(0);
                    fetchUser(0, debouncedSearch);
                }}
            />
        </>
    );

}
