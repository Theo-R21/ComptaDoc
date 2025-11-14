"use client";
import {useEffect, useState} from "react";
import {UserModel} from "@/src/models/user/user.model";
import {apiFetch} from "@/src/hook/userRefresh";
import { CurrentUserContext } from "../hook/useCurrent";


export function UserProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserModel | null>(null);

    async function fetchUser() {
        try {
            const res = await apiFetch(`/auth/users/me/`, {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (err) {
            console.error("Erreur fetchUser:", err);
        }
    };

    async function logout() {
        try {
            await apiFetch(`/auth/logout/`, {
                method: "POST",
                credentials: "include",
            });
        } catch (err) {
            console.error("Erreur logout:", err);
        } finally {
            setUser(null);
        }
    }

    useEffect(() => {
        fetchUser().then();
    }, []);

    function refreshCurrentUser() {
        fetchUser().then();
    }

    return (
        <CurrentUserContext.Provider value={{user, refreshCurrentUser, logout}}>
            {children}
        </CurrentUserContext.Provider>
    );
}
