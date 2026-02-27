"use client";
import {useRouter} from "next/navigation";
import {IoIosCheckmarkCircle} from "react-icons/io";
import Button from "@/src/app/components/button";

export default function AccountPage() {
    const router = useRouter();

    return (
        <>
            <div className="flex flex-col items-center gap-5 text-center">
                <div
                    className="w-20 h-20 rounded-full bg-calltoactionsuccess/20 border border-calltoactionsuccess/40 flex items-center justify-center">
                    <IoIosCheckmarkCircle className="text-calltoactionsuccess text-5xl"/>
                </div>

                <div>
                    <h1 className="text-white text-2xl font-bold">
                        Compte créé avec succès !
                    </h1>
                    <p className="text-white/60 text-sm mt-2 leading-relaxed">
                        Votre compte a bien été créé.<br/>
                        Un administrateur doit l'activer avant votre première connexion.
                    </p>
                </div>

                <Button
                    variant="calltoaction1"
                    className="w-full px-6 py-2.5 mt-2 shadow-lg"
                    onClick={() => router.push('/authentification')}
                >
                    Retour à la connexion
                </Button>
            </div>
        </>
    );
}