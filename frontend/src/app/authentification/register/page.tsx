"use client";
import Input from "@/src/app/components/input";
import Link from "next/link";
import Button from "@/src/app/components/button";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {apiFetch} from "@/src/hook/userRefresh";

export default function RegisterPage() {
    const router = useRouter();
    const [prefix, setPrefix] = useState("+33");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        const data: Record<string, any> = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            const res = await apiFetch(`/auth/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
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
            <h2 className="text-primary1 bg-clip-text text-center text-4xl">Création d&#39;un compte</h2>
            <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-3 px-20 py-6">
                <div className="relative w-full">
                    <Input
                        label="Nom"
                        name="last_name"
                        type="text"
                        placeholder="Nom..."
                        required
                    />
                </div>
                <div className="relative w-full">
                    <Input
                        label="Prénom"
                        name="first_name"
                        type="text"
                        placeholder="Prénom..."
                        required
                    />
                </div>
                <div className="relative w-full">
                    <Input
                        label="Adresse mail"
                        name="email"
                        type="email"
                        placeholder="Adresse mail..."
                        required
                    />
                </div>
                <div className="relative w-full">
                    {/*<select*/}
                    {/*    name="phone_prefix"*/}
                    {/*    value={prefix}*/}
                    {/*    onChange={(e) => setPrefix(e.target.value)}*/}
                    {/*    className="rounded-md border border-primary2 bg-white px-2 py-3 text-primary1"*/}
                    {/*>*/}
                    {/*    {countryPrefixes.map((c) => (*/}
                    {/*        <option key={c.iso} value={c.prefix}>*/}
                    {/*            <span className="inline-block w-5">{<c.flag/>}</span>*/}
                    {/*            {c.prefix}*/}
                    {/*        </option>*/}

                    {/*    ))}*/}
                    {/*</select>*/}
                    <Input
                        label="Téléphone"
                        name="phone"
                        type="tel"
                        placeholder="Numéro de téléphone..."
                        required
                    />
                </div>
                <div className="relative w-full">
                    <Input
                        label="Nom de société"
                        name="societe"
                        type="text"
                        placeholder="Nom de société..."
                        required
                    />
                </div>
                <div className="relative w-full">
                    <Input
                        label="Mot de passe"
                        name="password1"
                        type="password"
                        placeholder="Mot de passe..."
                        required
                    />
                </div>
                <div className="relative w-full">
                    <Input
                        label="Confirmation mot de passe"
                        name="password2"
                        type="password"
                        placeholder="Confirmation mot de passe..."
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
                    Créer un compte
                </Button>
            </form>
        </>
    )
}