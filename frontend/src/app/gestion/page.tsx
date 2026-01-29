"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {FaCheckCircle, FaChevronLeft, FaChevronRight, FaTimesCircle} from "react-icons/fa";
import Pagination from "@/src/app/components/pagination";
import Searchbar from "@/src/app/components/searchbar";
import {apiFetch} from "@/src/hook/userRefresh";
import {useDebounce} from "@/src/hook/useDebounce";
import {UserInfoModel} from "@/src/models/user/user.model";

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

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            try {
                const url = new URL(
                    `/user/`,
                    window.location.origin
                );

                url.searchParams.set("page", String(pageIndex + 1));
                url.searchParams.set("page_size", String(pageSize));

                if (debouncedSearch) {
                    url.searchParams.set("search", debouncedSearch);
                }

                const res = await apiFetch(
                    url.pathname + "?" + url.searchParams.toString(),
                    {signal: controller.signal}
                );

                const json = await res.json();
                setUsers(json.results);
                setTotalCount(json.count);
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [pageIndex, pageSize, debouncedSearch]);

    return (
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
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <FaCheckCircle/>
                                            Actif
                                        </span>
                                    ) : (
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                            <FaTimesCircle/>
                                            Inactif
                                        </span>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-center">
                                    {item.is_superuser ? (
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            <FaCheckCircle/>
                                            Oui
                                        </span>
                                    ) : (
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                            <FaTimesCircle/>
                                            Non
                                        </span>
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
    );

}
