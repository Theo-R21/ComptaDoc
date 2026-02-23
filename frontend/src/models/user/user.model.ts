export interface UserModel {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    is_superuser: boolean;
}

export interface UserInfoModel extends UserModel {
    username: string;
    last_login: string | null;
    date_joined: string;
    is_active: boolean;
}