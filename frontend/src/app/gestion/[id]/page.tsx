"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {CiEdit} from "react-icons/ci";

import {apiFetch} from "@/src/hook/userRefresh";
import {UserInfoModel} from "@/src/models/user/user.model";
import Input from "@/src/app/components/input";
import {Switch} from "@/src/app/components/ui/switch";
import {FaArrowLeft} from "react-icons/fa";
import {userEditSchema} from "@/src/lib/validation/user.schema";
import {formatZodErrors} from "@/src/lib/validation/helpers";
import {TbTrash} from "react-icons/tb";
import Pagination from "@/src/app/components/pagination";
import {SocieteInfo} from "@/src/models/societe/societe.model";
import Button from "@/src/app/components/button";
import {SocieteModal} from "@/src/app/components/modal/SocieteModal";

export default function Gestion() {
    const params = useParams();
    const id = params.id;
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<UserInfoModel | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [updatingToggle, setUpdatingToggle] = useState(false);
    const [savingUser, setSavingUser] = useState(false);
    const [societes, setSocietes] = useState<SocieteInfo[]>([]);
    const [societePageIndex, setSocietePageIndex] = useState(0);
    const [societeTotalCount, setSocieteTotalCount] = useState(0);
    const societePageSize = 5;
    const societeTotalPages = Math.ceil(societeTotalCount / societePageSize);

    const [modalState, setModalState] = useState<{
        open: boolean
        mode: "create" | "edit" | "delete"
        societe?: SocieteInfo
    }>({open: false, mode: "create"})

    const openCreate = () => setModalState({open: true, mode: "create"})
    const openEdit = (societe: SocieteInfo) => setModalState({open: true, mode: "edit", societe})
    const openDelete = (societe: SocieteInfo) => setModalState({open: true, mode: "delete", societe})

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
    });

    const [errors, setErrors] = useState<{
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
    }>({});

    const validate = () => {
        const result = userEditSchema.safeParse(form);
        if (!result.success) {
            setErrors(formatZodErrors(result.error));
            return false;
        }
        return true;
    };

    const fetchUser = async (page = societePageIndex, signal?: AbortSignal) => {
        setLoading(true);
        try {
            const url = new URL(`/user/${id}/`, window.location.origin);
            url.searchParams.set("page", (page + 1).toString());
            url.searchParams.set("page_size", societePageSize.toString());

            const res = await apiFetch(url.pathname + "?" + url.searchParams.toString(), {
                signal,
            }, router);
            if (!res) return;

            const json = await res.json();

            if (!res.ok) {
                setErrors({
                    first_name: json.first_name?.[0],
                    last_name: json.last_name?.[0],
                    email: json.email?.[0],
                    phone: json.phone?.[0],
                });
                return;
            }

            setUser(json);
            setIsActive(json.is_active);
            setForm({
                first_name: json.first_name ?? "",
                last_name: json.last_name ?? "",
                email: json.email ?? "",
                phone: json.phone ?? "",
            });
            setSocietes(json.societes.results);
            setSocieteTotalCount(json.societes.count);

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
        fetchUser(societePageIndex);
    }, [id, societePageIndex]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };

    const handleSaveUser = async () => {
        if (!validate()) return;
        if (!user) return;
        setSavingUser(true);

        try {
            const res = await apiFetch(`/user/${id}/`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(form),
            });
            if (!res) return;
            const json = await res.json();

            if (!res.ok) {
                setErrors({
                    first_name: json.first_name?.[0],
                    last_name: json.last_name?.[0],
                    email: json.email?.[0],
                    phone: json.phone?.[0],
                });
                return;
            }

            setUser(json);
            setForm({
                first_name: json.first_name ?? "",
                last_name: json.last_name ?? "",
                email: json.email ?? "",
                phone: json.phone ?? "",
            });
            setIsEditing(false);
            setErrors({});
        } catch (err) {
            console.error(err);
        } finally {
            setSavingUser(false);
        }
    };

    const handleToggleChange = async (
        userId: string | Array<string> | undefined,
        actif: boolean
    ) => {
        const previousValue = isActive;
        setIsActive(actif);
        setUpdatingToggle(true);

        try {
            const res = await apiFetch(`/user/${userId}/toggle-actif/`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({actif}),
            });
            if (!res) return;
            if (!res.ok) throw new Error();
        } catch (err) {
            console.error(err);
            setIsActive(previousValue);
        } finally {
            setUpdatingToggle(false);
        }
    };

    return (
        <>
            <main className="flex-1 p-8 bg-gray-50 overflow-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-primary1">
                        Profil utilisateur
                    </h1>
                    <p className="text-sm text-primary2">
                        Gestion du compte — {user?.first_name} {user?.last_name}
                    </p>
                    <p
                        onClick={() => router.push(`/gestion/`)}
                        className="flex items-center mt-2 gap-2 cursor-pointer text-primary2 transition-all duration-300 hover:text-primary1 hover:translate-x-1"
                    >
                        <FaArrowLeft/>
                        retour
                    </p>
                </header>

                <div className="mb-6 h-px w-full bg-gray-200"/>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow border border-primary3/60 p-6 space-y-6 relative">

                            <Button
                                variant="primary1"
                                onClick={() => setIsEditing((p) => !p)}
                                className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 text-sm"
                            >
                                <CiEdit/>
                                {isEditing ? "Annuler" : "Modifier"}
                            </Button>

                            <div className="flex justify-start pt-2">
                                <div
                                    className="w-24 h-24 rounded-full bg-gradient-to-br from-primary1 to-primary2 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                                    {user?.first_name?.[0]}
                                    {user?.last_name?.[0]}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {!isEditing ? (
                                    <>
                                        <ReadOnlyField label="Nom d'utilisateur" value={user?.username}/>
                                        <ReadOnlyField label="Nom" value={user?.last_name}/>
                                        <ReadOnlyField label="Prénom" value={user?.first_name}/>
                                        <ReadOnlyField label="Adresse email" value={user?.email}/>
                                        <ReadOnlyField label="Téléphone" value={user?.phone}/>
                                    </>
                                ) : (
                                    <>
                                        <Input
                                            label="Nom d'utilisateur"
                                            value={user?.username}
                                            disabled
                                            className="bg-gray-100 cursor-not-allowed text-primary1/60"
                                        />
                                        <Input
                                            label="Nom"
                                            name="last_name"
                                            value={form.last_name}
                                            onChange={handleInputChange}
                                            error={errors.last_name}
                                            required
                                            className="text-primary1"
                                        />
                                        <Input
                                            label="Prénom"
                                            name="first_name"
                                            value={form.first_name}
                                            onChange={handleInputChange}
                                            error={errors.first_name}
                                            required
                                            className="text-primary1"
                                        />
                                        <Input
                                            label="Adresse email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleInputChange}
                                            error={errors.email}
                                            required
                                            className="text-primary1"
                                        />
                                        <Input
                                            label="Téléphone"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleInputChange}
                                            error={errors.phone}
                                            required
                                            className="text-primary1"
                                        />
                                    </>
                                )}
                            </div>

                            <hr className="border-primary3/60"/>

                            <div className="text-sm text-gray-500">
                                <span className="font-medium text-gray-600">Dernière connexion</span>
                                <div>
                                    {user?.last_login
                                        ? new Date(user?.last_login).toLocaleDateString("fr-FR")
                                        : "-"}
                                </div>
                            </div>

                            {isEditing && (
                                <Button
                                    variant="primary1"
                                    onClick={handleSaveUser}
                                    disabled={savingUser}
                                    className="w-full py-2"
                                >
                                    {savingUser ? "Sauvegarde..." : "Sauvegarder les modifications"}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-5">

                        <div
                            className="bg-white rounded-xl shadow border border-primary3/60 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-primary1">
                                    Statut du compte
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Activer ou désactiver l'accès utilisateur
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`text-sm font-medium ${isActive ? "text-calltoactionsuccess" : "text-red-500"}`}>
                                    {isActive ? "Actif" : "Inactif"}
                                </span>
                                <Switch
                                    checked={isActive}
                                    disabled={updatingToggle}
                                    onCheckedChange={(checked) => handleToggleChange(id, checked)}
                                    className="data-[state=checked]:bg-calltoactionsuccess data-[state=unchecked]:bg-secondary2"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow border border-primary3/60 p-6 min-h-[300px]">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-semibold text-primary1">
                                    Sociétés de l'utilisateur
                                </h2>
                                <Button variant="calltoaction1" className="text-xs px-3 py-1.5"
                                        onClick={openCreate}>
                                    + Ajouter
                                </Button>
                            </div>

                            {!societes.length ? (
                                <p className="text-sm text-gray-400">Aucune société associée</p>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        {societes.map((societe) => (
                                            <div
                                                key={societe.id}
                                                className="group relative flex items-center justify-between px-4 py-3 rounded-xl border border-primary3/60 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                                            >
                                                <span className="absolute left-0 top-3 h-8 w-1 rounded-r bg-primary1"/>

                                                <div className="flex items-center gap-3 pl-2">
                                                    <div
                                                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary1 to-primary2 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                                                        {societe.nom[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-primary1 text-sm">{societe.nom}</p>
                                                        <p className="text-xs text-secondary2">{societe.ID_SCTE ?? "—"}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="primary1"
                                                        onClick={() => router.push(`/documents/societe/${societe.id}/`)}
                                                        className="text-xs px-3 py-1.5"
                                                    >
                                                        Documents
                                                    </Button>
                                                    <Button
                                                        variant="secondary2"
                                                        className="text-xs px-3 py-1.5"
                                                        onClick={() => openEdit(societe)}
                                                    >
                                                        <CiEdit className="text-base"/>
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        className="text-xs px-3 py-1.5"
                                                        onClick={() => openDelete(societe)}
                                                    >
                                                        <TbTrash className="text-base"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Pagination
                                        pageIndex={societePageIndex}
                                        totalPages={societeTotalPages}
                                        setPageIndex={setSocietePageIndex}
                                        pageSize={societePageSize}
                                        totalCount={societeTotalCount}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

                <SocieteModal
                    open={modalState.open}
                    onOpenChange={(open) => setModalState((prev) => ({...prev, open}))}
                    mode={modalState.mode}
                    societe={modalState.societe}
                    userId={typeof id === "string" ? id : undefined}
                    onSuccess={() => {
                        setSocietePageIndex(0);
                        fetchUser(0);
                    }}
                />

        </>
    );
}

function ReadOnlyField({label, value}: { label: string; value?: string | null }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-gray-500 font-medium text-sm">{label}</span>
            <span className="text-primary1 font-semibold">{value || "-"}</span>
        </div>
    );
}
