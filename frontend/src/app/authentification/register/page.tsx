"use client";
import Input from "@/src/app/components/input";
import Link from "next/link";
import Button from "@/src/app/components/button";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {apiFetch} from "@/src/hook/userRefresh";
import {userCreateSchema} from "@/src/lib/validation/user.schema";
import {formatZodErrors} from "@/src/lib/validation/helpers";
import {useNotification} from "@/src/provider/Notification";

export default function RegisterPage() {
    const router = useRouter();
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
        setErrors((prev) => ({...prev, [name]: undefined}));
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
            console.log(form)
            const res = await apiFetch(`/user/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!res) return;

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
            } else {
                router.push('/authentification/register/account')
            }

            setErrors({});
        } catch (err: unknown) {
            showNotification({
                title: "Erreur",
                message: String(err),
                type: "error",
            })
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="mb-6 text-center">
                <h2 className="text-white text-3xl font-bold tracking-tight">
                    Création d'un compte
                </h2>
                <p className="text-white/50 text-sm mt-2">
                    Remplissez les informations ci-dessous
                </p>
            </div>

            <div className="flex w-full flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Nom"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        placeholder="Nom..."
                        error={errors.last_name}
                        required
                        labelVariant="white"
                    />
                    <Input
                        label="Prénom"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        placeholder="Prénom..."
                        error={errors.first_name}
                        required
                        labelVariant="white"
                    />
                </div>
                <Input
                    label="Adresse mail"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Adresse mail..."
                    error={errors.email}
                    required
                    labelVariant="white"
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
                    labelVariant="white"
                />
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Mot de passe"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Mot de passe..."
                        error={errors.password}
                        required
                        labelVariant="white"
                    />
                    <Input
                        label="Confirmation"
                        name="password2"
                        type="password"
                        value={form.password2}
                        onChange={handleChange}
                        placeholder="Confirmation..."
                        error={errors.password2}
                        required
                        labelVariant="white"
                    />
                </div>

                <Link
                    href="/authentification"
                    className="text-white/50 text-sm hover:text-white hover:underline transition"
                >
                    Retour à la connexion
                </Link>

                <Button
                    variant="calltoaction1"
                    className="w-full px-4 py-2.5 mt-1 shadow-lg"
                    onClick={handleCreate}
                    disabled={loading}
                >
                    {loading ? "Création..." : "Créer un compte"}
                </Button>
            </div>
        </>
    );
}
