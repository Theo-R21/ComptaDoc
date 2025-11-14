"use client";

import {useState} from "react";
//import 'remixicon/fonts/remixicon.css';
import {useRouter} from "next/navigation";
import {useCurrentUser} from "@/src/hook/useCurrent";
import {apiFetch} from "@/src/hook/userRefresh";


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
        <main className="flex h-dvh w-dvw flex-col items-center justify-center gap-12 bg-primary1">
            <div className="grid size-full grid-cols-3 rounded-xl">
                <div className="relative col-span-2 rounded max-lg:hidden">
                    <div className="relative z-10 grid size-full place-items-center p-20">
                        <div className="flex flex-col items-center gap-4">
                            <h1 className="text-white text-center text-7xl">
                                Bienvenue sur SimplyLux
                            </h1>
                            <p className="text-secondary2 text-center text-xl">
                                Le site de partage de document pour la comptabilité
                            </p>
                        </div>
                    </div>
                </div>


                <div
                    className="col-span-1 flex flex-col items-center justify-center rounded-r bg-white max-lg:col-span-3">
                    <h2 className="text-primary1 bg-clip-text text-center text-4xl">
                        Connexion
                    </h2>
                    <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-6 px-20 py-6">
                        <div className="relative w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-400">
                          <i className="ri-user-line"></i>
                        </span>
                            <input
                                type="text"
                                placeholder="Username"
                                name="username"
                                className="w-full rounded-lg pl-10 pr-3 py-2 bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>
                        <div className="relative w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-400">
                          <i className="ri-lock-password-line"></i>
                        </span>
                            <input
                                type="password"
                                placeholder="Password"
                                name="password"
                                className="w-full rounded-lg pl-10 pr-3 py-2 bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>
                        {error && <p className="text-red-400">{error}</p>}
                        <div className="relative w-60">
                            <button
                                disabled={loading}
                                className="w-full rounded-md px-4 py-2 bg-calltoaction1 hover:bg-calltoaction2 transition text-black shadow-lg"
                            >
                                {loading ? "Connexion..." : "Connexion"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
