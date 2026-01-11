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