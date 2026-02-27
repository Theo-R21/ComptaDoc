"use client";

import { useCurrentUser } from "@/src/hook/useCurrent";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasRole } from "@/src/lib/permissions";

type RoleGuardProps = {
    allowedRoles?: string[];
    forbiddenRoles?: string[];
    children: React.ReactNode;
};

export default function RoleGuard({
    allowedRoles,
    forbiddenRoles,
    children,
}: RoleGuardProps) {
    const { user } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        if (user.is_superuser) return;

        if (forbiddenRoles?.includes(user.role)) {
            router.replace("/403");
            return;
        }

        if (allowedRoles && !hasRole(user, allowedRoles)) {
            router.replace("/403");
        }
    }, [user, allowedRoles, forbiddenRoles, router]);

    if (!user) return null;

    return <>{children}</>;
}
