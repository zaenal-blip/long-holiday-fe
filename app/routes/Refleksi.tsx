import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Replace, Trash2 } from "lucide-react";
import { apiFetch, API_BASE } from "@/lib/api";
import { toast } from "sonner";

const Refleksi = () => {
    const [pdfPath, setPdfPath] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadReflection = async () => {
            try {
                const response = await apiFetch<{ imagePath?: string }>("/reflection/latest");
                if (response?.imagePath) {
                    setPdfPath(response.imagePath);
                }
            } catch (error) {
                console.error("Reflection fetch failed", error);
            }
        };

        loadReflection();
    }, []);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || file.type !== "application/pdf") {
            toast.error("Please select a valid PDF file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name);

        try {
            const response = await fetch(`${API_BASE}/reflection/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            setPdfPath(data.imagePath);
            toast.success("PDF uploaded successfully");
        } catch (error) {
            console.error("Failed upload reflection", error);
            toast.error("Failed to upload PDF to server.");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemove = async () => {
        // Technically this deletes the latest conceptually, but let's just clear the UI memory
        // if user wants to truly delete, we should send a DELETE request. 
        // For now, we mimic previous clear logic. 
        setPdfPath(null);
    };

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
                <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/5 animate-pulse-slow" />
                <div className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full bg-secondary/5 animate-pulse-slow" style={{ animationDelay: "4s" }} />
            </div>

            <div className="p-6 max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Refleksi Problem Last Year</h2>
                        <p className="text-muted-foreground">Upload and review the reflection report from previous long holidays</p>
                    </div>
                    <div className="flex gap-2">
                        {pdfPath && (
                            <Button variant="outline" onClick={handleRemove} className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30">
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </Button>
                        )}
                        <Button onClick={() => fileInputRef.current?.click()} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-md">
                            {pdfPath ? <Replace className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                            {pdfPath ? "Replace File" : "Upload Reflection File"}
                        </Button>
                        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
                    </div>
                </div>

                {/* PDF Viewer or Empty State */}
                {pdfPath ? (
                    <Card className="overflow-hidden shadow-md border-border/60">
                        <iframe
                            src={pdfPath.startsWith("http") ? pdfPath : `${API_BASE}${pdfPath}`}
                            title="Refleksi PDF"
                            className="w-full border-0"
                            style={{ height: "calc(100vh - 180px)" }}
                        />
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-24 border-dashed border-2 border-border bg-muted/30">
                        <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">No reflection file uploaded</p>
                        <p className="text-sm text-muted-foreground/70 mt-1 mb-6">Upload a PDF document to view it here</p>
                        <Button onClick={() => fileInputRef.current?.click()} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                            <Upload className="h-4 w-4" />
                            Upload PDF
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Refleksi;
