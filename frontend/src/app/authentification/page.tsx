"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useCurrentUser} from "@/src/hook/useCurrent";
import {apiFetch} from "@/src/hook/userRefresh";
import Input from "@/src/app/components/input";
import Link from "next/link";
import Button from "@/src/app/components/button";


export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const {refreshCurrentUser} = useCurrentUser();

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
            if (res.ok) {
                refreshCurrentUser()
                router.push("/dashboard");
            } else {
                throw new Error("Identifiants invalides");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }


    return (
        <>
            <h2 className="text-primary1 bg-clip-text text-center text-4xl">
                Connexion
            </h2>
            <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-6 px-20 py-6">
                <div className="relative w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-400">
                          <i className="ri-user-line"></i>
                        </span>
                    <Input
                        label="Identifiant"
                        name="username"
                        placeholder="Identifiant..."
                        type="text"
                        required
                    />
                </div>
                <div className="relative w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-400">
                          <i className="ri-lock-password-line"></i>
                        </span>
                    <Input
                        label="Mot de passe"
                        name="password"
                        type="password"
                        placeholder="Mot de passe..."
                        required
                    />
                </div>
                <div className="flex flex-col items-start self-start text-primary2">
                    <Link href="/authentification/password" className="hover:underline">Mot de passe oublié ?</Link>
                    <Link href="/authentification/register" className="hover:underline">Créer un compte</Link>
                </div>

                {error && <p className="text-red-400">{error}</p>}
                    <Button
                        disabled={loading}
                        variant="calltoaction1"
                        className="w-full px-4 py-2 shadow-lg"
                    >
                        {loading ? "Connexion..." : "Connexion"}
                    </Button>
            </form>
        </>

    );
}
