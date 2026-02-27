"use client";

import { useCurrentUser } from "@/src/hook/useCurrent";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export function AuthGuard({ children, allowedRoles }: Props) {
  const { user } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/authentification");
      return;
    }

    if (user.is_superuser) {
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/403");
    }
  }, [user]);

  if (!user) return null;

  return <>{children}</>;
}