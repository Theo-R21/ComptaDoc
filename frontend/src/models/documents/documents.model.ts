export class DocumentsList {
    id: number;
    nom: string;
    type: TypeDocumentList;
    path: string;
    date_publication: Date;


    constructor(id: number, nom: string, type: TypeDocumentList, path: string, date_publication: Date) {
        this.id = id;
        this.nom = nom;
        this.type = type;
        this.path = path;
        this.date_publication = date_publication;
    }
}

export class TypeDocumentList{
    id: string;
    nom: string;

    constructor(id: string, nom: string) {
        this.id = id;
        this.nom = nom;
    }
}