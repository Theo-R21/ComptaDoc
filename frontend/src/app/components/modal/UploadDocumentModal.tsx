"use client"

import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/src/app/components/ui/dialog"
import Button from "@/src/app/components/button"
import {useCallback, useRef, useState} from "react"
import {TypeDocumentList} from "@/src/models/documents/documents.model"
import {useNotification} from "@/src/provider/Notification";
import {TbUpload, TbX, TbFileTypePdf, TbCheck, TbAlertCircle, TbLoader2} from "react-icons/tb";
import {documentCreateSchema} from "@/src/lib/validation/document.schema";
import {formatZodErrors} from "@/src/lib/validation/helpers";
import {apiFetch} from "@/src/hook/userRefresh";

type UploadDocumentModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    societeId: string
    monthId: string
    types: TypeDocumentList[]
    onDocumentUploaded?: () => void;
}

type FileStatus = "pending" | "uploading" | "success" | "error"

interface FileEntry {
    id: string
    file: File
    typeId: string
    nom: string
    date_publication: string
    status: FileStatus
    progress: number
    error?: string
    validationErrors?: {
        path?: string
        nom?: string
        type?: string
        date_publication?: string
    }
}

export function UploadDocumentModal({
                                        open,
                                        onOpenChange,
                                        societeId,
                                        types,
                                        monthId,
                                        onDocumentUploaded,
                                    }: UploadDocumentModalProps) {
    const [files, setFiles] = useState<FileEntry[]>([])
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const {showNotification} = useNotification()

    const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"]
    const today = new Date().toISOString().split("T")[0]

    const createEntry = useCallback((file: File): FileEntry => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        typeId: types[0]?.id?.toString() ?? "",
        nom: file.name.replace(/\.(pdf|png|jpe?g)$/i, ""),
        date_publication: today,
        status: "pending",
        progress: 0,
    }), [types, today])

    const addFiles = useCallback((newFiles: File[]) => {
        const valid = newFiles.filter(f => ALLOWED_TYPES.includes(f.type))
        if (valid.length !== newFiles.length) {
            showNotification({
                title: "Fichiers ignorés",
                message: "Format non autorisé. PDF, PNG ou JPEG uniquement.",
                type: "error",
            })
        }
        setFiles(prev => [...prev, ...valid.map(createEntry)])
    }, [types, showNotification, createEntry])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        addFiles(Array.from(e.dataTransfer.files))
    }, [addFiles])

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files))
            e.target.value = ""
        }
    }

    const updateEntry = (id: string, patch: Partial<FileEntry>) => {
        setFiles(prev => prev.map(f => f.id === id ? {...f, ...patch} : f))
    }

    const removeEntry = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id))
    }

    const validateEntry = (entry: FileEntry): boolean => {
        const result = documentCreateSchema.safeParse({
            path: entry.file,
            nom: entry.nom,
            type: entry.typeId,
            date_publication: entry.date_publication,
        })
        if (!result.success) {
            updateEntry(entry.id, {
                status: "error",
                validationErrors: formatZodErrors(result.error),
                error: "Champs invalides",
            })
            return false
        }
        updateEntry(entry.id, {validationErrors: undefined, error: undefined})
        return true
    }

    const uploadOne = async (entry: FileEntry): Promise<boolean> => {
        if (!validateEntry(entry)) return false

        updateEntry(entry.id, {status: "uploading", progress: 0})

        const formData = new FormData()
        formData.append("path", entry.file)
        formData.append("type", entry.typeId)
        formData.append("societe", societeId)
        formData.append("mois", monthId)
        formData.append("nom", entry.nom)
        if (entry.date_publication) formData.append("date_publication", entry.date_publication)

        try {
            const res = await apiFetch("/documents/upload/", {
                method: "POST",
                body: formData,
                onUploadProgress: (pct) => updateEntry(entry.id, {progress: pct}),
            })

            if (!res || !res.ok) {
                let errorMsg = `Erreur ${res?.status ?? "inconnue"}`
                try {
                    const json = await res?.json()
                    errorMsg = json?.path?.[0] || json?.nom?.[0] || json?.type?.[0] || errorMsg
                } catch {}
                updateEntry(entry.id, {status: "error", error: errorMsg})
                return false
            }

            updateEntry(entry.id, {status: "success", progress: 100})
            return true

        } catch {
            updateEntry(entry.id, {status: "error", error: "Erreur réseau"})
            return false
        }
    }

    const handleUploadAll = async () => {
        const pending = files.filter(f => f.status === "pending" || f.status === "error")
        if (!pending.length) return

        setUploading(true)
        let successCount = 0

        for (const entry of pending) {
            const ok = await uploadOne(entry)
            if (ok) successCount++
        }

        setUploading(false)

        if (successCount > 0) {
            showNotification({
                title: "Succès",
                message: `${successCount} document${successCount > 1 ? "s" : ""} envoyé${successCount > 1 ? "s" : ""} avec succès.`,
                type: "success",
            })
            onDocumentUploaded?.()
        }

        const failed = files.filter(f => f.status === "error").length
        if (failed > 0) {
            showNotification({
                title: "Attention",
                message: `${failed} fichier${failed > 1 ? "s" : ""} n'ont pas pu être envoyé${failed > 1 ? "s" : ""}.`,
                type: "error",
            })
        }
    }

    const handleClose = () => {
        if (uploading) return
        setFiles([])
        onOpenChange(false)
    }

    const allDone = files.length > 0 && files.every(f => f.status === "success")
    const hasPending = files.some(f => f.status === "pending" || f.status === "error")
    const pendingCount = files.filter(f => f.status === "pending" || f.status === "error").length

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="sm:max-w-2xl lg:max-w-3xl p-0 bg-white text-gray-900 border shadow-xl overflow-hidden">
                <DialogHeader className="px-8 pt-7 pb-4 border-b">
                    <DialogTitle className="text-lg font-semibold text-primary1">
                        Téléverser des fichiers
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Ajoutez un ou plusieurs fichiers PDF à envoyer.
                    </p>
                </DialogHeader>

                <div className="px-8 py-6 space-y-5 max-h-[65vh] overflow-y-auto">
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true)
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            border-2 border-dashed rounded-xl p-8
                            flex flex-col items-center justify-center text-center
                            cursor-pointer transition-all duration-200 select-none
                            ${dragging
                            ? "border-primary1 bg-primary1/5 scale-[1.01]"
                            : "border-gray-300 hover:border-primary2 hover:bg-gray-50"
                        }
                        `}
                    >
                        <TbUpload
                            className={`h-9 w-9 mb-3 transition-colors ${dragging ? "text-primary1" : "text-gray-400"}`}/>
                        <p className="text-sm font-medium text-gray-700">
                            Glissez vos fichiers ici
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            ou{" "}
                            <span className="text-primary2 underline">cliquez pour parcourir</span>
                            {" "}— PDF, PNG, JPEG — 10 Mo max.
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="application/pdf,image/png,image/jpeg"
                            className="hidden"
                            onChange={handleFileInput}
                        />
                    </div>

                    {files.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-500">
                                {files.length} fichier{files.length > 1 ? "s" : ""} sélectionné{files.length > 1 ? "s" : ""}
                            </p>

                            {files.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={`
                                        border rounded-xl p-4 transition-all duration-200
                                        ${entry.status === "success" ? "border-green-200 bg-green-50" : ""}
                                        ${entry.status === "error" ? "border-red-200 bg-red-50" : ""}
                                        ${entry.status === "uploading" ? "border-primary3/60 bg-primary1/5" : ""}
                                        ${entry.status === "pending" ? "border-gray-200 bg-white" : ""}
                                    `}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`
                                            mt-0.5 rounded-lg p-2 flex-shrink-0
                                            ${entry.status === "success" ? "bg-green-100 text-green-600" : ""}
                                            ${entry.status === "error" ? "bg-red-100 text-red-500" : ""}
                                            ${entry.status === "uploading" ? "bg-primary1/10 text-primary1" : ""}
                                            ${entry.status === "pending" ? "bg-gray-100 text-gray-500" : ""}
                                        `}>
                                            {entry.status === "success" && <TbCheck className="h-4 w-4"/>}
                                            {entry.status === "error" && <TbAlertCircle className="h-4 w-4"/>}
                                            {entry.status === "uploading" &&
                                                <TbLoader2 className="h-4 w-4 animate-spin"/>}
                                            {entry.status === "pending" && <TbFileTypePdf className="h-4 w-4"/>}
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-2">
                                            <p className="text-xs text-gray-400 truncate">{entry.file.name}</p>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <input
                                                    className={`border rounded-lg px-3 py-1.5 text-sm text-primary1 focus:outline-none focus:ring-1 focus:ring-primary2 disabled:opacity-50 disabled:bg-gray-50 ${entry.validationErrors?.nom ? "border-red-400" : "border-gray-300"}`}
                                                    placeholder="Nom du document"
                                                    value={entry.nom}
                                                    disabled={entry.status === "uploading" || entry.status === "success"}
                                                    onChange={(e) => updateEntry(entry.id, {
                                                        nom: e.target.value,
                                                        validationErrors: {...entry.validationErrors, nom: undefined}
                                                    })}
                                                />

                                                <select
                                                    className={`border rounded-lg px-3 py-1.5 text-sm text-primary1 focus:outline-none focus:ring-1 focus:ring-primary2 disabled:opacity-50 disabled:bg-gray-50 ${entry.validationErrors?.type ? "border-red-400" : "border-gray-300"}`}
                                                    value={entry.typeId}
                                                    disabled={entry.status === "uploading" || entry.status === "success"}
                                                    onChange={(e) => updateEntry(entry.id, {
                                                        typeId: e.target.value,
                                                        validationErrors: {...entry.validationErrors, type: undefined}
                                                    })}
                                                >
                                                    <option value="" disabled>Type</option>
                                                    {types.map((t) => (
                                                        <option key={t.id} value={t.id}>{t.nom}</option>
                                                    ))}
                                                </select>

                                                <input
                                                    type="date"
                                                    className={`border rounded-lg px-3 py-1.5 text-sm text-primary1 focus:outline-none focus:ring-1 focus:ring-primary2 disabled:opacity-50 disabled:bg-gray-50 ${entry.validationErrors?.date_publication ? "border-red-400" : "border-gray-300"}`}
                                                    value={entry.date_publication}
                                                    disabled={entry.status === "uploading" || entry.status === "success"}
                                                    onChange={(e) => updateEntry(entry.id, {
                                                        date_publication: e.target.value,
                                                        validationErrors: {
                                                            ...entry.validationErrors,
                                                            date_publication: undefined
                                                        }
                                                    })}
                                                />
                                            </div>

                                            {(entry.status === "uploading" || entry.status === "success") && (
                                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${entry.status === "success" ? "bg-green-500" : "bg-primary1"}`}
                                                        style={{width: `${entry.progress}%`}}
                                                    />
                                                </div>
                                            )}

                                            {entry.validationErrors && (
                                                <div className="space-y-0.5">
                                                    {entry.validationErrors.nom &&
                                                        <p className="text-xs text-red-500">{entry.validationErrors.nom}</p>}
                                                    {entry.validationErrors.type &&
                                                        <p className="text-xs text-red-500">{entry.validationErrors.type}</p>}
                                                    {entry.validationErrors.date_publication &&
                                                        <p className="text-xs text-red-500">{entry.validationErrors.date_publication}</p>}
                                                    {entry.validationErrors.path &&
                                                        <p className="text-xs text-red-500">{entry.validationErrors.path}</p>}
                                                </div>
                                            )}

                                            {entry.status === "error" && !entry.validationErrors && entry.error && (
                                                <p className="text-xs text-red-500">{entry.error}</p>
                                            )}
                                        </div>

                                        {/* Remove button */}
                                        {entry.status !== "uploading" && entry.status !== "success" && (
                                            <button
                                                onClick={() => removeEntry(entry.id)}
                                                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition mt-0.5"
                                            >
                                                <TbX className="h-4 w-4"/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center px-8 py-5 border-t bg-gray-50">
                    <Button
                        variant="secondary1"
                        className="px-4 py-2"
                        onClick={handleClose}
                        disabled={uploading}
                    >
                        {allDone ? "Fermer" : "Annuler"}
                    </Button>

                    {!allDone && (
                        <Button
                            variant="calltoaction1"
                            className="px-6 py-2 flex items-center gap-2"
                            onClick={handleUploadAll}
                            disabled={uploading || !hasPending || files.length === 0}
                        >
                            {uploading
                                ? <><TbLoader2 className="animate-spin h-4 w-4"/> Envoi en cours...</>
                                : <><TbUpload
                                    className="h-4 w-4"/> Envoyer {pendingCount > 0 ? `(${pendingCount})` : ""}</>
                            }
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}