export interface DocumentsList {
    id: number;
    nom: string;
    type: TypeDocumentList;
    path: string;
    date_publication: Date;
}

export interface TypeDocumentList{
    id: string;
    nom: string;
}