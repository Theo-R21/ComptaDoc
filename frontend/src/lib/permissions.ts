import {UserModel} from "@/src/models/user/user.model";

export const hasRole = (user: UserModel | null, roles: string[]) => {
    if (!user) return false;
    if (user.is_superuser) return true;

    return user.roles?.some(r => roles.includes(r.label)) ?? false;
};