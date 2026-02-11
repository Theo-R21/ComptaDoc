"use client"

import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/src/app/components/ui/dialog"
import {Calendar, Upload} from "lucide-react"
import Button from "@/src/app/components/button"
import {useState} from "react"
import {apiFetch} from "@/src/hook/userRefresh"
import {TypeDocumentList} from "@/src/models/documents/documents.model"
import Input from "@/src/app/components/input";

type UploadDocumentModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    societeId: number
    monthId: number
    types: TypeDocumentList[]
}

export function UploadDocumentModal({
                                        open,
                                        onOpenChange,
                                        societeId,
                                        types,
                                        monthId,
                                    }: UploadDocumentModalProps) {
    const [selectedType, setSelectedType] = useState<number | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [docName, setDocName] = useState<string>("")
    const [docDate, setDocDate] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<{
        path?: string;
        type?: string;
        nom?: string;
        date_publication?: string;
    }>({});

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!file) {
            newErrors.path = "Vous n'avez pas déposé de fichier";
        }

        if (!docName.trim()) {
            newErrors.nom = "Le nom est obligatoire";
        }

        if (selectedType === null) {
            newErrors.type = "Vous n'avez pas sélectionné de type";
        }

        if (!docDate.trim()) {
            newErrors.date_publication = "La date de publication est obligatoire";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    const handleUpload = async () => {
        if (!validate()) return;
        if (!file || selectedType === null) return;

        const formData = new FormData()
        formData.append("path", file)
        formData.append("type", selectedType.toString())
        formData.append("societe", societeId.toString())
        formData.append("mois", monthId.toString())
        if (docName) formData.append("nom", docName)
        if (docDate) formData.append("date_publication", docDate)

        setLoading(true)

        try {
            const res = await apiFetch("/documents/upload/", {
                method: "POST",
                body: formData,
            })

            if (!res.ok) {
                const json = await res.json()
                setErrors({
                    path: json.path?.[0],
                    nom: json.nom?.[0],
                    type: json.type?.[0],
                    date_publication: json.date_publication?.[0],
                })
                return
            }

            setFile(null)
            setDocName("")
            setDocDate("")
            setSelectedType(null)
            onOpenChange(false)

        } catch (err: any) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
                    sm:max-w-xl
                    lg:max-w-2xl
                    p-8
                    bg-white text-gray-900
                    border shadow-xl
                "
            >
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-lg font-semibold">
                        Téléverser un fichier
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-sm font-medium">
                            Type de document
                        </label>
                        <select
                            className="
                                mt-1 w-full rounded-lg
                                border border-gray-300
                                bg-white px-3 py-2.5
                                text-sm text-primary1
                            "
                            value={selectedType ?? ""}
                            onChange={(e) =>
                                setSelectedType(e.target.value ? Number(e.target.value) : null)
                            }
                        >
                            <option value="" disabled>
                                {types.length === 0
                                    ? "Aucun type disponible"
                                    : "Sélectionnez un type"}
                            </option>
                            {types.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nom}
                                </option>
                            ))}
                        </select>
                        {errors.type && (
                            <p className="text-red-500 text-xs mt-1">{errors.type}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Nom du fichier
                        </label>
                        <Input
                            className="
                                mt-1 w-full rounded-lg
                                border border-gray-300
                                bg-white px-3 py-2.5
                                text-sm text-gray-900
                                placeholder-gray-400
                            "
                            placeholder="Nom du fichier..."
                            value={docName}
                            onChange={(e) => setDocName(e.target.value)}
                            error={errors.nom}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            className="
                                border-2 border-dashed rounded-xl
                                p-8
                                flex flex-col items-center justify-center
                                text-center cursor-pointer
                                hover:bg-gray-50
                                transition
                            "
                        >
                            <Upload className="h-9 w-9 text-gray-400 mb-2"/>
                            <p className="text-sm">
                                <span className="font-medium">
                                    Glissez votre fichier ici
                                </span>
                                <br/>
                                ou cliquez pour parcourir
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                PDF, PNG, JPEG – 10 Mo max.
                            </p>
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) =>
                                    e.target.files &&
                                    setFile(e.target.files[0])
                                }
                            />
                        </label>
                        {errors.path && (
                            <p className="text-red-500 text-xs mt-1">{errors.path}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Date du document
                        </label>
                        <div className="relative mt-1">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                            <input
                                type="date"
                                className="
                                    w-full rounded-lg
                                    border border-gray-300
                                    pl-10 pr-3 py-2.5
                                    text-sm
                                "
                                value={docDate}
                                onChange={(e) => setDocDate(e.target.value)}
                            />
                        </div>
                        {errors.date_publication && (
                            <p className="text-red-500 text-xs mt-1">{errors.date_publication}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-between pt-6">
                    <Button
                        variant="secondary1"
                        className="px-4 py-2"
                        onClick={() => onOpenChange(false)}
                    >
                        Retour
                    </Button>
                    <Button
                        variant="calltoaction1"
                        onClick={handleUpload}
                        disabled={loading}
                        className="px-6"
                    >
                        {loading ? "Téléversement..." : "Téléverser"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
