import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/src/app/components/ui/dialog"
import Button from "@/src/app/components/button";
import {useState} from "react";
import {apiFetch} from "@/src/hook/userRefresh";
import Input from "@/src/app/components/input";


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

    const frenchPhoneRegex = /^(?:(?:\+33|0033)\s?|0)[1-9](?:[\s.-]?\d{2}){4}$/;
    const luxPhoneRegex = /^(?:(?:\+352|00352)\s?)?[2-9]\d{7,8}$/;

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

    const isValidPhone = (phone: string) =>
        frenchPhoneRegex.test(phone) || luxPhoneRegex.test(phone);

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!form.first_name.trim()) newErrors.first_name = "Le prénom est obligatoire.";
        if (!form.last_name.trim()) newErrors.last_name = "Le nom est obligatoire.";

        if (!form.email.trim()) newErrors.email = "L'email est obligatoire.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = "Format d'email invalide.";

        if (!form.phone.trim()) newErrors.phone = "Le numéro de téléphone est obligatoire.";
        else if (!isValidPhone(form.phone))
            newErrors.phone = "Numéro français ou luxembourgeois invalide.";

        if (!form.password) newErrors.password = "Le mot de passe est obligatoire.";
        if (!form.password2) newErrors.password2 = "La confirmation est obligatoire.";
        if (form.password && form.password2 && form.password !== form.password2)
            newErrors.password2 = "Les mots de passe ne correspondent pas.";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

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

            onOpenChange(false);
            if (onSocieteCreated) onSocieteCreated();
            setErrors({});
        } catch (err: any) {
            if (err.name !== "AbortError") console.error(err);
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