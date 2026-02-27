"use client";

import {useEffect, useState} from "react";
import {UserModel} from "@/src/models/user/user.model";
import {apiFetch} from "@/src/hook/userRefresh";
import {CurrentUserContext} from "../hook/useCurrent";
import {useRouter} from "next/navigation";

export function UserProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserModel | null | undefined>(undefined); // undefined = loading
    const router = useRouter();

    async function fetchUser() {
        try {
            const res = await apiFetch(`/auth/users/me/`, {credentials: "include"});
            if (res && res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("Erreur fetchUser:", err);
            setUser(null);
        }
    }

    async function logout() {
        try {
            await apiFetch(`/auth/logout/`, {method: "POST", credentials: "include"});
        } catch (err) {
            console.error("Erreur logout:", err);
        } finally {
            setUser(null);
            router.push("/authentification");
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    function refreshCurrentUser() {
        fetchUser();
    }

    if (user === undefined) return null;

    return (
        <CurrentUserContext.Provider value={{user, refreshCurrentUser, logout}}>
            {children}
        </CurrentUserContext.Provider>
    );
}