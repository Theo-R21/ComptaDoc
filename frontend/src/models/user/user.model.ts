export class UserModel {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;

    constructor(
        id: number = 0,
        first_name: string = "",
        last_name: string = "",
        email: string = "",
        phone: string = "",
    ) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.phone = phone;
    }
}

export class UserInfoModel {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone: string;
    last_login: Date;
    date_joined: Date;
    is_active: boolean;
    is_superuser: boolean;
    role: string;

    constructor(
        id: number = 0,
        first_name: string = "",
        last_name: string = "",
        username: string = "",
        phone: string = "",
        last_login: Date = new Date(),
        date_joined: Date = new Date(),
        is_active: boolean = false,
        is_superuser: boolean = false,
        email: string = "",
        role: string = "",
    ) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.username = username;
        this.phone = phone;
        this.last_login = last_login;
        this.date_joined = date_joined;
        this.is_active = is_active;
        this.is_superuser = is_superuser;
        this.email = email;
        this.role = role
    }
}

