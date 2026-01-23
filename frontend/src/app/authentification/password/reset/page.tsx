"use client";
import Input from "@/src/app/components/input";
import Link from "next/link";
import Button from "@/src/app/components/button";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {apiFetch} from "@/src/hook/userRefreshClient";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const password1 = formData.get("password1") as string;
        const password2 = formData.get("password2") as string;
        const resetToken = localStorage.getItem("resetToken");

        if (!password1 || !password2 || password1 !== password2) {
            setError("Les mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }

        if (!resetToken) {
            setError("Token manquant. Veuillez recommencer la procédure.");
            setLoading(false);
            return;
        }

        try {
            const res = await apiFetch(`/auth/password_reset/change/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({reset_token: resetToken, password1: password1, password2: password2}),
            });
            const resData = await res.json();
            if (res.ok) {
                router.push("/authentification");
            } else {
                throw new Error(resData.message);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h2 className="text-primary1 bg-clip-text text-center text-4xl">Mot de passe oublié</h2>
            <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-6 px-20 py-6">
                <div className="relative w-full">
                    <Input
                        label="Nouveau mot de passe"
                        name="password1"
                        type="password"
                        placeholder="Nouveau mot de passe..."
                        required
                    />
                </div>
                <div className="relative w-full">
                    <Input
                        label="Re-taper le nouveau mot de passe"
                        name="password2"
                        type="password"
                        placeholder="Nouveau mot de passe..."
                        required
                    />
                </div>
                 {error && (
                    <p className="text-red-500 text-sm text-left w-full">
                        {error}
                    </p>
                )}
                <div className="flex flex-col items-start self-start text-primary2">
                    <Link href="/authentification" className="hover:underline">Retour à la connexion</Link>
                </div>
                <Button variant="calltoaction1" className="w-full rounded-md px-4 py-2">
                    Changer mot de passe
                </Button>
            </form>
        </>
    )
}