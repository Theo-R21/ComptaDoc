'use client'
import {useRef, useState} from 'react'
import Link from 'next/link'
import Button from "@/src/app/components/button";
import {useRouter} from "next/navigation";
import {apiFetch} from "@/src/hook/userRefresh";

export default function CodePage() {
    const router = useRouter();
    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

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
            const resData = await res.json();

            if (res.ok) {
                localStorage.setItem("resetToken", resData.reset_token);
                router.push('reset')
            } else {
                throw new Error(resData.message);
            }
        } catch (err: never) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex w-full flex-col items-center gap-6 p-8">
            <h1 className="text-2xl font-semibold text-gray-800">
                Mot de passe oublié
            </h1>

            <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div>
                    <label className="text-gray-700 font-medium text-lg mb-2">
                        Code d&#39;authentification
                    </label>

                    <div className="flex justify-center gap-2 py-2 text-primary1">
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
                                    className="h-14 w-14 rounded-lg border-2 border-gray-300 text-center text-xl font-medium focus:border-gray-400 focus:outline-none"
                                />
                                {index < 5 && (
                                    <span className="mx-2 flex h-14 items-center text-xl text-gray-400">-</span>
                                )}
                            </>
                        ))}
                    </div>
                </div>
                {error && (
                    <p className="text-red-500 text-sm text-left w-full">
                        {error}
                    </p>
                )}
                <div className="flex flex-col items-start self-start text-primary2">
                    <Link
                        href="/authentication/login"
                        className="hover:underline"
                    >
                        Retour à la connexion
                    </Link>
                </div>

                <Button
                    type="submit"
                    variant="calltoaction1"
                    className="w-full py-3 shadow-lg"
                >
                    Continuer
                </Button>
            </form>
        </div>
    )
}