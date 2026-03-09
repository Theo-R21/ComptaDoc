import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/src/app/components/ui/dialog"
import Button from "@/src/app/components/button";
import {useEffect, useState} from "react";
import {UserModel} from "@/src/models/user/user.model";
import {SocieteInfo} from "@/src/models/societe/societe.model";
import {apiFetch} from "@/src/hook/userRefresh";
import Input from "@/src/app/components/input";
import {formatZodErrors} from "@/src/lib/validation/helpers";
import {societeCreateSchema, societeEditSchema} from "@/src/lib/validation/societe.schema";
import {useNotification} from "@/src/provider/Notification";

type ModalMode = "create" | "edit" | "delete"

type SocieteModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    mode: ModalMode
    userId?: string
    societe?: SocieteInfo
}

const TITLES: Record<ModalMode, string> = {
    create: "Ajouter une société",
    edit: "Modifier la société",
    delete: "Supprimer la société",
}

export function SocieteModal({
                                 open,
                                 onOpenChange,
                                 onSuccess,
                                 mode,
                                 userId,
                                 societe,
                             }: SocieteModalProps) {
    const [users, setUsers] = useState<UserModel[]>([])
    const [selectedUsers, setSelectedUsers] = useState<string>("")
    const [societeName, setSocieteName] = useState<string>(societe?.nom ?? "")
    const [scte, setScte] = useState<string>(societe?.ID_SCTE ?? "")
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<{
        user_id?: string
        nom?: string
        scte?: string
    }>({})
    const {showNotification} = useNotification()

    useEffect(() => {
        if (open) {
            setSelectedUsers(userId ?? societe?.user?.id ?? "")
            setSocieteName(societe?.nom ?? "")
            setScte(societe?.ID_SCTE ?? "")
            setErrors({})
        }
    }, [open, mode, societe, userId])

    useEffect(() => {
        if (mode !== "create" || userId) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await apiFetch("/user/")
                if (!res) return
                const json = await res.json()
                setUsers(json.results)
            } catch (err: unknown) {
                showNotification({
                    title: "Erreur",
                    message: String(err),
                    type: "error",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [mode, userId])

    const validate = () => {
        const schema = mode === "create" ? societeCreateSchema : societeEditSchema
        const result = schema.safeParse({
            ...(selectedUsers && {user_id: selectedUsers}),
            nom: societeName,
            scte,
        })
        if (!result.success) {
            setErrors(formatZodErrors(result.error))
            return false
        }
        setErrors({})
        return true
    }

    const handleCreate = async () => {
        if (!validate()) return
        try {
            const res = await apiFetch("/societe/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({nom: societeName, user_id: selectedUsers, ID_SCTE: scte}),
            })
            if (!res) return
            if (!res.ok) {
                const json = await res.json()
                setErrors({user_id: json.user_id?.[0], nom: json.nom?.[0], scte: json.scte?.[0]})
                return
            }

            showNotification({
                title: "Succès",
                message: `Société créer avec succès.`,
                type: "success",
            })

            closeAndRefresh()
        } catch (err) {
            showNotification({
                title: "Erreur",
                message: "La société n'a pas pu être créé",
                type: "error",
            })
        }
    }

    const handleEdit = async () => {
        if (!validate() || !societe) return
        try {
            const res = await apiFetch(`/societe/${societe.id}/`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({nom: societeName, ...(selectedUsers && {user_id: selectedUsers}), ID_SCTE: scte}),
            })
            if (!res) return
            if (!res.ok) {
                const json = await res.json()
                setErrors({user_id: json.user_id?.[0], nom: json.nom?.[0], scte: json.scte?.[0]})
                return
            }

            showNotification({
                title: "Succès",
                message: `Société modifié avec succès.`,
                type: "success",
            })

            closeAndRefresh()
        } catch (err) {
            console.error(err)
            showNotification({
                title: "Erreur",
                message: "La société n'a pas pu être modifié",
                type: "error",
            })
        }
    }

    const handleDelete = async () => {
        if (!societe) return
        try {
            const res = await apiFetch(`/societe/${societe.id}/`, {method: "DELETE"})
            if (!res || !res.ok) return

            showNotification({
                title: "Succès",
                message: `Société supprimé avec succès.`,
                type: "success",
            })
            closeAndRefresh()
        } catch (err) {
            console.error(err)
            showNotification({
                title: "Erreur",
                message: "La société n'a pas pu être supprimé",
                type: "error",
            })
        }
    }

    const handleSubmit = () => {
        if (mode === "create") return handleCreate()
        if (mode === "edit") return handleEdit()
        if (mode === "delete") return handleDelete()
    }

    const closeAndRefresh = () => {
        onOpenChange(false)
        onSuccess?.()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl lg:max-w-2xl p-8 bg-white text-gray-900 border shadow-xl">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-lg font-semibold">
                        {TITLES[mode]}
                    </DialogTitle>
                </DialogHeader>

                {mode === "delete" ? (
                    <p className="text-sm text-gray-600">
                        Êtes-vous sûr de vouloir supprimer la société{" "}
                        <span className="font-semibold">{societe?.nom}</span> ? Cette action est irréversible.
                    </p>
                ) : (
                    <>
                        {mode === "create" && !userId && (
                            <div>
                                <label className="text-sm font-medium">Propriétaire de la société</label>
                                <select
                                    className={`
                                        mt-1 w-full rounded-lg border
                                        ${errors.user_id ? "border-red-500" : "border-gray-300"}
                                        bg-white px-3 py-2.5 text-sm text-primary1
                                    `}
                                    name="user_id"
                                    value={selectedUsers}
                                    onChange={(e) => setSelectedUsers(e.target.value)}
                                >
                                    <option value="" disabled>
                                        {loading
                                            ? "Chargement..."
                                            : users.length === 0
                                                ? "Aucun utilisateur disponible"
                                                : "Sélectionnez un utilisateur"}
                                    </option>
                                    {users.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.first_name} {item.last_name}
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && (
                                    <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium">Nom de la société</label>
                            <Input
                                name="nom"
                                placeholder="Nom de la société..."
                                value={societeName}
                                required
                                onChange={(e) => setSocieteName(e.target.value)}
                                error={errors.nom}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Matricule ou Siret</label>
                            <Input
                                name="scte"
                                placeholder="Matricule ou siret de la société..."
                                value={scte}
                                required
                                onChange={(e) => setScte(e.target.value)}
                                error={errors.scte}
                            />
                        </div>
                    </>
                )}

                <div className="flex justify-between pt-6">
                    <Button variant="secondary1" className="px-4 py-2" onClick={() => onOpenChange(false)}>
                        Retour
                    </Button>
                    <Button
                        variant={mode === "delete" ? "danger" : "calltoaction1"}
                        onClick={handleSubmit}
                        className="px-6"
                    >
                        {mode === "create" && "Créer"}
                        {mode === "edit" && "Enregistrer"}
                        {mode === "delete" && "Supprimer"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
