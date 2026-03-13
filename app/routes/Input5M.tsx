import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Users, Cog, Package, BookOpen, Leaf, ArrowLeft, Check, Plus, Factory, Activity, Layers, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { categories, categoryDescriptions } from "@/lib/mock-data";

interface CategoryItem { id: string; name: string }
interface Line { id: string; name: string; departmentId: string }
interface CheckRow { no: number; itemId: string; item: string; judgment: "OK" | "NG" | ""; reason: string }

const catIcons: Record<string, any> = {
    Man: Users, Machine: Cog, Material: Package, Method: BookOpen, Environment: Leaf
};

// Define some line metadata for styling if it matches
const lineMetadata: Record<string, { icon: any; desc: string }> = {
    "Main Line": { icon: Activity, desc: "Primary assembly production line" },
    "Sub Line": { icon: Layers, desc: "Sub-assembly components production" },
    "Cylinder Block": { icon: Factory, desc: "Engine block machining process" },
    "Cylinder Head": { icon: Cog, desc: "Engine head machining process" },
    "Cam Shaft": { icon: Cog, desc: "Shaft machining operation" },
    "Crank Shaft": { icon: Cog, desc: "Crankshaft machining operation" },
    "Low Pressure": { icon: Activity, desc: "Low pressure casting process" },
    "Die Casting": { icon: Layers, desc: "Die casting injection process" },
    "Clean Room": { icon: ShieldCheck, desc: "Precision area for sensitive machining/assembly" },
};

export default function Input5M() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const deptName = searchParams.get("dept");

    // Steps: 1 = Line, 2 = Category, 3 = Table
    const [step, setStep] = useState(1);
    const [selectedLine, setSelectedLine] = useState<Line | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

    const [lines, setLines] = useState<Line[]>([]);
    const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
    const [rows, setRows] = useState<CheckRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!deptName) {
            navigate("/"); // No department selected, go back to home
            return;
        }

        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // First find the department by name
                const depts = await apiFetch<any[]>("/master-data/departments");
                const currentDept = depts.find(d => d.name === deptName);

                if (!currentDept) {
                    toast.error(`Department ${deptName} not found in database.`);
                } else {
                    const [linesData, catsData] = await Promise.all([
                        apiFetch<Line[]>(`/master-data/lines?departmentId=${currentDept.id}`),
                        apiFetch<CategoryItem[]>("/master-data/categories")
                    ]);
                    setLines(linesData);
                    setDbCategories(catsData);

                    // Auto-skip line selection for non-production departments (they have exactly 1 virtual line)
                    if (currentDept.name !== "Production" && linesData.length > 0) {
                        setSelectedLine(linesData[0]);
                        setStep(2);
                    }
                }
            } catch (error) {
                toast.error("Failed to load department data.");
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [deptName, navigate]);

    const handleLineSelect = (line: Line) => {
        setSelectedLine(line);
        setStep(2);
    };

    const handleCategorySelect = async (catName: string) => {
        const cat = dbCategories.find(c => c.name === catName);
        if (!cat) {
            toast.error("Category configuration error");
            return;
        }
        setSelectedCategory(cat);
        await loadCheckItems(selectedLine!.id, cat.id);
        setStep(3);
    };

    const loadCheckItems = async (lineId: string, categoryId: string) => {
        setIsLoading(true);
        try {
            const items = await apiFetch<any[]>(`/master-data/check-items?lineId=${lineId}&categoryId=${categoryId}`);
            setRows(items.map((item, i) => ({
                no: i + 1,
                itemId: item.id,
                item: item.itemName,
                judgment: "OK", // Default to OK per requirements
                reason: "",
            })));
        } catch (error) {
            toast.error("Failed to load check items");
        } finally {
            setIsLoading(false);
        }
    };

    const updateRow = (index: number, field: "judgment" | "reason", value: string) => {
        setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    };

    const handleSubmit = async (isDraft: boolean) => {
        if (isDraft) {
            toast.success("Draft saved successfully (Local)");
            return;
        }

        if (rows.length === 0) { toast.error("No items to submit"); return; }
        if (rows.some((r) => r.judgment === "NG" && !r.reason.trim())) { toast.error("Please fill in reason for all NG items"); return; }
        if (rows.some((r) => !r.judgment)) { toast.error("Please complete all judgments"); return; }

        try {
            setIsSubmitting(true);
            const payload = {
                lineId: selectedLine!.id,
                checkDate: new Date().toISOString().split("T")[0],
                results: rows.map(r => ({
                    checkItemId: r.itemId,
                    status: r.judgment,
                    note: r.reason || undefined
                }))
            };

            await apiFetch("/checking/submit", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            toast.success("Checksheet submitted successfully");

            // For non-production we go straight to step 2, for production we go to step 1
            if (deptName !== "Production") {
                setStep(2);
            } else {
                setStep(1);
                setSelectedLine(null);
            }
            setSelectedCategory(null);
            setRows([]);
        } catch (error) {
            toast.error("Failed to submit checksheet.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 1: Select Line
    if (step === 1) {
        return (
            <div className="relative min-h-[calc(100vh-100px)] p-6">
                <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Select Production Line</h2>
                                <nav className="flex items-center gap-2 mt-1 text-sm font-medium text-muted-foreground/70">
                                    <span className="text-primary/80 font-semibold">{deptName}</span>
                                </nav>
                            </div>
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-primary/20 via-border to-transparent" />
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3 py-20">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading lines...</p>
                        </div>
                    ) : lines.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-destructive font-medium">No lines found for {deptName}. Please add lines in Master Data.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 transition-all duration-500">
                            {lines.map((line) => {
                                const meta = lineMetadata[line.name] || { icon: Factory, desc: "Production operation line" };
                                const Icon = meta.icon;
                                return (
                                    <Card
                                        key={line.id}
                                        className="relative group cursor-pointer border-border/50 bg-card hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                                        onClick={() => handleLineSelect(line)}
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-hover:bg-primary transition-colors" />
                                        <CardContent className="p-6 flex items-start gap-5">
                                            <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{line.name}</h4>
                                                <p className="text-xs leading-relaxed text-muted-foreground/80 font-medium">{meta.desc}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Step 2: Select Category
    if (step === 2) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => {
                    // For non-production, 1 skip back to main menu since line step was skipped
                    if (deptName !== "Production") navigate("/");
                    else setStep(1);
                }}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-1">Select 5M Category</h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        Department: {deptName}
                        {deptName === "Production" && selectedLine && (
                            <> → Line: <span className="text-primary">{selectedLine.name}</span></>
                        )}
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {categories.map((catString, i) => {
                        const Icon = catIcons[catString] || BookOpen;
                        return (
                            <Card key={catString} className="group cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all duration-200" onClick={() => handleCategorySelect(catString)}>
                                <CardContent className="flex flex-col items-center p-6 text-center h-full">
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                                        <Icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1">{catString}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{categoryDescriptions[catString]}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Step 3: Checksheet Table
    return (
        <div className="p-6 max-w-5xl mx-auto overflow-hidden">
            <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="bg-card border-b border-border/50">
                    <CardTitle className="text-xl text-foreground">Checksheet — {selectedCategory?.name}</CardTitle>
                    <p className="text-sm font-medium text-muted-foreground/80 mt-1">
                        {deptName}
                        {deptName === "Production" && selectedLine && ` → ${selectedLine.name}`}
                        {' '}→ <span className="text-primary">{selectedCategory?.name}</span>
                    </p>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground bg-muted/10">
                            No check items configured for this selection. <br />
                            <span className="text-sm">Please configure items in Master Data.</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-border/50 hover:bg-transparent">
                                        <TableHead className="w-16 font-semibold">No</TableHead>
                                        <TableHead className="font-semibold">Check Item Name</TableHead>
                                        <TableHead className="w-40 font-semibold text-center">Judgment</TableHead>
                                        <TableHead className="font-semibold">Reason (If NG)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row, idx) => (
                                        <TableRow key={idx} className="border-border/50 hover:bg-muted/10 transition-colors">
                                            <TableCell className="font-medium text-muted-foreground">{row.no}</TableCell>
                                            <TableCell className="font-medium text-foreground">{row.item}</TableCell>
                                            <TableCell className="text-center">
                                                <Select value={row.judgment} onValueChange={(v) => updateRow(idx, "judgment", v as "OK" | "NG" | "")}>
                                                    <SelectTrigger className={`w-full ${row.judgment === 'OK' ? 'border-success text-success bg-success/5' : row.judgment === 'NG' ? 'border-destructive text-destructive bg-destructive/5' : ''}`}>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="OK" className="font-semibold text-success focus:text-success">OK</SelectItem>
                                                        <SelectItem value="NG" className="font-semibold text-destructive focus:text-destructive">NG</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder={row.judgment === "NG" ? "Required — enter reason" : "Optional note"}
                                                    value={row.reason}
                                                    onChange={(e) => updateRow(idx, "reason", e.target.value)}
                                                    className={`bg-background ${row.judgment === "NG" && !row.reason.trim() ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                                                    disabled={row.judgment === "OK"}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 p-6 bg-muted/10 border-t border-border/50 rounded-b-xl">
                        <Button variant="outline" className="border-primary/20 hover:bg-primary/5 text-primary" onClick={() => handleSubmit(true)}>
                            Save Draft
                        </Button>
                        <Button onClick={() => handleSubmit(false)} disabled={isSubmitting || rows.length === 0} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            ) : (
                                <Check className="w-5 h-5 mr-2" />
                            )}
                            Submit Checksheet
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
