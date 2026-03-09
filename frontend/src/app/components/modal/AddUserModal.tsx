import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/src/app/components/ui/dialog"
import Button from "@/src/app/components/button";
import {useState} from "react";
import {apiFetch} from "@/src/hook/userRefresh";
import Input from "@/src/app/components/input";
import {userCreateSchema} from "@/src/lib/validation/user.schema";
import {formatZodErrors} from "@/src/lib/validation/helpers";
import {useNotification} from "@/src/provider/Notification";


type AddUserModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSocieteCreated?: () => void;
}

export function AddUserModal({
                                 open,
                                 onOpenChange,
                                 onSocieteCreated
                             }: AddUserModalProps) {
    const [loading, setLoading] = useState(false);
    const {showNotification} = useNotification()

    const [form, setForm] = useState({
        last_name: "",
        first_name: "",
        email: "",
        phone: "",
        password: "",
        password2: "",
    });

    const [errors, setErrors] = useState<{
        last_name?: string;
        first_name?: string;
        email?: string;
        phone?: string;
        password?: string;
        password2?: string;
    }>({});


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };

    const validate = () => {
        const result = userCreateSchema.safeParse(form)

        if (!result.success) {
            setErrors(formatZodErrors(result.error))
            return false
        }

        return true
    }

    const handleCreate = async () => {
        if (!validate()) return;

        setLoading(true);

        try {
            const res = await apiFetch(`/user/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if(!res) return
            if (!res.ok) {
                const json = await res.json()
                setErrors({
                    last_name: json.user_id?.[0],
                    first_name: json.nom?.[0],
                    email: json.scte?.[0],
                    phone: json.scte?.[0],
                    password: json.scte?.[0],
                    password2: json.scte?.[0],
                })
                return;
            }

            showNotification({
                title: "Succès",
                message: `Utilisateur créer avec succès.`,
                type: "success",
            })

            onOpenChange(false);
            if (onSocieteCreated) onSocieteCreated();
            setErrors({});
        } catch (err: unknown) {
            showNotification({
                title: "Erreur",
                message: "L'utilisateur n'a pas pu être créé",
                type: "error",
            })
        } finally {
            setLoading(false);
        }
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl lg:max-w-3xl p-6 bg-white text-gray-900 border shadow-xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-semibold">
                        Ajouter un utilisateur
                    </DialogTitle>
                </DialogHeader>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nom"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        placeholder="Nom..."
                        error={errors.last_name}
                        required
                    />
                    <Input
                        label="Prénom"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        placeholder="Prénom..."
                        error={errors.first_name}
                        required
                    />
                    <Input
                        label="Adresse mail"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Adresse mail..."
                        error={errors.email}
                        required
                    />
                    <Input
                        label="Téléphone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Numéro de téléphone..."
                        error={errors.phone}
                        required
                    />
                    <Input
                        label="Mot de passe"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Mot de passe..."
                        error={errors.password}
                        required
                    />
                    <Input
                        label="Confirmation mot de passe"
                        name="password2"
                        type="password"
                        value={form.password2}
                        onChange={handleChange}
                        placeholder="Confirmation mot de passe..."
                        error={errors.password2}
                        required
                    />

                    <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                        <Button
                            variant="secondary1"
                            className="px-4 py-2"
                            onClick={() => onOpenChange(false)}
                            type="button"
                        >
                            Retour
                        </Button>
                        <Button
                            variant="calltoaction1"
                            onClick={handleCreate}
                            className="px-6 py-2"
                            disabled={loading}
                        >
                            {loading ? "Création..." : "Créer"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

    )
}