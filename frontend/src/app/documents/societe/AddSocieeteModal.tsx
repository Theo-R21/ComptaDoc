import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/src/app/components/ui/dialog"
import Button from "@/src/app/components/button";
import {useEffect, useState} from "react";
import {UserModel} from "@/src/models/user/user.model";
import {apiFetch} from "@/src/hook/userRefresh";
import Input from "@/src/app/components/input";
import {formatZodErrors} from "@/src/lib/validation/helpers";
import {societeCreateSchema} from "@/src/lib/validation/societe.schema";


type AddSocieeteModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSocieteCreated?: () => void;
}

export function AddSocieeteModal({
                                     open,
                                     onOpenChange,
                                     onSocieteCreated
                                 }: AddSocieeteModalProps) {
    const [users, setUsers] = useState<UserModel[]>([])
    const [selectedUsers, setSelectedUsers] = useState<number | null>(null)
    const [societeName, setSocieteName] = useState<string>("")
    const [scte, setScte] = useState<string>("")
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        user_id?: string;
        nom?: string;
        scte?: string;
    }>({});

    useEffect(() => {
            const fetchData = async () => {
                    setLoading(true);
                    try {
                        const res = await apiFetch("/user/");
                        const json = await res.json();


                        setUsers(json.results);
                    } catch
                        (error) {
                        console.error("Erreur API :", error);
                    } finally {
                        setLoading(false);
                    }
                }
            ;
            fetchData();
        }, [onOpenChange, onSocieteCreated]
    );

    const validate = () => {
        const result = societeCreateSchema.safeParse({
            user_id: selectedUsers,
            nom: societeName,
            scte: scte,
        });

        if (!result.success) {
            setErrors(formatZodErrors(result.error));
            return false;
        }

        setErrors({});
        return true;
    };


    const handleCreate = async () => {
        if (!validate()) return;
        if (!selectedUsers) {
            setErrors(prev => ({...prev, user: "Le propriétaire est obligatoire"}));
            return;
        }

        try {
            const res = await apiFetch(`/societe/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nom: societeName,
                    user_id: selectedUsers,
                    ID_SCTE: scte,
                }),
            });

            if (!res.ok) {
                const json = await res.json()
                setErrors({
                    user_id: json.user_id?.[0],
                    nom: json.nom?.[0],
                    scte: json.scte?.[0],
                })
                return;
            }

            onOpenChange(false);
            if (onSocieteCreated) onSocieteCreated();
            setSocieteName("");
            setScte("");
            setSelectedUsers(null);
            setErrors({});

        } catch (err) {
            console.error(err);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
                    sm:max-w-xl
                    lg:max-w-2xl
                    p-8
                    bg-white text-gray-900
                    border shadow-xl
                "
            >
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-lg font-semibold">
                        Ajouter une société
                    </DialogTitle>
                </DialogHeader>
                <div>
                    <label className="text-sm font-medium">Propiétaire de la société</label>
                    <select
                        className={`
                            mt-1 w-full rounded-lg
                            border
                            ${errors.user_id ? "border-red-500" : "border-gray-300"}
                            bg-white px-3 py-2.5
                            text-sm text-primary1
                            `}
                        name="user_id"
                        value={selectedUsers ?? ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSelectedUsers(value ? Number(value) : null);
                        }}
                    >
                        <option value="" disabled>
                            {users.length === 0
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
                <div>
                    <label className="text-sm font-medium">
                        Nom de la société
                    </label>
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
                    <label className="text-sm font-medium">
                        Matricule ou Siret
                    </label>
                    <Input
                        name="scte"
                        placeholder="Matricule ou siret de la société..."
                        value={scte}
                        required
                        onChange={(e) => setScte(e.target.value)}
                        error={errors.scte}
                    />
                </div>

                <div className="flex justify-between pt-6">
                    <Button
                        variant="secondary1"
                        className="px-4 py-2"
                        onClick={() => onOpenChange(false)}
                    >
                        Retour
                    </Button>
                    <Button
                        variant="calltoaction1"
                        onClick={handleCreate}
                        className="px-6"
                    >
                        Créer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}