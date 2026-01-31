import {UserInfoModel} from "@/src/models/user/user.model";

// src/lib/permissions.ts
export const hasRole = (user: UserInfoModel, roles: string[]) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return roles.includes(user.role);
};

