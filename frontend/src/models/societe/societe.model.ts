import {UserModel} from "@/src/models/user/user.model";

export interface SocieteInfo {
    id: string ;
    nom: string;
    ID_SCTE: string;
    user: UserModel

}

export interface SocieteMonthInfo {
    id: string;
    month: number;
    month_name: string;
    year: number;
    status: "OPEN" | "LOCKED" | string;
}