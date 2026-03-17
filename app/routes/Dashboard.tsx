import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle2, XCircle, Activity, LayoutGrid } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiFetch } from "@/lib/api";

type CategoryProgress = { id: string; name: string; total: number; ok: number; ng: number };
type LineProgress = { id: string; name: string; department: string; total: number; ok: number; ng: number };
type Summary = { okCount: number; ngCount: number };

// Stages are fetched from DB
const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Filters
    const [filterDepartment, setFilterDepartment] = useState("all");
    const [filterLine, setFilterLine] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterDayType, setFilterDayType] = useState("all");

    // Master Data
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [lines, setLines] = useState<{ id: string; name: string; departmentId: string }[]>([]);
    const [dbStages, setDbStages] = useState<{ id: string; name: string; label: string }[]>([]);

    // Aggregation Data
    const [summary, setSummary] = useState<Summary>({ okCount: 0, ngCount: 0 });
    const [progressCategory, setProgressCategory] = useState<CategoryProgress[]>([]);
    const [progressLine, setProgressLine] = useState<LineProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [deptData, lineData, stageData] = await Promise.all([
                    apiFetch<{ id: string; name: string }[]>("/master-data/departments"),
                    apiFetch<{ id: string; name: string; departmentId: string }[]>("/master-data/lines"),
                    apiFetch<{ id: string; name: string; label: string }[]>("/master-data/stages")
                ]);
                setDepartments(deptData);
                setLines(lineData);
                setDbStages(stageData);
            } catch (error) {
                console.error("Failed to load master data", error);
            }
        };
        loadMasterData();
    }, []);

    const fetchDashboard = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterDepartment !== "all") params.set("departmentId", filterDepartment);
            if (filterLine !== "all") params.set("lineId", filterLine);
            if (filterCategory !== "all") params.set("categoryId", filterCategory);
            if (filterDayType !== "all") params.set("stageId", filterDayType);

            const [summaryData, catData, lineData] = await Promise.all([
                apiFetch<Summary>(`/checking/summary?${params.toString()}`),
                apiFetch<CategoryProgress[]>(`/checking/progress-category?${params.toString()}`),
                apiFetch<LineProgress[]>(`/checking/progress-line?${params.toString()}`),
            ]);

            setSummary(summaryData);
            setProgressCategory(catData);
            setProgressLine(lineData);
        } catch (error) {
            console.error("Dashboard fetch failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (departments.length > 0) {
            fetchDashboard();
        }
    }, [filterDepartment, filterLine, filterCategory, filterDayType, departments]);

    const ngByCategory = useMemo(() => {
        return progressCategory.map((cat) => ({
            category: cat.name,
            count: cat.ng,
        }));
    }, [progressCategory]);

    // Check if the current selected department is Production (or "all")
    const isProductionSelected = filterDepartment === "all" || departments.find(d => d.id === filterDepartment)?.name === "Production";

    return (
        <div className="min-h-screen bg-background p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-[#1E3A5F]">Manufacturing Dashboard</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">Real-time production quality & 5M monitoring</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={filterDepartment} onValueChange={(val) => {
                            setFilterDepartment(val);
                            setFilterLine("all"); // Reset line when dept changes
                        }}>
                            <SelectTrigger className="w-44 bg-white border-[#E5E7EB] shadow-sm"><SelectValue placeholder="All Departments" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        {isProductionSelected && (
                            <Select value={filterLine} onValueChange={setFilterLine}>
                                <SelectTrigger className="w-44 bg-white border-[#E5E7EB] shadow-sm"><SelectValue placeholder="All Lines" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Lines</SelectItem>
                                    {lines.filter(l => filterDepartment === "all" || l.departmentId === filterDepartment).map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}

                        <Select value={filterDayType} onValueChange={setFilterDayType}>
                            <SelectTrigger className="w-44 bg-white border-[#E5E7EB] shadow-sm"><SelectValue placeholder="All Day Types" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Day Types</SelectItem>
                                {dbStages.map((dt) => <SelectItem key={dt.id} value={dt.id}>{dt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-44 bg-white border-[#E5E7EB] shadow-sm"><SelectValue placeholder="All Categories" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {progressCategory.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300">
                        <CardContent className="relative flex items-center gap-6 p-8">
                            <div className="w-16 h-16 rounded-2xl bg-[#22C55E]/10 flex items-center justify-center border border-[#22C55E]/10">
                                <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#22C55E] uppercase tracking-wider mb-1">Total OK Checks</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-5xl font-black text-[#1E3A5F]">{summary.okCount}</p>
                                    <span className="text-xs font-semibold text-slate-400">Items passed</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                        onClick={() => {
                            const params = new URLSearchParams();
                            params.set("status", "NG");
                            if (filterDepartment !== "all") params.set("departmentId", filterDepartment);
                            if (filterLine !== "all") params.set("lineId", filterLine);
                            if (filterDayType !== "all") params.set("stageId", filterDayType);
                            navigate(`/review?${params.toString()}`);
                        }}
                    >
                        <CardContent className="relative flex items-center gap-6 p-8">
                            <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center border border-[#EF4444]/10 group-hover:scale-105 transition-transform duration-500">
                                <XCircle className="w-8 h-8 text-[#EF4444]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#EF4444] uppercase tracking-wider mb-1">Total NG Issues</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-5xl font-black text-[#1E3A5F]">{summary.ngCount}</p>
                                    <span className="text-xs font-semibold text-slate-400">Items pending fix</span>
                                </div>
                            </div>
                            <div className="ml-auto flex items-center gap-2 text-xs font-bold text-[#EF4444] bg-[#EF4444]/5 px-3 py-1 rounded-full group-hover:bg-[#EF4444]/10 transition-colors">
                                View Details <span>→</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Progress by Category */}
                    <Card className="border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300 bg-white">
                        <CardHeader className="border-b border-[#E5E7EB]/50 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold text-[#1E3A5F]">Progress by Category</CardTitle>
                                {filterCategory !== "all" && (
                                    <Badge
                                        variant="outline"
                                        className="cursor-pointer border-[#1E3A5F]/20 text-[#1E3A5F] hover:bg-[#1E3A5F]/5"
                                        onClick={() => setFilterCategory("all")}
                                    >
                                        Clear: {progressCategory.find(c => c.id === filterCategory)?.name || filterCategory} ✕
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {progressCategory.map((cat) => {
                                const isActive = filterCategory === cat.id;
                                const okPct = cat.total > 0 ? (cat.ok / cat.total) * 100 : 0;
                                const ngPct = cat.total > 0 ? (cat.ng / cat.total) * 100 : 0;
                                return (
                                    <div
                                        key={cat.id}
                                        className={`p-4 rounded-xl transition-all duration-300 cursor-pointer ${isActive
                                            ? "bg-[#1E3A5F]/5 border border-[#1E3A5F]/20 shadow-inner"
                                            : "hover:bg-slate-50 border border-transparent"
                                            }`}
                                        onClick={() => setFilterCategory(isActive ? "all" : cat.id)}
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <span className={`text-sm font-bold ${isActive ? "text-[#1E3A5F]" : "text-slate-700"}`}>{cat.name}</span>
                                            <div className="flex gap-4">
                                                <span className="text-[10px] uppercase tracking-tighter font-bold text-[#22C55E]">{cat.ok} OK</span>
                                                <span className="text-[10px] uppercase tracking-tighter font-bold text-[#EF4444]">{cat.ng} NG</span>
                                            </div>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                                            {okPct > 0 && <div className="h-full bg-[#22C55E] transition-all duration-1000" style={{ width: `${okPct}%` }} />}
                                            {ngPct > 0 && <div className="h-full bg-[#EF4444] transition-all duration-1000" style={{ width: `${ngPct}%` }} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Progress by Line */}
                    <Card className="border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300 bg-white">
                        <CardHeader className="border-b border-[#E5E7EB]/50 pb-4">
                            <CardTitle className="text-lg font-bold text-[#1E3A5F]">{isProductionSelected ? 'Line' : 'Department'} Performance Matrix</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-1 max-h-[440px] overflow-y-auto custom-scrollbar">
                            {progressLine.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <LayoutGrid className="w-12 h-12 opacity-20 mb-2" />
                                    <p className="text-sm font-medium">Monitoring data unavailable</p>
                                </div>
                            )}
                            {progressLine.map((line) => {
                                const okng = line.ok + line.ng;
                                const completionPct = okng > 0 ? Math.round((line.ok / okng) * 100) : 0;
                                const okPct = line.total > 0 ? (line.ok / line.total) * 100 : 0;
                                const ngPct = line.total > 0 ? (line.ng / line.total) * 100 : 0;

                                const reviewParams = new URLSearchParams();
                                reviewParams.set("lineId", line.id);
                                if (filterCategory !== "all") reviewParams.set("categoryId", filterCategory);
                                if (filterDayType !== "all") reviewParams.set("stageId", filterDayType);

                                // Show either Line Name (for Production) or Department Name (for others)
                                const displayName = line.department === "Production" ? line.name : line.department;
                                const displayMeta = line.department === "Production" ? line.department : "Department Virtual Line";

                                return (
                                    <div
                                        key={line.id}
                                        className="p-3 rounded-lg border border-transparent hover:bg-[#1E3A5F]/5 hover:border-[#1E3A5F]/10 cursor-pointer transition-all duration-200 group"
                                        onClick={() => navigate(`/review?${reviewParams.toString()}`)}
                                    >
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <div className="flex flex-col">
                                                <span className="text-slate-700 font-bold group-hover:text-[#1E3A5F] transition-colors">{displayName}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{displayMeta}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-[#1E3A5F] bg-[#1E3A5F]/5 px-2 py-0.5 rounded">{completionPct}% EFF</span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                                            {okPct > 0 && <div className="h-full bg-[#22C55E]" style={{ width: `${okPct}%` }} />}
                                            {ngPct > 0 && <div className="h-full bg-[#EF4444]" style={{ width: `${ngPct}%` }} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* NG Monitoring */}
                <Card className="border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
                    <CardHeader className="bg-[#1E3A5F]/[0.02] border-b border-[#E5E7EB]/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-[#1E3A5F]">NG Monitoring by Category</CardTitle>
                                <p className="text-xs text-slate-400 mt-0.5 font-medium italic">Identification of recurring problems per 5M category</p>
                            </div>
                            {(filterDepartment !== "all" || filterLine !== "all" || filterDayType !== "all") && <Badge className="bg-[#1E3A5F] text-white">Filtered</Badge>}
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-80 w-full">
                            {ngByCategory.some(c => c.count > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ngByCategory} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F4F6F8' }}
                                            contentStyle={{
                                                backgroundColor: "#FFFFFF",
                                                border: "1px solid #E5E7EB",
                                                borderRadius: "12px",
                                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                                fontSize: "12px",
                                                fontWeight: "bold"
                                            }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="#EF4444"
                                            radius={[4, 4, 0, 0]}
                                            barSize={45}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                                    No NG issues reported for the current selection.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
