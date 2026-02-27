import {UserModel} from "@/src/models/user/user.model";

interface WithRole {
    role: string;
    is_superuser: boolean;
}

export const hasRole = (user: UserModel | null, roles: string[]) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return roles.includes(user.role);
};