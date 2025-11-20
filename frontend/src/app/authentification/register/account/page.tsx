"use client";
import {useRouter} from "next/navigation";
import {IoIosCheckmarkCircle} from "react-icons/io";
import Button from "@/src/app/components/button";

export default function AccountPage() {
    const router = useRouter();

    return (
        <>
            <div className="bg-primary3 p-8 rounded-3xl flex flex-col items-center gap-4 max-w-md mx-auto">
                <IoIosCheckmarkCircle className="text-calltoactionsuccess text-7xl"/>
                <h1 className="text-primary1 text-center text-xl font-medium">Compte créé avec succès !</h1>
                <p className="text-black text-center text-sm leading-relaxed">
                    <span className="font-semibold">Votre compte a bien été créé.
                    <br/>
                    Un administrateur doit l'activer avant votre première connexion.</span>
                </p>
                <Button
                    variant="calltoaction1"
                    className="w-full rounded-lg px-6 py-3 mt-2"
                    onClick={() => router.push('/authentification')}
                >
                    Retour à la connexion
                </Button>
            </div>
        </>
    )
}