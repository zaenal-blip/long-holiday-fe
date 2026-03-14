import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
    Factory,
    Wrench,
    ShieldCheck,
    TrendingUp,
    Droplets,
    Building2,
    ClipboardList,
    BarChart3,
    FileSearch,
    History,
    Cog,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import epkdLogo from "../assets/logo3.png";

const deptConfig: Record<string, { icon: typeof Factory; gradient: string; glow: string }> = {
    Production: { icon: Factory, gradient: "from-primary to-secondary", glow: "shadow-primary/20" },
    Maintenance: { icon: Wrench, gradient: "from-secondary to-primary", glow: "shadow-secondary/20" },
    Quality: { icon: ShieldCheck, gradient: "from-primary to-secondary", glow: "shadow-primary/20" },
    Kaizen: { icon: TrendingUp, gradient: "from-secondary to-primary", glow: "shadow-secondary/20" },
    "Tool Coolant": { icon: Droplets, gradient: "from-primary to-secondary", glow: "shadow-primary/20" },
    Office: { icon: Building2, gradient: "from-secondary to-primary", glow: "shadow-secondary/20" },
    "Die Maintenance": { icon: Cog, gradient: "from-primary to-secondary", glow: "shadow-primary/20" },
    PAD: { icon: Building2, gradient: "from-secondary to-primary", glow: "shadow-secondary/20" },
};

const menuItems = [
    { title: "Input 5M", icon: ClipboardList, path: "/input-5m" },
    { title: "Dashboard", icon: BarChart3, path: "/dashboard" },
    { title: "Review Data", icon: FileSearch, path: "/review" },
    { title: "Refleksi Problem Last Year", icon: History, path: "/refleksi" },
];

// Floating particles for industrial background
const FloatingParticle = ({ delay, x, size, duration }: { delay: number; x: number; size: number; duration: number }) => (
    <div
        className="absolute rounded-full bg-primary/[0.04] animate-float"
        style={{
            width: size,
            height: size,
            left: `${x}%`,
            bottom: `-${size}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
        }}
    />
);

const GearIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <Cog className={className} style={style} />
);

const Welcome = () => {
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [departmentsList, setDepartmentsList] = useState<string[]>([]);
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [showSplash, setShowSplash] = useState(false);
    const [splashFading, setSplashFading] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        apiFetch<{ name: string }[]>("/master-data/departments")
            .then(data => setDepartmentsList(data.map(d => d.name)))
            .catch(err => console.error("Failed to load departments", err));

        // Check if splash has been shown in this session
        const hasShownSplash = sessionStorage.getItem("splashShown");
        if (!hasShownSplash) {
            setShowSplash(true);
            sessionStorage.setItem("splashShown", "true");

            // Trigger fade out after 2.5 seconds
            setTimeout(() => {
                setSplashFading(true);
                // Remove splash completely after fade out completes
                setTimeout(() => {
                    setShowSplash(false);
                    setMounted(true); // Mount main content after splash
                }, 800);
            }, 2500);
        } else {
            setMounted(true);
        }
    }, []);

    const handleMenuClick = (path: string) => {
        setSelectedDept(null);
        navigate(`${path}?dept=${selectedDept}`);
    };

    const particles = Array.from({ length: 8 }, (_, i) => ({
        delay: i * 2.5,
        x: 10 + i * 12,
        size: 20 + Math.random() * 40,
        duration: 15 + Math.random() * 10,
    }));

    if (showSplash) {
        return (
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 bg-[#0f172a] ${splashFading ? 'opacity-0' : 'opacity-100'}`}>
                {/* Blueprint background grid */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)`,
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Animated digital lines */}
                <div className="absolute inset-0 overflow-hidden opacity-30">
                    <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent absolute top-1/4 animate-scan-line" />
                    <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#22C55E] to-transparent absolute top-3/4 animate-scan-line" style={{ animationDelay: '2s' }} />
                </div>

                {/* Rotating Gears */}
                <GearIcon className="absolute top-[20%] right-[20%] w-24 h-24 text-slate-800 animate-spin-slow opacity-40 mix-blend-screen" />
                <GearIcon className="absolute bottom-[20%] left-[20%] w-32 h-32 text-slate-800 animate-spin-slow-reverse opacity-40 mix-blend-screen" />

                {/* Central Logo Container */}
                <div className="relative z-10 flex flex-col items-center animate-in zoom-in-90 duration-1000">
                    {/* Glow effect behind logo */}
                    <div className="absolute inset-0 bg-[#3B82F6]/20 blur-3xl rounded-full scale-150 animate-pulse-slow" />

                    <img
                        src={epkdLogo}
                        alt="EPKD Logo"
                        className="w-48 h-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] mb-8"
                    />

                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
                        <div className="flex items-center gap-3 mb-2 opacity-80">
                            <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-[#3B82F6]" />
                            <div className="w-2 h-2 rounded-full bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-[#3B82F6]" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-widest text-[#F4F6F8] drop-shadow-md">
                            Fabric & Manufactur Automotive
                        </h2>
                        <h2 className="text-2xl font-bold tracking-widest text-[#F4F6F8] drop-shadow-md">
                            Digital System
                        </h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/50">
            {/* Animated background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Gradient orbs */}
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/[0.03] blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/[0.04] blur-3xl animate-pulse-slow" style={{ animationDelay: "3s" }} />
                <div className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full bg-primary/[0.02] blur-2xl animate-pulse-slow" style={{ animationDelay: "6s" }} />

                {/* Floating particles */}
                {mounted && particles.map((p, i) => (
                    <FloatingParticle key={i} {...p} />
                ))}

                {/* Rotating gear decorations */}
                <GearIcon
                    className="absolute top-20 right-[15%] w-16 h-16 text-primary/[0.05] animate-spin-slow"
                />
                <GearIcon
                    className="absolute bottom-32 left-[10%] w-12 h-12 text-secondary/[0.06] animate-spin-slow"
                    style={{ animationDirection: "reverse", animationDuration: "25s" }}
                />
                <GearIcon
                    className="absolute top-1/2 right-[8%] w-10 h-10 text-primary/[0.04] animate-spin-slow"
                    style={{ animationDuration: "30s" }}
                />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
                {/* Header */}
                <div
                    className={`text-center mb-14 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        }`}
                >
                    {/* Premium factory icon */}
                    <div className="relative inline-flex items-center justify-center mb-8 group cursor-default">
                        <img src={epkdLogo} alt="Factory Logo" className="w-40 h-auto object-contain filter drop-shadow-lg group-hover:scale-105 group-hover:drop-shadow-xl transition-all duration-500" />
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
                        Plant 3 Long Holiday Checking System
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                        Digital checksheet for pre and post long holiday preparation
                    </p>

                    {/* Decorative line */}
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/30" />
                        <div className="w-2 h-2 rounded-full bg-primary/30" />
                        <div className="w-24 h-px bg-primary/30" />
                        <div className="w-2 h-2 rounded-full bg-primary/30" />
                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/30" />
                    </div>
                </div>

                {/* Department grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full">
                    {departmentsList.map((dept, i) => {
                        const config = deptConfig[dept] || deptConfig.Production;
                        const Icon = config.icon;
                        return (
                            <div
                                key={dept}
                                className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                    }`}
                                style={{ transitionDelay: `${300 + i * 100}ms` }}
                            >
                                <Card
                                    className={`group cursor-pointer border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl ${config.glow} transition-all duration-300 hover:-translate-y-1`}
                                    onClick={() => setSelectedDept(dept)}
                                >
                                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                        <div className="relative mb-5">
                                            <div className="absolute inset-0 rounded-xl bg-primary/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div
                                                className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
                                            >
                                                <Icon className="w-7 h-7 text-primary-foreground" />
                                            </div>
                                        </div>
                                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                            {dept}
                                        </span>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>

                {/* Footer text */}
                <p
                    className={`mt-12 text-xs text-muted-foreground/60 tracking-wider uppercase transition-all duration-1000 delay-1000 ${mounted ? "opacity-100" : "opacity-0"
                        }`}
                >
                    © Develop By Zaenal Arifin - 2026
                </p>
            </div>

            {/* Department menu dialog */}
            <Dialog open={!!selectedDept} onOpenChange={() => setSelectedDept(null)}>
                <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-border/50">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold">{selectedDept}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Card
                                    key={item.title}
                                    className="group cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                                    onClick={() => handleMenuClick(item.path)}
                                >
                                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium text-foreground leading-tight">
                                            {item.title}
                                        </span>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Welcome;
