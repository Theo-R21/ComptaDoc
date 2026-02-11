"use client";
import Input from "@/src/app/components/input";
import Link from "next/link";
import Button from "@/src/app/components/button";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {apiFetch} from "@/src/hook/userRefresh";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const frenchPhoneRegex = /^(?:(?:\+33|0033)\s?|0)[1-9](?:[\s.-]?\d{2}){4}$/;
    const luxPhoneRegex = /^(?:(?:\+352|00352)\s?)?[2-9]\d{7,8}$/;

    const [form, setForm] = useState({
        last_name: "",
        first_name: "",
        email: "",
        phone: "",
        societe: "",
        password1: "",
        password2: "",
    });

    const [errors, setErrors] = useState<{
        last_name?: string;
        first_name?: string;
        email?: string;
        phone?: string;
        societe?: string;
        password1?: string;
        password2?: string;
    }>({});

    const isValidPhone = (phone: string) =>
        frenchPhoneRegex.test(phone) || luxPhoneRegex.test(phone);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
        setErrors((prev) => ({...prev, [name]: undefined}));
    };

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

        if (!form.societe.trim()) newErrors.societe = "Le nom de société est obligatoire.";

        if (!form.password1) newErrors.password1 = "Le mot de passe est obligatoire.";
        if (!form.password2) newErrors.password2 = "La confirmation est obligatoire.";
        if (form.password1 && form.password2 && form.password1 !== form.password2)
            newErrors.password2 = "Les mots de passe ne correspondent pas.";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        try {
            const res = await apiFetch(`/auth/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const resData = await res.json();

            if (res.ok) {
                router.push("/authentification");
            } else {
                setErrors(resData);
            }
        } catch (err: any) {
            if (err.name !== "AbortError") console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h2 className="text-primary1 bg-clip-text text-center text-4xl">
                Création d'un compte
            </h2>
            <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col items-center gap-3 px-20 py-6"
            >
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
                    label="Nom de société"
                    name="societe"
                    type="text"
                    value={form.societe}
                    onChange={handleChange}
                    placeholder="Nom de société..."
                    error={errors.societe}
                    required
                />
                <Input
                    label="Mot de passe"
                    name="password1"
                    type="password"
                    value={form.password1}
                    onChange={handleChange}
                    placeholder="Mot de passe..."
                    error={errors.password1}
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
                <div className="flex flex-col items-start self-start text-primary2">
                    <Link href="/authentification" className="hover:underline">
                        Retour à la connexion
                    </Link>
                </div>
                <Button
                    type="submit"
                    variant="calltoaction1"
                    className="w-full rounded-md px-4 py-2"
                    disabled={loading}
                >
                    {loading ? "Création..." : "Créer un compte"}
                </Button>
            </form>
        </>
    );
}
