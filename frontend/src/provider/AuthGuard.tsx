"use client";

import {useCurrentUser} from "@/src/hook/useCurrent";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {RoleInfo} from "@/src/models/user/user.model";

type Props = {
    children: React.ReactNode;
    allowedRoles?: string[];
};

export function AuthGuard({children, allowedRoles}: Props) {
    const {user} = useCurrentUser();
    const router = useRouter();
    useEffect(() => {
        if (user === null) {
            router.replace("/authentification");
            return;
        }

        if (user.is_superuser) {
            return;
        }

        if (allowedRoles && !allowedRoles.some(role =>
            user.roles?.some((r: RoleInfo) => r.label.toLowerCase() === role.toLowerCase())
        )) {
            router.replace("/403");
        }
    }, [user]);

    if (!user) return null;

    return <>{children}</>;
}