'use client'
import {useRef, useState} from 'react'
import Link from 'next/link'
import Button from "@/src/app/components/button";
import {useRouter} from "next/navigation";
import {apiFetch} from "@/src/hook/userRefresh";
import {useNotification} from "@/src/provider/Notification";

export default function CodePage() {
    const router = useRouter();
    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const {showNotification} = useNotification()

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return
        if (value && !/^\d$/.test(value)) return

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const otp = code.join("");
        const email = localStorage.getItem("email");

        try {
            const res = await apiFetch(`/auth/password_reset/code/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email, code: otp}),
            })
            if (!res) return;

            const resData = await res.json();

            if (res.ok) {
                localStorage.setItem("resetToken", resData.reset_token);
                router.push('reset')
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
                    Code de vérification
                </h2>
                <p className="text-white/50 text-sm mt-2">
                    Entrez le code reçu par email
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
                <div>
                    <label className="text-white/80 font-medium text-sm mb-3 block">
                        Code d'authentification
                    </label>
                    <div className="flex justify-center items-center gap-2">
                        {code.map((digit, index) => (
                            <>
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="h-12 w-12 rounded-xl border-2 border-white/20 bg-white/10 text-center text-xl font-bold text-white focus:border-calltoaction1 focus:outline-none transition backdrop-blur-sm"
                                />
                                {index < 5 && (
                                    <span className="text-white/30 text-lg">—</span>
                                )}
                            </>
                        ))}
                    </div>
                </div>

                {error && (
                    <p className="text-red-300 text-sm text-center bg-red-500/15 border border-red-400/30 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <Link
                    href="/authentification"
                    className="text-white/50 text-sm hover:text-white hover:underline transition"
                >
                    Retour à la connexion
                </Link>

                <Button
                    type="submit"
                    variant="calltoaction1"
                    disabled={loading}
                    className="w-full py-2.5 shadow-lg"
                >
                    {loading ? "Vérification..." : "Continuer"}
                </Button>
            </form>
        </>
    );
}