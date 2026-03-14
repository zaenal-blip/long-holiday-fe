import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { ChecksheetEntry } from "@/types/checksheet";

const Review = () => {
    const [searchParams] = useSearchParams();
    const [filterDepartment, setFilterDepartment] = useState(searchParams.get("departmentId") || "all");
    const [filterLine, setFilterLine] = useState(searchParams.get("lineId") || "all");
    const [filterCat, setFilterCat] = useState(searchParams.get("categoryId") || "all");
    const [filterJudgment, setFilterJudgment] = useState(searchParams.get("status") || "all");
    const [filterDayType, setFilterDayType] = useState(searchParams.get("dayType") || "all");

    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [lines, setLines] = useState<{ id: string; name: string; departmentId: string }[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    // Data
    const [entries, setEntries] = useState<ChecksheetEntry[]>([]);
    const [lineProgress, setLineProgress] = useState<any[]>([]); // For the NG chart
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [deptData, lineData, catData] = await Promise.all([
                    apiFetch<{ id: string; name: string }[]>("/master-data/departments"),
                    apiFetch<{ id: string; name: string; departmentId: string }[]>("/master-data/lines"),
                    apiFetch<{ id: string; name: string }[]>("/master-data/categories")
                ]);
                setDepartments(deptData);
                setLines(lineData);
                setCategories(catData);
            } catch (error) {
                console.error("Failed to load master data", error);
            }
        };
        loadMasterData();
    }, []);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (filterDepartment !== "all") params.set("departmentId", filterDepartment);
                if (filterLine !== "all") params.set("lineId", filterLine);
                if (filterJudgment !== "all") params.set("status", filterJudgment);
                if (filterDayType !== "all") params.set("dayType", filterDayType);

                // The backend API for getAllResults expects the category name, not ID.
                const catObj = categories.find(c => c.id === filterCat);
                if (filterCat !== "all" && catObj) {
                    params.set("category", catObj.name);
                }

                // Progress line API handles department filtering too now
                const [result, lineProgressData] = await Promise.all([
                    apiFetch<any[]>(`/checking/results?${params.toString()}`),
                    apiFetch<any[]>(`/checking/progress-line?${params.toString()}`)
                ]);

                const normalized = result.map((item) => ({
                    id: item.id,
                    user: item.user || "System",
                    department: item.department || "",
                    line: item.line || "-",
                    category: item.category,
                    item: item.item,
                    judgment: item.status as "OK" | "NG",
                    reason: item.note || "",
                    planCountermeasureDate: item.planCountermeasureDate,
                    date: item.checkDate ? new Date(item.checkDate).toISOString().split("T")[0] : "",
                })) as ChecksheetEntry[];

                setEntries(normalized);
                setLineProgress(lineProgressData);
            } catch (error) {
                console.error("fetch review data failed", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Only run when master data is loaded if filters exist
        if (categories.length > 0 || filterCat === "all") {
            load();
        }
    }, [filterDepartment, filterLine, filterCat, filterJudgment, filterDayType, categories]);

    // Data for the Bar Chart
    const ngChartData = useMemo(() => {
        return lineProgress
            .filter(lp => lp.ng > 0)
            .map(lp => ({
                id: lp.id,
                name: lp.department === "Production" ? lp.name : lp.department, // Use dept name for non-production 
                ng: lp.ng
            }))
            .sort((a, b) => b.ng - a.ng);
    }, [lineProgress]);

    const maxNg = Math.max(...ngChartData.map((d) => d.ng), 1);

    const getBarColor = (ng: number) => {
        const ratio = ng / maxNg;
        if (ratio > 0.7) return "hsl(0, 72%, 45%)";
        if (ratio > 0.4) return "hsl(0, 65%, 55%)";
        return "hsl(0, 55%, 68%)";
    };

    const handleBarClick = (data: { id: string }) => {
        const line = lines.find(l => l.id === data.id);
        if (line) {
            setFilterDepartment(line.departmentId);
            const dept = departments.find(d => d.id === line.departmentId);
            if (dept && dept.name === "Production") {
                setFilterLine(data.id);
            } else {
                setFilterLine("all");
            }
        }
    };

    const chartConfig = {
        ng: { label: "NG Count", color: "hsl(0, 72%, 50%)" },
    };

    const isProductionSelected = filterDepartment === "all" || departments.find(d => d.id === filterDepartment)?.name === "Production";

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Review Data</h2>

            <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-lg shadow-sm border border-border/50">
                <Select value={filterDepartment} onValueChange={(val) => {
                    setFilterDepartment(val);
                    setFilterLine("all");
                }}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="All Departments" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                {isProductionSelected && (
                    <Select value={filterLine} onValueChange={setFilterLine}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="All Lines" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Lines</SelectItem>
                            {lines.filter(l => filterDepartment === "all" || l.departmentId === filterDepartment).map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}

                <Select value={filterCat} onValueChange={setFilterCat}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={filterJudgment} onValueChange={setFilterJudgment}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="All Judgment" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Judgment</SelectItem>
                        <SelectItem value="OK">OK</SelectItem>
                        <SelectItem value="NG">NG</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterDayType} onValueChange={setFilterDayType}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="All Day Types" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Day Types</SelectItem>
                        <SelectItem value="DAY_16">Tanggal 16</SelectItem>
                        <SelectItem value="DAY_17">Tanggal 17</SelectItem>
                        <SelectItem value="DAY_18">Tanggal 18</SelectItem>
                        <SelectItem value="BEFORE_PRODUCTION">Before Production (29 Mar)</SelectItem>
                        <SelectItem value="FIRST_DAY_PRODUCTION">First Day Production (30 Mar)</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => {
                    setFilterDepartment("all");
                    setFilterLine("all");
                    setFilterCat("all");
                    setFilterJudgment("all");
                    setFilterDayType("all");
                }} className="ml-auto text-muted-foreground hover:text-foreground">
                    Reset Filters
                </Button>
            </div>

            {/* NG Summary Chart */}
            <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-2 bg-[#1E3A5F]/[0.02] border-b border-border/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        NG Issues by location
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {ngChartData.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground/60 font-medium">
                            No NG issues reported for the current filters.
                        </div>
                    ) : (
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ngChartData} margin={{ left: 10, right: 10, top: 10, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        angle={-30}
                                        textAnchor="end"
                                        interval={0}
                                        height={60}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8" }} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                                    />
                                    <Bar
                                        dataKey="ng"
                                        radius={[6, 6, 0, 0]}
                                        cursor="pointer"
                                        onClick={(_: unknown, index: number) => handleBarClick(ngChartData[index])}
                                        barSize={40}
                                    >
                                        {ngChartData.map((entry, index) => (
                                            <Cell key={index} fill={getBarColor(entry.ng)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
                <CardContent className="p-0">
                    <Table containerClassName="max-h-[600px] overflow-y-auto">
                        <TableHeader className="shadow-sm border-b">
                            <TableRow className="hover:bg-transparent border-0">
                                <TableHead className="w-[180px] text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 sticky top-0 z-10 bg-background border-b shadow-[0_1px_rgba(0,0,0,0.05)]">Department / Line</TableHead>
                                <TableHead className="w-[120px] text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center py-3 sticky top-0 z-10 bg-background border-b shadow-[0_1px_rgba(0,0,0,0.05)]">Category</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 sticky top-0 z-10 bg-background border-b shadow-[0_1px_rgba(0,0,0,0.05)]">Check Item Name</TableHead>
                                <TableHead className="w-[90px] text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center py-3 sticky top-0 z-10 bg-background border-b shadow-[0_1px_rgba(0,0,0,0.05)]">Judgment</TableHead>
                                <TableHead className="w-[220px] text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 sticky top-0 z-10 bg-background border-b shadow-[0_1px_rgba(0,0,0,0.05)]">Reason</TableHead>
                                <TableHead className="w-[160px] text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center py-3 sticky top-0 z-10 bg-background border-b shadow-[0_1px_rgba(0,0,0,0.05)]">Plan Countermeasure</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <span className="text-sm font-medium animate-pulse">Loading results...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : entries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-medium">
                                        No assessment results found for the current filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                entries.map((row) => (
                                    <TableRow key={row.id} className="h-12 hover:bg-muted/5 transition-colors border-border/40">
                                        <TableCell className="w-[180px] py-0">
                                            <div className="flex flex-col max-w-[170px]">
                                                <span className="text-sm font-medium truncate">{row.department === "Production" ? row.line : row.department}</span>
                                                <span className="text-[10px] text-muted-foreground truncate">{row.department === "Production" ? "Production" : "Dept Level"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[120px] text-center py-0">
                                            <Badge variant="outline" className="text-[10px] bg-background px-2 py-0 h-5">
                                                {row.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-0">
                                            <div className="text-sm text-foreground truncate max-w-[400px]" title={row.item}>
                                                {row.item}
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[90px] text-center py-0">
                                            <Badge className={`text-[10px] px-2 py-0 h-5 border-0 ${row.judgment === "OK" ? "bg-success hover:bg-success/90 text-success-foreground" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"}`}>
                                                {row.judgment}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="w-[220px] py-2 align-top">
                                            <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words" title={row.reason}>
                                                {row.reason || "—"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[160px] text-center py-0">
                                            <span className="text-sm text-muted-foreground">
                                                {row.planCountermeasureDate ? new Date(row.planCountermeasureDate).toISOString().split("T")[0] : "—"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Review;
