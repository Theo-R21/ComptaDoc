import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/src/app/components/ui/dialog"

type PdfViewerModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pdfUrl: string | null;
    title?: string;
};

export function PdfViewerModal({
                                   open,
                                   onOpenChange,
                                   pdfUrl,
                                   title = "Visualisation du document",
                               }: PdfViewerModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
      w-3xl
      h-screen
      p-0
      flex flex-col
    "
            >
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            title="PDF Viewer"
                            className="w-full h-full border-0"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Aucun document à afficher
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>


    );
}
