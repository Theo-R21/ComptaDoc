"use client";
import Input from "@/src/app/components/input";
import Link from "next/link";
import Button from "@/src/app/components/button";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {apiFetch} from "@/src/hook/userRefresh";
import {formatZodErrors} from "@/src/lib/validation/helpers";
import {emailUserSchema} from "@/src/lib/validation/user.schema";
import {useNotification} from "@/src/provider/Notification";
import {useCurrentUser} from "@/src/hook/useCurrent";

export default function PasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
    }>({});
    const {showNotification} = useNotification()


    const validate = (email: string) => {
        const result = emailUserSchema.safeParse({email});

        if (!result.success) {
            setErrors(formatZodErrors(result.error));
            return false;
        }

        setErrors({});
        return true;
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        if (!validate(email)) {
            setLoading(false);
            return;
        }

        try {
            const res = await apiFetch(`/auth/password_reset/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email}),
            })
            if (!res) return;

            const resData = await res.json();

            if (res.ok) {
                localStorage.setItem("email", email);
                router.push(`password/code`);
            } else {
                throw new Error(resData.message);
            }
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
            <div className="mb-8 text-center">
                <h2 className="text-white text-3xl font-bold tracking-tight">
                    Mot de passe oublié
                </h2>
                <p className="text-white/50 text-sm mt-2">
                    Entrez votre adresse mail pour recevoir un code de réinitialisation
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
                <Input
                    label="Adresse mail"
                    name="email"
                    type="email"
                    placeholder="Adresse mail..."
                    error={errors.email}
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
                    type="submit"
                >
                    {loading ? "Envoi..." : "Recevoir un code"}
                </Button>
            </form>
        </>
    );
}