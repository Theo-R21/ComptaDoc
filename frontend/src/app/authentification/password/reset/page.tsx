"use client";
import Input from "@/src/app/components/input";
import Link from "next/link";
import Button from "@/src/app/components/button";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {apiFetch} from "@/src/hook/userRefresh";
import {resetPasswordSchema} from "@/src/lib/validation/user.schema";
import {formatZodErrors} from "@/src/lib/validation/helpers";
import {useNotification} from "@/src/provider/Notification";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        password1?: string;
        password2?: string;
    }>({});
    const {showNotification} = useNotification()

    const validate = (psw1: string, psw2: string) => {
        const result = resetPasswordSchema.safeParse({
            password1: psw1,
            password2: psw2,
        })

        if (!result.success) {
            setErrors(formatZodErrors(result.error))
            return false
        }

        return true
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const password1 = formData.get("password1") as string;
        const password2 = formData.get("password2") as string;

        if (!validate(password1, password2)) {
            setLoading(false);
            return;
        }

        const resetToken = localStorage.getItem("resetToken");

        try {
            const res = await apiFetch(`/auth/password_reset/change/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({reset_token: resetToken, password1: password1, password2: password2}),
            });
            if (!res) return;

            const resData = await res.json();
            if (res.ok) {
                router.push("/authentification");
                showNotification({
                    title: "Succès",
                    message: `Mot de passe modifé avec succès.`,
                    type: "success",
                })
            } else {
                throw new Error(resData.message);
            }
        } catch (err: unknown) {
            showNotification({
                title: "Erreur",
                message: "Erreur lors de la modification du mot de passe",
                type: "error",
            })
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="mb-8 text-center">
                <h2 className="text-white text-3xl font-bold tracking-tight">
                    Réinitialisation
                </h2>
                <p className="text-white/50 text-sm mt-2">
                    Choisissez votre nouveau mot de passe
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
                <Input
                    label="Nouveau mot de passe"
                    name="password1"
                    type="password"
                    placeholder="Nouveau mot de passe..."
                    error={errors.password1}
                    required
                    labelVariant="white"
                />
                <Input
                    label="Confirmer le mot de passe"
                    name="password2"
                    type="password"
                    placeholder="Confirmation..."
                    error={errors.password2}
                    required
                    labelVariant="white"
                />

                <Link
                    href="/authentification"
                    className="text-white/50 text-sm hover:text-white hover:underline transition"
                >
                    Retour à la connexion
                </Link>

                <Button
                    variant="calltoaction1"
                    disabled={loading}
                    className="w-full px-4 py-2.5 mt-1 shadow-lg"
                >
                    {loading ? "Modification..." : "Changer le mot de passe"}
                </Button>
            </form>
        </>
    );
}