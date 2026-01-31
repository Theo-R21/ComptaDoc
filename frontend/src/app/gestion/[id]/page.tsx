"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {CiEdit} from "react-icons/ci";

import {apiFetch} from "@/src/hook/userRefresh";
import {UserInfoModel} from "@/src/models/user/user.model";
import Input from "@/src/app/components/input";
import {Switch} from "@/src/app/components/ui/switch";
import {FaArrowLeft} from "react-icons/fa";

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

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        company_name: "",
        phone: "",
    });

    useEffect(() => {
        const controller = new AbortController();

        const fetchUser = async () => {
            setLoading(true);
            try {
                const res = await apiFetch(`/user/${id}/`, {
                    signal: controller.signal,
                });

                const json = await res.json();
                setUser(json);
                setIsActive(json.is_active);

                setForm({
                    first_name: json.first_name ?? "",
                    last_name: json.last_name ?? "",
                    email: json.email ?? "",
                    company_name: json.company_name ?? "",
                    phone: json.phone ?? "",
                });
            } catch (err: never) {
                if (err.name !== "AbortError") console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        return () => controller.abort();
    }, [id]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };

    const handleSaveUser = async () => {
        if (!user) return;

        setSavingUser(true);

        try {
            const res = await apiFetch(`/user/${user.id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error("Erreur mise à jour utilisateur");

            const updatedUser = await res.json();
            setUser(updatedUser);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSavingUser(false);
        }
    };

    const handleToggleChange = async (
        userId: number,
        actif: boolean
    ) => {
        const previousValue = isActive;
        setIsActive(actif);
        setUpdatingToggle(true);

        try {
            const res = await apiFetch(`/user/${userId}/toggle-actif/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({actif}),
            });

            if (!res.ok) throw new Error();
        } catch (err) {
            console.error(err);
            setIsActive(previousValue);
        } finally {
            setUpdatingToggle(false);
        }
    };

    if (loading || !user) {
        return <div className="p-8">Chargement...</div>;
    }

    return (
        <main className="flex-1 p-8 bg-gray-50 overflow-auto">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary1">
                        Profil utilisateur
                    </h1>
                    <p className="text-sm text-primary2">
                        Gestion du compte — {user.first_name} {user.last_name}
                    </p>
                    <p
                        onClick={() => router.push(`/gestion/`)}
                        className="flex items-center mt-2 gap-2 cursor-pointer text-primary2 transition-all duration-300
                   hover:text-primary1 hover:translate-x-1"
                    >
                        <FaArrowLeft/>
                        retour
                    </p>

                </div>
            </header>
            <div className="mb-6 h-px w-full bg-gray-200"/>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow p-6 space-y-6 relative">
                        <button
                            onClick={() => setIsEditing((p) => !p)}
                            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-calltoaction1 hover:bg-calltoaction2 text-white text-sm font-medium"
                        >
                            <CiEdit/>
                            {isEditing ? "Annuler" : "Modifier"}
                        </button>

                        <div className="flex justify-start pt-2">
                            <div
                                className="w-24 h-24 rounded-full bg-gradient-to-br from-calltoaction1 to-calltoaction2 flex items-center justify-center text-white text-2xl font-bold">
                                {user.first_name?.[0]}
                                {user.last_name?.[0]}
                            </div>
                        </div>


                        <div className="space-y-4">
                            {!isEditing ? (
                                <>
                                    <ReadOnlyField label="Nom d'utilisateur" value={user.username}/>
                                    <ReadOnlyField label="Nom" value={user.last_name}/>
                                    <ReadOnlyField label="Prénom" value={user.first_name}/>
                                    <ReadOnlyField label="Adresse email" value={user.email}/>
                                    <ReadOnlyField label="Société" value={user.company_name}/>
                                    <ReadOnlyField label="Téléphone" value={user.phone}/>
                                </>
                            ) : (
                                <>
                                    <Input
                                        label="Nom d'utilisateur"
                                        value={user.username}
                                        disabled
                                        className="bg-gray-100 cursor-not-allowed"
                                    />
                                    <Input
                                        label="Nom"
                                        name="last_name"
                                        value={form.last_name}
                                        onChange={handleInputChange}
                                    />
                                    <Input
                                        label="Prénom"
                                        name="first_name"
                                        value={form.first_name}
                                        onChange={handleInputChange}
                                    />
                                    <Input
                                        label="Adresse email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleInputChange}
                                    />
                                    <Input
                                        label="Société"
                                        name="company_name"
                                        value={form.company_name}
                                        onChange={handleInputChange}
                                    />
                                    <Input
                                        label="Téléphone"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleInputChange}
                                    />
                                </>
                            )}
                        </div>

                        <hr className="border-gray-200"/>

                        <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-600">
                            Dernière connexion
                        </span>
                            <div>
                                {user.last_login
                                    ? new Date(user.last_login).toLocaleDateString("fr-FR")
                                    : "-"}
                            </div>
                        </div>

                        {isEditing && (
                            <button
                                onClick={handleSaveUser}
                                disabled={savingUser}
                                className="w-full bg-calltoaction1 hover:bg-calltoaction2 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
                            >
                                {savingUser ? "Sauvegarde..." : "Sauvegarder les modifications"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-gray-700">
                                Statut du compte
                            </h2>
                            <p className="text-sm text-gray-500">
                                Activer ou désactiver l’accès utilisateur
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Actif</span>
                            <Switch
                                checked={isActive}
                                disabled={updatingToggle}
                                onCheckedChange={(checked) =>
                                    handleToggleChange(user.id, checked)
                                }
                                className="
                                data-[state=checked]:bg-calltoaction1
                                data-[state=unchecked]:bg-secondary2
                            "
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6 min-h-[300px]">
                        <h2 className="font-semibold text-gray-700 mb-2">
                            Documents récents
                        </h2>
                        <p className="text-sm text-gray-400">
                            Aucun document téléversé pour le moment
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );

}

function ReadOnlyField({
                           label,
                           value,
                       }: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-gray-700 font-medium text-lg">{label}</span>
            <span className="text-gray-900">{value || "-"}</span>
        </div>
    );
}
