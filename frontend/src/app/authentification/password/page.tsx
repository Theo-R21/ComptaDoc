"use client";
import Input from "@/src/app/components/input";
import Link from "next/link";
import Button from "@/src/app/components/button";
import {useState} from "react";
import {useRouter} from "next/navigation";

export default function PasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const username = formData.get("email");

        try {
            // const res = await apiFetch(`/auth/login/`, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify({username, password}),
            //     credentials: "include",
            // })
            // if (res.ok) {
            //     refreshCurrentUser()
            //     router.push("/dashboard");
            // } else {
            //     throw new Error("Identifiants invalides");
            // }
            router.push('password/code')

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
                        label="Adresse mail"
                        name="email"
                        type="email"
                        placeholder="Adresse mail..."
                        required
                    />
                </div>
                <div className="flex flex-col items-start self-start text-primary2">
                    <Link href="/authentification" className="hover:underline">Retour à la connexion</Link>
                </div>
                <Button variant="calltoaction1" className="w-full rounded-md px-4 py-2">
                    Recevoir un code
                </Button>
            </form>
        </>
    )
}