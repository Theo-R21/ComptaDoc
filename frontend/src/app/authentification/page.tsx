"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useCurrentUser} from "@/src/hook/useCurrent";
import {apiFetch} from "@/src/hook/userRefresh";
import Input from "@/src/app/components/input";
import Link from "next/link";
import Button from "@/src/app/components/button";
import {useNotification} from "@/src/provider/Notification";


export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const {refreshCurrentUser, user} = useCurrentUser();
    const {showNotification} = useNotification()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const username = formData.get("username");
        const password = formData.get("password");

        try {
            const res = await apiFetch(`/auth/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username, password}),
                credentials: "include",
            })

            if (!res) return;
            if (res.ok) {
                const currentUser = await apiFetch("/auth/users/me/", {credentials: "include"})
                    .then(res => res?.ok ? res.json() : null);

                showNotification({
                    title: "Succès",
                    message: `Bienvenue ${currentUser?.first_name ?? ""} ${currentUser?.last_name ?? ""}.`,
                    type: "success",
                });

                await refreshCurrentUser();
                router.push("/dashboard");
            } else {
                throw new Error("Identifiants invalides");
            }
        } catch (err: unknown) {
            showNotification({
                title: "Erreur",
                message: "Erreur lors de l'authentificaiton",
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
                    Connexion
                </h2>
                <p className="text-white/50 text-sm mt-2">
                    Connectez-vous pour continuer
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
                <Input
                    name="username"
                    label="Identifiant"
                    placeholder="Identifiant..."
                    type="text"
                    required
                    labelVariant="white"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/50"
                />
                <Input
                    name="password"
                    label="Mot de passe"
                    type="password"
                    placeholder="Mot de passe..."
                    required
                    labelVariant="white"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/50"
                />

                <div className="flex flex-col items-start text-white/50 text-sm gap-1 mt-1">
                    <Link href="/authentification/password" className="hover:text-white hover:underline transition">
                        Mot de passe oublié ?
                    </Link>
                    <Link href="/authentification/register" className="hover:text-white hover:underline transition">
                        Créer un compte
                    </Link>
                </div>

                {error && (
                    <p className="text-red-300 text-sm text-center bg-red-500/15 border border-red-400/30 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <Button
                    variant="calltoaction1"
                    disabled={loading}
                    className="w-full px-4 py-2.5 mt-2 shadow-lg"
                >
                    {loading ? "Connexion..." : "Connexion"}
                </Button>
            </form>
        </>
    );
}
