import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { categories, categoryDescriptions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { format, startOfToday } from "date-fns";
import { Activity, ArrowLeft, BookOpen, CalendarDays, Check, Cog, Factory, Layers, Leaf, Package, PlusCircle, Save, ShieldCheck, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

interface CategoryItem { id: string; name: string }
interface Line { id: string; name: string; departmentId: string }
interface CheckRow {
    no: number;
    itemId: string;
    item: string;
    checkDescription: string;
    totalMp: string;
    judgment: "OK" | "NG";
    ngReason: string;
    countermeasurePlanDate: string;
}

const catIcons: Record<string, any> = {
    Man: Users, Machine: Cog, Material: Package, Method: BookOpen, Environment: Leaf
};

const dayTypes = [
    { id: "DAY_16", label: "Day 16" },
    { id: "DAY_17", label: "Day 17" },
    { id: "DAY_18", label: "Day 18" },
    { id: "BEFORE_PRODUCTION", label: "Before Production" },
    { id: "FIRST_DAY_PRODUCTION", label: "First Day Production" },
];

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

    // Steps: 1 = Line, 2 = Day Type, 3 = Category, 4 = Table
    const [step, setStep] = useState(1);
    const [selectedLine, setSelectedLine] = useState<Line | null>(null);
    const [selectedDayType, setSelectedDayType] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

    const [lines, setLines] = useState<Line[]>([]);
    const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
    const [rows, setRows] = useState<CheckRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal state for adding new check item
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [newItemDescription, setNewItemDescription] = useState("");
    const [isAddingItem, setIsAddingItem] = useState(false);

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
                    if (!["Production", "Office", "PAD"].includes(currentDept.name) && linesData.length > 0) {
                        setSelectedLine(linesData[0]);
                        setStep(2); // Go to Day Type selection
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

    const handleDayTypeSelect = (dayType: string) => {
        setSelectedDayType(dayType);
        setStep(3);
    };

    const handleCategorySelect = async (catName: string) => {
        const cat = dbCategories.find(c => c.name === catName);
        if (!cat) {
            toast.error("Category configuration error");
            return;
        }
        setSelectedCategory(cat);
        await loadCheckItems(selectedLine!.id, cat.id);
        setStep(4);
    };

    const loadCheckItems = async (lineId: string, categoryId: string) => {
        setIsLoading(true);
        try {
            const items = await apiFetch<any[]>(`/master-data/check-items?lineId=${lineId}&categoryId=${categoryId}`);
            setRows(items.map((item, i) => ({
                no: i + 1,
                itemId: item.id,
                item: item.itemName,
                checkDescription: item.checkDescription || "-",
                totalMp: "",
                judgment: "OK", // Default to OK per requirements
                ngReason: "",
                countermeasurePlanDate: "",
            })));
        } catch (error) {
            toast.error("Failed to load check items");
        } finally {
            setIsLoading(false);
        }
    };

    const updateRow = (index: number, field: keyof CheckRow, value: any) => {
        setRows((prev) => prev.map((r, i) => {
            if (i !== index) return r;
            const updated = { ...r, [field]: value };

            // If switching to NG and date is empty, set default to today
            if (field === "judgment" && value === "NG" && !updated.countermeasurePlanDate) {
                updated.countermeasurePlanDate = format(new Date(), "yyyy-MM-dd");
            }
            return updated;
        }));
    };

    const handleAddItem = async () => {
        if (!newItemName.trim()) {
            toast.error("Item Name cannot be empty.");
            return;
        }

        if (!selectedLine || !selectedCategory) return;

        setIsAddingItem(true);
        try {
            const newItem = await apiFetch<any>("/master-data/check-items", {
                method: "POST",
                body: JSON.stringify({
                    lineId: selectedLine.id,
                    categoryId: selectedCategory.id,
                    itemName: newItemName,
                    checkDescription: newItemDescription
                })
            });

            const newRow: CheckRow = {
                no: rows.length + 1,
                itemId: newItem.id,
                item: newItem.itemName,
                checkDescription: newItem.checkDescription || "-",
                totalMp: "",
                judgment: "OK",
                ngReason: "",
                countermeasurePlanDate: "",
            };

            setRows(prev => [...prev, newRow]);
            toast.success("New check item added successfully.");
            setIsAddModalOpen(false);
            setNewItemName("");
            setNewItemDescription("");
        } catch (error) {
            toast.error("Failed to add new check item.");
        } finally {
            setIsAddingItem(false);
        }
    };

    const handleSubmit = async (isDraft: boolean) => {
        if (isDraft) {
            toast.success("Draft saved successfully (Local)");
            return;
        }

        if (rows.length === 0) { toast.error("No items to submit"); return; }
        if (rows.some((r) => r.judgment === "NG" && (!r.ngReason.trim() || !r.countermeasurePlanDate))) {
            toast.error("Please fill in NG Reason and Countermeasure Plan Date for all NG items");
            return;
        }

        const isManCategory = selectedCategory?.name === "Man";
        if (isManCategory && rows.some((r) => !r.totalMp.trim() || isNaN(Number(r.totalMp)))) {
            toast.error("Please fill in the Total MP for all items in the Man category.");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                lineId: selectedLine!.id,
                dayType: selectedDayType,
                checkDate: new Date().toISOString().split("T")[0],
                results: rows.map(r => ({
                    checkItemId: r.itemId,
                    status: r.judgment,
                    totalMp: isManCategory ? Number(r.totalMp) : undefined,
                    ngReason: r.judgment === "NG" ? r.ngReason : undefined,
                    countermeasurePlanDate: r.judgment === "NG" ? r.countermeasurePlanDate : undefined,
                }))
            };

            await apiFetch("/checking/submit", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            toast.success("Checksheet submitted successfully");

            // Go back to Step 2 (Day Type) or Step 1 (Line)
            setSelectedCategory(null);
            setSelectedDayType(null);
            setRows([]);

            if (!["Production", "Office", "PAD"].includes(deptName!)) {
                setStep(2);
            } else {
                setStep(1);
                setSelectedLine(null);
            }
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

    // Step 2: Select Day Type
    if (step === 2) {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => {
                        if (!["Production", "Office", "PAD"].includes(deptName!)) navigate("/"); // non-prod skipped step 1
                        else setStep(1);
                    }} className="rounded-full hover:bg-primary/10 text-muted-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Select Inspection Day Type</h2>
                        <nav className="flex items-center gap-2 mt-1 text-sm font-medium text-muted-foreground/70">
                            <span className="text-primary/80 font-semibold">{deptName}</span>
                            {["Production", "Office", "PAD"].includes(deptName!) && selectedLine && (
                                <>
                                    <span className="text-muted-foreground/40 font-light">/</span>
                                    <span className="text-primary/80 font-semibold">{selectedLine.name}</span>
                                </>
                            )}
                        </nav>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 transition-all duration-500">
                    {dayTypes.map((dt) => (
                        <Card
                            key={dt.id}
                            className={`relative group cursor-pointer border-border/50 bg-card hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden ${selectedDayType === dt.id ? "ring-2 ring-primary border-primary" : ""
                                }`}
                            onClick={() => handleDayTypeSelect(dt.id)}
                        >
                            <CardContent className="p-6 flex items-center gap-5">
                                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 ${selectedDayType === dt.id ? "bg-primary text-primary-foreground" : "bg-primary/5 text-primary"}`}>
                                    <CalendarDays className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-lg text-foreground">{dt.label}</h4>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Step 3: Select Category
    if (step === 3) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-1">Select 5M Category</h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        Department: {deptName}
                        {["Production", "Office", "PAD"].includes(deptName!) && selectedLine && (
                            <> → Line: <span className="text-primary">{selectedLine.name}</span></>
                        )}
                        {selectedDayType && (
                            <> → Day Type: <span className="text-primary">{dayTypes.find(d => d.id === selectedDayType)?.label}</span></>
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

    // Step 4: Checksheet Table
    return (
        <div className="p-6 max-w-5xl mx-auto overflow-hidden">
            <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => setStep(3)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Checksheet — {selectedCategory?.name}</h2>
                    <p className="text-sm font-medium text-muted-foreground/80 mt-1">
                        {deptName}
                        {["Production", "Office", "PAD"].includes(deptName!) && selectedLine && ` → ${selectedLine.name}`}
                        {' '}→ <span className="text-primary">{dayTypes.find(d => d.id === selectedDayType)?.label}</span>
                        {' '}→ <span className="text-primary">{selectedCategory?.name}</span>
                    </p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add Check Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Check Item</DialogTitle>
                            <DialogDescription>
                                Create a new checklist item for {selectedLine?.name} / {selectedCategory?.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Item Name
                                </label>
                                <Input
                                    id="name"
                                    placeholder="Enter item name..."
                                    value={newItemName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="desc" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    What To Check
                                </label>
                                <Textarea
                                    id="desc"
                                    placeholder="Describe what needs to be checked..."
                                    value={newItemDescription}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewItemDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddItem} disabled={isAddingItem || !newItemName.trim()}>
                                {isAddingItem && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />}
                                <Save className="w-4 h-4 mr-2" />
                                Save Item
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground bg-muted/10">
                            No check items configured for this selection. <br />
                            <span className="text-sm">Click "+ Add Check Item" to create one.</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table containerClassName="max-h-[600px] overflow-y-auto">
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-16 h-11 sticky top-0 z-[11] bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.1)] text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap text-center">No</TableHead>
                                        <TableHead className="h-11 sticky top-0 z-[11] bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.1)] text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">Check Item</TableHead>
                                        <TableHead className="h-11 sticky top-0 z-[11] bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.1)] text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">What To Check</TableHead>
                                        {selectedCategory?.name === "Man" && (
                                            <TableHead className="w-24 h-11 sticky top-0 z-[11] bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.1)] text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap text-center">Total MP</TableHead>
                                        )}
                                        <TableHead className="w-32 h-11 sticky top-0 z-[11] bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.1)] text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap text-center">Judgment</TableHead>
                                        <TableHead className="h-11 sticky top-0 z-[11] bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.1)] text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">NG Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row, idx) => (
                                        <React.Fragment key={idx}>
                                            <TableRow className={`h-14 transition-colors ${row.judgment === 'NG' ? 'bg-destructive/[0.03] border-b-0' : 'border-border/50 hover:bg-muted/5'}`}>
                                                <TableCell className="text-center font-medium text-muted-foreground">{row.no}</TableCell>
                                                <TableCell className="font-medium text-foreground min-w-[150px]">{row.item}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground min-w-[200px]">{row.checkDescription}</TableCell>
                                                {selectedCategory?.name === "Man" && (
                                                    <TableCell className="text-center">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            value={row.totalMp}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRow(idx, "totalMp", e.target.value)}
                                                            className="w-20 mx-auto text-center font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                    </TableCell>
                                                )}
                                                <TableCell className="text-center">
                                                    <Select value={row.judgment} onValueChange={(v) => updateRow(idx, "judgment", v as "OK" | "NG")}>
                                                        <SelectTrigger className={`w-full ${row.judgment === 'OK' ? 'border-success text-success bg-success/5' : 'border-destructive text-destructive bg-destructive/5'}`}>
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="OK" className="font-semibold text-success focus:text-success">OK</SelectItem>
                                                            <SelectItem value="NG" className="font-semibold text-destructive focus:text-destructive">NG</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    {row.judgment === "NG" ? (
                                                        <span className="text-xs font-semibold text-destructive animate-pulse">Documentation Required ↓</span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground/50">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            {row.judgment === "NG" && (
                                                <TableRow className="border-border/50 bg-destructive/5 shadow-inner">
                                                    <TableCell colSpan={selectedCategory?.name === "Man" ? 6 : 5} className="p-0 pb-6 border-0">
                                                        <div className="ml-[4.5rem] mr-6 p-5 bg-background border border-destructive/20 rounded-lg shadow-sm relative overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300">
                                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-destructive/60" />
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2">
                                                                <div className="space-y-2">
                                                                    <label className="text-[11px] font-bold uppercase tracking-wider text-destructive/80 flex items-center gap-2">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-destructive/60"></span>
                                                                        NG Reason
                                                                    </label>
                                                                    <textarea
                                                                        placeholder="Describe the issue in detail..."
                                                                        value={row.ngReason}
                                                                        onChange={(e) => updateRow(idx, "ngReason", e.target.value)}
                                                                        className="flex min-h-[100px] w-full rounded-md border border-destructive/30 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[11px] font-bold uppercase tracking-wider text-destructive/80 flex items-center gap-2">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-destructive/60"></span>
                                                                        Countermeasure Plan Date
                                                                    </label>
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <Button
                                                                                variant={"outline"}
                                                                                className={cn(
                                                                                    "w-full justify-start text-left font-normal bg-background/50 border-destructive/30 focus:ring-destructive/40 h-10",
                                                                                    !row.countermeasurePlanDate && "text-muted-foreground"
                                                                                )}
                                                                            >
                                                                                <CalendarDays className="mr-2 h-4 w-4" />
                                                                                {row.countermeasurePlanDate ? format(new Date(row.countermeasurePlanDate), "yyyy-MM-dd") : <span>Pick a date</span>}
                                                                            </Button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-auto p-0" align="start">
                                                                            <Calendar
                                                                                mode="single"
                                                                                selected={row.countermeasurePlanDate ? new Date(row.countermeasurePlanDate) : undefined}
                                                                                onSelect={(date) => updateRow(idx, "countermeasurePlanDate", date ? format(date, "yyyy-MM-dd") : "")}
                                                                                disabled={(date) => date < startOfToday()}
                                                                                initialFocus
                                                                            />
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
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
