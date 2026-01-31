"use client";

import { useCurrentUser } from "@/src/hook/useCurrent";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoleGuard({
    allowedRoles,
    children,
}: {
    allowedRoles: string[];
    children: React.ReactNode;
}) {
    const { user } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            if (user.is_superuser) return;

            if (!allowedRoles.includes(user.role)) {
                router.replace("/dashboard");
            }
        }
    }, [user, allowedRoles, router]);

    if (!user) return null;

    return <>{children}</>;
}
