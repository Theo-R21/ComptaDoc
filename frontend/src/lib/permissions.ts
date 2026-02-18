import {UserInfoModel} from "@/src/models/user/user.model";

export const hasRole = (user: UserInfoModel | null, roles: string[]) => {
    if (!user) return false;
    if (user.is_superuser) return true;

    return roles.includes(user.role);
};


