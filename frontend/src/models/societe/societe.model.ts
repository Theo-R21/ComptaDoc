import {UserModel} from "@/src/models/user/user.model";

export class SocieteInfo {
    id: number;
    nom: string;
    user: UserModel

    constructor(id: number, nom: string, user: UserModel) {
        this.id = id;
        this.nom = nom;
        this.user = user;
    }
}

export class SocieteMonthInfo {
    id: number;
    month: number;
    month_name: string;
    year: number;
    status: "OPEN" | "LOCKED" | string;


    constructor(id: number, month: number, month_name: string, year: number, status: "OPEN" | "LOCKED" | string) {
        this.id = id;
        this.month = month;
        this.month_name = month_name;
        this.year = year;
        this.status = status;
    }
}