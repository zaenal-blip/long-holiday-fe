import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Check, X, Building2, LayoutGrid, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type Department = { id: string; name: string };
type Line = { id: string; name: string; departmentId: string; department?: Department };
type Category = { id: string; name: string };
type CheckItem = { id: string; itemName: string; checkDescription: string; lineId: string; categoryId: string };

export default function MasterData() {
    const [activeTab, setActiveTab] = useState("departments");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [lines, setLines] = useState<Line[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [checkItems, setCheckItems] = useState<CheckItem[]>([]);

    // Selection states for Check Items tab
    const [selectedLineId, setSelectedLineId] = useState<string>("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

    // Addition & Editing states
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [newDepartmentId, setNewDepartmentId] = useState(""); // For adding Line

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingDescription, setEditingDescription] = useState("");
    const [newDescription, setNewDescription] = useState("");

    const loadBaseData = async () => {
        try {
            const [deps, lns, cats] = await Promise.all([
                apiFetch<Department[]>("/master-data/departments"),
                apiFetch<Line[]>("/master-data/lines"),
                apiFetch<Category[]>("/master-data/categories")
            ]);
            setDepartments(deps);
            setLines(lns);
            setCategories(cats);
        } catch (error) {
            toast.error("Failed to load master data");
        }
    };

    const loadCheckItems = async () => {
        if (!selectedLineId || !selectedCategoryId) {
            setCheckItems([]);
            return;
        }
        try {
            const data = await apiFetch<CheckItem[]>(`/master-data/check-items?lineId=${selectedLineId}&categoryId=${selectedCategoryId}`);
            setCheckItems(data);
        } catch (error) {
            toast.error("Failed to load check items");
        }
    };

    useEffect(() => {
        loadBaseData();
    }, []);

    useEffect(() => {
        if (activeTab === "check-items") {
            loadCheckItems();
        }
    }, [activeTab, selectedLineId, selectedCategoryId]);

    // Reset states when tab changes
    useEffect(() => {
        setIsAdding(false);
        setEditingId(null);
        setNewItemName("");
        setNewDescription("");
        setNewDepartmentId("");
    }, [activeTab]);

    // Error handling helper
    const handleError = async (response: Response) => {
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.message || "Operation failed");
        } catch (e: any) {
            toast.error(e.message || "Failed to process request");
            throw e;
        }
    };

    // --- DEPARTMENTS ---
    const handleCreateDept = async () => {
        if (!newItemName.trim()) return;
        try {
            await apiFetch("/master-data/departments", { method: "POST", body: JSON.stringify({ name: newItemName.trim() }) });
            toast.success("Department created");
            setNewItemName("");
            setIsAdding(false);
            loadBaseData();
        } catch (e: any) { toast.error(e.message || "Failed to create department"); }
    };
    const handleUpdateDept = async (id: string) => {
        if (!editingName.trim()) return;
        try {
            await apiFetch(`/master-data/departments/${id}`, { method: "PATCH", body: JSON.stringify({ name: editingName.trim() }) });
            toast.success("Department updated");
            setEditingId(null);
            loadBaseData();
        } catch (e: any) { toast.error(e.message || "Failed to update department"); }
    };
    const handleDeleteDept = async (id: string) => {
        if (!confirm("Are you sure you want to delete this department?")) return;
        try {
            await apiFetch(`/master-data/departments/${id}`, { method: "DELETE" });
            toast.success("Department deleted");
            loadBaseData();
        } catch (e: any) { toast.error(e.message || "Failed to delete department. It might be in use."); }
    };

    // --- LINES ---
    const handleCreateLine = async () => {
        if (!newItemName.trim() || !newDepartmentId) {
            toast.error("Please provide line name and select a department");
            return;
        }
        try {
            await apiFetch("/master-data/lines", { method: "POST", body: JSON.stringify({ name: newItemName.trim(), departmentId: newDepartmentId }) });
            toast.success("Line created");
            setNewItemName("");
            setNewDepartmentId("");
            setIsAdding(false);
            loadBaseData();
        } catch (e: any) { toast.error(e.message || "Failed to create line"); }
    };
    const handleUpdateLine = async (id: string) => {
        if (!editingName.trim()) return;
        try {
            await apiFetch(`/master-data/lines/${id}`, { method: "PATCH", body: JSON.stringify({ name: editingName.trim() }) });
            toast.success("Line updated");
            setEditingId(null);
            loadBaseData();
        } catch (e: any) { toast.error(e.message || "Failed to update line"); }
    };
    const handleDeleteLine = async (id: string) => {
        if (!confirm("Are you sure you want to delete this line?")) return;
        try {
            await apiFetch(`/master-data/lines/${id}`, { method: "DELETE" });
            toast.success("Line deleted");
            loadBaseData();
        } catch (e: any) { toast.error(e.message || "Failed to delete line. It might be in use."); }
    };

    // --- CHECK ITEMS ---
    const handleCreateCheckItem = async () => {
        if (!newItemName.trim() || !newDescription.trim() || !selectedLineId || !selectedCategoryId) {
            toast.error("Please provide both name and description");
            return;
        }
        try {
            await apiFetch("/master-data/check-items", {
                method: "POST",
                body: JSON.stringify({
                    itemName: newItemName.trim(),
                    checkDescription: newDescription.trim(),
                    lineId: selectedLineId,
                    categoryId: selectedCategoryId
                })
            });
            toast.success("Check item created");
            setNewItemName("");
            setNewDescription("");
            setIsAdding(false);
            loadCheckItems();
        } catch (e: any) { toast.error(e.message || "Failed to create check item"); }
    };
    const handleUpdateCheckItem = async (id: string) => {
        if (!editingName.trim() || !editingDescription.trim()) return;
        try {
            await apiFetch(`/master-data/check-items/${id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    itemName: editingName.trim(),
                    checkDescription: editingDescription.trim()
                })
            });
            toast.success("Check item updated");
            setEditingId(null);
            loadCheckItems();
        } catch (e: any) { toast.error(e.message || "Failed to update check item"); }
    };
    const handleDeleteCheckItem = async (id: string) => {
        if (!confirm("Are you sure you want to delete this check item?")) return;
        try {
            await apiFetch(`/master-data/check-items/${id}`, { method: "DELETE" });
            toast.success("Check item deleted");
            loadCheckItems();
        } catch (e: any) { toast.error(e.message || "Failed to delete check item"); }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Master Data</h1>
                    <p className="text-neutral-400">Manage Departments, Lines, and filtered Check Items.</p>
                </div>
            </div>

            <Tabs defaultValue="departments" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl h-auto flex flex-wrap gap-2">
                    <TabsTrigger value="departments" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#4F8CFF] data-[state=active]:text-white transition-all gap-2">
                        <Building2 className="w-4 h-4" /> Departments
                    </TabsTrigger>
                    <TabsTrigger value="lines" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#4F8CFF] data-[state=active]:text-white transition-all gap-2">
                        <LayoutGrid className="w-4 h-4" /> Lines
                    </TabsTrigger>
                    <TabsTrigger value="check-items" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#4F8CFF] data-[state=active]:text-white transition-all gap-2">
                        <ClipboardList className="w-4 h-4" /> Check Items
                    </TabsTrigger>
                </TabsList>

                {/* DEPARTMENTS TAB */}
                <TabsContent value="departments" className="mt-6">
                    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-xl text-white">Departments</CardTitle>
                                <CardDescription className="text-neutral-400">Manage master departments</CardDescription>
                            </div>
                            {!isAdding && (
                                <Button onClick={() => setIsAdding(true)} className="bg-[#4F8CFF] hover:bg-[#3b6dcc] text-white gap-2">
                                    <Plus className="w-4 h-4" /> Add Department
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-neutral-400">Name</TableHead>
                                        <TableHead className="text-right text-neutral-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isAdding && (
                                        <TableRow className="border-white/10 bg-white/5">
                                            <TableCell>
                                                <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Department name" className="bg-black/60 border-white/20 text-white" autoFocus />
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" onClick={handleCreateDept} className="text-[#4F8CFF]"><Check className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="text-red-400"><X className="w-4 h-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {departments.map((dept) => (
                                        <TableRow key={dept.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="text-white">
                                                {editingId === dept.id ? (
                                                    <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="bg-black/60 border-white/20 text-white" autoFocus />
                                                ) : dept.name}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {editingId === dept.id ? (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => handleUpdateDept(dept.id)} className="text-[#4F8CFF]"><Check className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="text-red-400"><X className="w-4 h-4" /></Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => { setEditingId(dept.id); setEditingName(dept.name); }} className="text-neutral-400 hover:text-white"><Edit2 className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDept(dept.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* LINES TAB */}
                <TabsContent value="lines" className="mt-6">
                    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-xl text-white">Lines</CardTitle>
                                <CardDescription className="text-neutral-400">Manage production lines per department</CardDescription>
                            </div>
                            {!isAdding && (
                                <Button onClick={() => setIsAdding(true)} className="bg-[#4F8CFF] hover:bg-[#3b6dcc] text-white gap-2">
                                    <Plus className="w-4 h-4" /> Add Line
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-neutral-400">Line Name</TableHead>
                                        <TableHead className="text-neutral-400">Department</TableHead>
                                        <TableHead className="text-right text-neutral-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isAdding && (
                                        <TableRow className="border-white/10 bg-white/5">
                                            <TableCell>
                                                <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Line name" className="bg-black/60 border-white/20 text-white" autoFocus />
                                            </TableCell>
                                            <TableCell>
                                                <Select value={newDepartmentId} onValueChange={setNewDepartmentId}>
                                                    <SelectTrigger className="bg-black/60 border-white/20 text-white">
                                                        <SelectValue placeholder="Select Department" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" onClick={handleCreateLine} className="text-[#4F8CFF]"><Check className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="text-red-400"><X className="w-4 h-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {lines.map((line) => (
                                        <TableRow key={line.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="text-white">
                                                {editingId === line.id ? (
                                                    <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="bg-black/60 border-white/20 text-white" autoFocus />
                                                ) : line.name}
                                            </TableCell>
                                            <TableCell className="text-neutral-300">
                                                {line.department?.name || "Unknown"}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {editingId === line.id ? (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => handleUpdateLine(line.id)} className="text-[#4F8CFF]"><Check className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="text-red-400"><X className="w-4 h-4" /></Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => { setEditingId(line.id); setEditingName(line.name); }} className="text-neutral-400 hover:text-white"><Edit2 className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteLine(line.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CHECK ITEMS TAB */}
                <TabsContent value="check-items" className="mt-6">
                    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                        <CardHeader className="flex flex-col space-y-4">
                            <div>
                                <CardTitle className="text-xl text-white">Check Items</CardTitle>
                                <CardDescription className="text-neutral-400">Manage check items for a specific line and category</CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 items-center bg-black/50 p-4 rounded-lg border border-white/10">
                                <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                                    <SelectTrigger className="bg-black/60 border-white/20 text-white w-full sm:w-[250px]">
                                        <SelectValue placeholder="Select Line..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lines.map(line => <SelectItem key={line.id} value={line.id}>{line.name} ({line.department?.name})</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                    <SelectTrigger className="bg-black/60 border-white/20 text-white w-full sm:w-[250px]" disabled={!selectedLineId}>
                                        <SelectValue placeholder="Select Category..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                {selectedLineId && selectedCategoryId && !isAdding && (
                                    <Button onClick={() => setIsAdding(true)} className="bg-[#4F8CFF] hover:bg-[#3b6dcc] text-white ml-auto">
                                        <Plus className="w-4 h-4 mr-2" /> Add Item
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!selectedLineId || !selectedCategoryId ? (
                                <div className="text-center py-12 text-neutral-500 italic border border-dashed border-white/10 rounded-lg">
                                    Please select a Line and Category to manage check items.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead className="text-neutral-400 w-12">No</TableHead>
                                            <TableHead className="text-neutral-400">Check Item Name</TableHead>
                                            <TableHead className="text-neutral-400">What To Check</TableHead>
                                            <TableHead className="text-right text-neutral-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isAdding && (
                                            <TableRow className="border-white/10 bg-white/5">
                                                <TableCell>-</TableCell>
                                                <TableCell>
                                                    <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item Name (e.g. Machine A)" className="bg-black/60 border-white/20 text-white" />
                                                </TableCell>
                                                <TableCell>
                                                    <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Description (e.g. Check for leakage)" className="bg-black/60 border-white/20 text-white" />
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={handleCreateCheckItem} className="text-[#4F8CFF]"><Check className="w-4 h-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="text-red-400"><X className="w-4 h-4" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {checkItems.length === 0 && !isAdding ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-neutral-500 italic">No check items found for this selection.</TableCell>
                                            </TableRow>
                                        ) : (
                                            checkItems.map((item, idx) => (
                                                <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                                                    <TableCell className="text-neutral-400">{idx + 1}</TableCell>
                                                    <TableCell className="text-white">
                                                        {editingId === item.id ? (
                                                            <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="bg-black/60 border-white/20 text-white" />
                                                        ) : item.itemName}
                                                    </TableCell>
                                                    <TableCell className="text-white">
                                                        {editingId === item.id ? (
                                                            <Input value={editingDescription} onChange={(e) => setEditingDescription(e.target.value)} className="bg-black/60 border-white/20 text-white" />
                                                        ) : item.checkDescription}
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        {editingId === item.id ? (
                                                            <>
                                                                <Button variant="ghost" size="icon" onClick={() => handleUpdateCheckItem(item.id)} className="text-[#4F8CFF]"><Check className="w-4 h-4" /></Button>
                                                                <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="text-red-400"><X className="w-4 h-4" /></Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button variant="ghost" size="icon" onClick={() => {
                                                                    setEditingId(item.id);
                                                                    setEditingName(item.itemName);
                                                                    setEditingDescription(item.checkDescription);
                                                                }} className="text-neutral-400 hover:text-white"><Edit2 className="w-4 h-4" /></Button>
                                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCheckItem(item.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                                            </>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
