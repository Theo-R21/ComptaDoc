"use client";
import Input from "@/src/app/components/input";
import Link from "next/link";
import Button from "@/src/app/components/button";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {apiFetch} from "@/src/hook/userRefreshClient";

export default function PasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        try {
            const res = await apiFetch(`/auth/password_reset/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email}),
            })
            const resData = await res.json();

            if (res.ok) {
                localStorage.setItem("email", email);
                router.push(`password/code`);
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
                        label="Adresse mail"
                        name="email"
                        type="email"
                        placeholder="Adresse mail..."
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
                    Recevoir un code
                </Button>
            </form>
        </>
    )
}