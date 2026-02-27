"use client"

import {useCurrentUser} from "@/src/hook/useCurrent"
import {useEffect, useState} from "react"
import {CiEdit} from "react-icons/ci"
import Input from "@/src/app/components/input"
import Button from "@/src/app/components/button"
import {resetPasswordSchema, userEditSchema} from "@/src/lib/validation/user.schema"
import {formatZodErrors} from "@/src/lib/validation/helpers"
import {apiFetch} from "@/src/hook/userRefresh";
import {useNotification} from "@/src/provider/Notification";

type Tab = "info" | "security"

export default function Profile() {
    const {user, refreshCurrentUser} = useCurrentUser()
    const [activeTab, setActiveTab] = useState<Tab>("info")
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        first_name: user?.first_name ?? "",
        last_name: user?.last_name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
    })

    const [passwords, setPasswords] = useState({
        current_password: "",
        password1: "",
        password2: "",
    })
    const {showNotification} = useNotification()

    const [errors, setErrors] = useState<Partial<typeof form>>({})
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setForm((prev) => ({...prev, [name]: value}))
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setPasswords((prev) => ({...prev, [name]: value}))
    }

    const handleSaveInfo = async () => {
        const result = userEditSchema.safeParse(form)
        if (!result.success) {
            setErrors(formatZodErrors(result.error))
            return
        }
        setErrors({})
        setSaving(true)
        try {
            const res = await apiFetch(`/user/${user?.id}/`, {
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
            setForm({
                first_name: json.first_name ?? "",
                last_name: json.last_name ?? "",
                email: json.email ?? "",
                phone: json.phone ?? "",
            });
            refreshCurrentUser()
            setSaved(true)
            setIsEditing(false)
            setErrors({});
            showNotification({
                title: "Succès",
                message: `Profile modifié avec succès.`,
                type: "success",
            })
        } catch (err) {
            showNotification({
                title: "Erreur",
                message: String(err),
                type: "error",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleSavePassword = async () => {
        const result = resetPasswordSchema.safeParse({
            password1: passwords.password1,
            password2: passwords.password2
        })
        if (!result.success) {
            console.log(result)
            setErrors(formatZodErrors(result.error))
            return
        }
        setPasswordError(null)
        setSaving(true)
        try {
            const res = await apiFetch("/user/change-password/",{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(passwords),
            })

            if (!res) return;
            refreshCurrentUser()
            setPasswords({current_password: "", password1: "", password2: ""})
            setSaved(true)
             showNotification({
                title: "Succès",
                message: `Mot de passe mis à jour avec succès.`,
                type: "success",
            })
        } catch(err) {
            setPasswordError("Mot de passe actuel incorrect.")
            showNotification({
                title: "Erreur",
                message: String(err),
                type: "error",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setForm({
            first_name: user?.first_name ?? "",
            last_name: user?.last_name ?? "",
            email: user?.email ?? "",
            phone: user?.phone ?? "",
        })
        setErrors({})
        setIsEditing(false)
    }

    useEffect(() => {
        if (!user) return
        setForm({
            first_name: user.first_name ?? "",
            last_name: user.last_name ?? "",
            email: user.email ?? "",
            phone: user.phone ?? "",
        })
    }, [user])


    const initials = `${form.first_name?.[0] ?? ""}${form.last_name?.[0] ?? ""}`.toUpperCase() || "?"

    return (
        <main className="flex-1 p-8 bg-gray-50 overflow-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-primary1">Mon profil</h1>
                <p className="text-sm text-primary2">
                    Gérez vos informations personnelles et votre mot de passe
                </p>
            </header>

            <div className="mb-6 h-px w-full bg-gray-200"/>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow border border-primary3/60 p-6 space-y-6 relative">

                        <Button
                            variant="primary1"
                            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 text-sm"
                        >
                            <CiEdit/>
                            {isEditing ? "Annuler" : "Modifier"}
                        </Button>

                        <div className="flex justify-start pt-2">
                            <div
                                className="w-24 h-24 rounded-full bg-gradient-to-br from-primary1 to-primary2 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                                {initials}
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
                                    ? new Date(user.last_login).toLocaleDateString("fr-FR")
                                    : "-"}
                            </div>
                        </div>

                        {isEditing && (
                            <Button
                                variant="primary1"
                                onClick={handleSaveInfo}
                                disabled={saving}
                                className="w-full py-2"
                            >
                                {saving ? "Sauvegarde..." : saved ? "✓ Enregistré" : "Sauvegarder les modifications"}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow border border-primary3/60 p-6">
                        <div className="flex gap-1 border-b border-gray-200 mb-6">
                            {(["info", "security"] as Tab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setPasswordError(null)
                                    }}
                                    className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                        activeTab === tab
                                            ? "border-primary1 text-primary1"
                                            : "border-transparent text-gray-400 hover:text-primary2"
                                    }`}
                                >
                                    {{info: "Informations", security: "Mot de passe"}[tab]}
                                </button>
                            ))}
                        </div>

                        {activeTab === "info" && (
                            <div className="space-y-2 text-sm text-gray-500">
                                <p>
                                    Pour modifier vos informations personnelles, utilisez le bouton{" "}
                                    <span className="font-medium text-primary1">Modifier</span> dans la colonne de
                                    gauche.
                                </p>
                                <div className="mt-4 space-y-3">
                                    <ReadOnlyField label="Rôle"
                                                   value={user?.role === "comptable" ? "Comptable" : "Client"}/>
                                    <ReadOnlyField label="Nom d'utilisateur" value={user?.username}/>
                                    <ReadOnlyField label="Adresse email" value={user?.email}/>
                                    <ReadOnlyField label="Téléphone" value={user?.phone}/>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="space-y-4 max-w-md">
                                <Input
                                    label="Mot de passe actuel"
                                    name="current_password"
                                    type="password"
                                    value={passwords.current_password}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    className="text-primary1"
                                />
                                <Input
                                    label="Nouveau mot de passe"
                                    name="password1"
                                    type="password"
                                    value={passwords.password1}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    className="text-primary1"
                                />
                                <Input
                                    label="Confirmer le nouveau mot de passe"
                                    name="password2"
                                    type="password"
                                    value={passwords.password2}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    className="text-primary1"
                                />

                                {passwordError && (
                                    <p className="text-sm text-red-500">{passwordError}</p>
                                )}

                                <div className="pt-2">
                                    <Button
                                        variant="primary1"
                                        onClick={handleSavePassword}
                                        disabled={saving}
                                        className="py-2 px-6"
                                    >
                                        {saving ? "Sauvegarde..." : saved ? "✓ Enregistré" : "Mettre à jour le mot de passe"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </main>
    )
}

function ReadOnlyField({label, value}: { label: string; value?: string | null }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-gray-500 font-medium text-sm">{label}</span>
            <span className="text-primary1 font-semibold">{value || "-"}</span>
        </div>
    )
}