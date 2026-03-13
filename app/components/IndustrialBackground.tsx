const IndustrialBackground = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Base gradient orbs for depth */}
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-secondary/[0.04] blur-3xl animate-pulse-slow" style={{ animationDelay: "4s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/[0.02] blur-3xl animate-pulse-slow" style={{ animationDelay: "7s" }} />

            {/* Holographic blueprint grid */}
            <div
                className="absolute inset-0 opacity-[0.02] animate-grid-glow"
                style={{
                    backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Hex grid overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.015]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="hexGrid" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                        <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66Z" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hexGrid)" />
            </svg>

            {/* Main SVG layer */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="dataFlowH" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(195, 53%, 50%)" stopOpacity="0" />
                        <stop offset="40%" stopColor="hsl(195, 53%, 50%)" stopOpacity="0.15" />
                        <stop offset="60%" stopColor="hsl(195, 53%, 50%)" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="hsl(195, 53%, 50%)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="dataFlowV" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(195, 53%, 50%)" stopOpacity="0" />
                        <stop offset="50%" stopColor="hsl(195, 53%, 50%)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="hsl(195, 53%, 50%)" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Data flow lines - horizontal */}
                <line x1="0" y1="20%" x2="100%" y2="20%" stroke="url(#dataFlowH)" strokeWidth="1" className="animate-trace-h" />
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#dataFlowH)" strokeWidth="0.5" className="animate-trace-h" style={{ animationDelay: "3s" }} />
                <line x1="0" y1="80%" x2="100%" y2="80%" stroke="url(#dataFlowH)" strokeWidth="1" className="animate-trace-h" style={{ animationDelay: "6s" }} />

                {/* Data flow lines - vertical */}
                <line x1="15%" y1="0" x2="15%" y2="100%" stroke="url(#dataFlowV)" strokeWidth="0.5" className="animate-trace-v" />
                <line x1="85%" y1="0" x2="85%" y2="100%" stroke="url(#dataFlowV)" strokeWidth="0.5" className="animate-trace-v" style={{ animationDelay: "4s" }} />

                {/* Digital connection nodes with pulses */}
                {[
                    { cx: "15%", cy: "20%" }, { cx: "85%", cy: "20%" },
                    { cx: "15%", cy: "80%" }, { cx: "85%", cy: "80%" },
                    { cx: "50%", cy: "50%" }, { cx: "30%", cy: "35%" },
                    { cx: "70%", cy: "65%" }, { cx: "10%", cy: "50%" },
                    { cx: "90%", cy: "50%" },
                ].map((pos, i) => (
                    <g key={`node-${i}`}>
                        <circle cx={pos.cx} cy={pos.cy} r="1.5" fill="hsl(195, 53%, 50%)" opacity="0.12" className="animate-node-pulse" style={{ animationDelay: `${i * 1.2}s` }} />
                        <circle cx={pos.cx} cy={pos.cy} r="6" fill="none" stroke="hsl(195, 53%, 50%)" strokeWidth="0.5" opacity="0.06" className="animate-node-pulse" style={{ animationDelay: `${i * 1.2}s` }} />
                    </g>
                ))}

                {/* Connection lines between nodes */}
                {[
                    { x1: "15%", y1: "20%", x2: "30%", y2: "35%" },
                    { x1: "30%", y1: "35%", x2: "50%", y2: "50%" },
                    { x1: "50%", y1: "50%", x2: "70%", y2: "65%" },
                    { x1: "70%", y1: "65%", x2: "85%", y2: "80%" },
                    { x1: "85%", y1: "20%", x2: "70%", y2: "65%" },
                    { x1: "15%", y1: "80%", x2: "30%", y2: "35%" },
                ].map((line, i) => (
                    <line key={`conn-${i}`} {...line} stroke="hsl(195, 53%, 50%)" strokeWidth="0.5" opacity="0.05" strokeDasharray="6 4" className="animate-dash-flow" style={{ animationDelay: `${i * 2}s` }} />
                ))}
            </svg>

            {/* Robotic Arm - Left Side */}
            <svg className="absolute top-[12%] left-[3%] w-32 h-44 opacity-[0.06] animate-robot-arm" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
                {/* Base platform */}
                <rect x="20" y="120" width="60" height="12" rx="4" fill="hsl(var(--primary))" />
                <rect x="35" y="108" width="30" height="16" rx="3" fill="hsl(var(--primary))" />
                {/* Pivot joint */}
                <circle cx="50" cy="105" r="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                <circle cx="50" cy="105" r="3" fill="hsl(var(--primary))" />
                {/* Lower arm */}
                <rect x="46" y="65" width="8" height="42" rx="3" fill="hsl(var(--primary))" />
                {/* Elbow joint */}
                <circle cx="50" cy="62" r="6" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                <circle cx="50" cy="62" r="2.5" fill="hsl(var(--primary))" />
                {/* Upper arm */}
                <rect x="47" y="28" width="6" height="36" rx="2" fill="hsl(var(--primary))" transform="rotate(-20, 50, 62)" />
                {/* Wrist joint */}
                <circle cx="38" cy="28" r="4" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                {/* Gripper */}
                <path d="M30 18 L34 28 M30 18 L26 28" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M46 18 L42 28 M46 18 L50 28" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
                {/* Hydraulic lines */}
                <path d="M55 100 Q65 80 55 65" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.6" />
            </svg>

            {/* Robotic Arm - Right Side (mirrored, different pose) */}
            <svg className="absolute bottom-[15%] right-[3%] w-28 h-40 opacity-[0.05] animate-robot-arm-alt" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="120" width="60" height="12" rx="4" fill="hsl(var(--primary))" />
                <rect x="30" y="108" width="40" height="16" rx="3" fill="hsl(var(--primary))" />
                <circle cx="50" cy="105" r="7" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                <circle cx="50" cy="105" r="3" fill="hsl(var(--primary))" />
                <rect x="46" y="68" width="8" height="40" rx="3" fill="hsl(var(--primary))" />
                <circle cx="50" cy="65" r="6" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                <rect x="47" y="30" width="6" height="38" rx="2" fill="hsl(var(--primary))" transform="rotate(15, 50, 65)" />
                <path d="M58 22 L55 32 M62 22 L65 32" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M72 22 L69 32 M76 22 L79 32" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            {/* Gears - Top Right cluster */}
            <svg className="absolute top-[6%] right-[10%] w-32 h-32 animate-spin-slow opacity-[0.05]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 L54 22 L62 16 L59 28 L70 26 L64 36 L74 40 L64 44 L72 52 L62 50 L66 60 L56 56 L54 66 L50 56 L46 66 L44 56 L34 60 L38 50 L28 52 L36 44 L26 40 L36 36 L30 26 L41 28 L38 16 L46 22 Z" fill="hsl(var(--primary))" />
                <circle cx="50" cy="40" r="12" fill="hsl(var(--background))" />
                <circle cx="50" cy="40" r="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                <circle cx="50" cy="40" r="3" fill="hsl(var(--primary))" />
            </svg>

            {/* Interlocking gear */}
            <svg className="absolute top-[2%] right-[20%] w-16 h-16 animate-spin-slow-reverse opacity-[0.04]" style={{ animationDuration: "16s" }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 15 L55 28 L65 22 L60 35 L72 34 L64 44 L74 50 L64 54 L70 64 L58 60 L58 72 L50 62 L42 72 L42 60 L30 64 L36 54 L26 50 L36 44 L28 34 L40 35 L35 22 L45 28 Z" fill="hsl(var(--primary))" />
                <circle cx="50" cy="44" r="10" fill="hsl(var(--background))" />
                <circle cx="50" cy="44" r="5" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
            </svg>

            {/* Gears - Bottom Left */}
            <svg className="absolute bottom-[8%] left-[6%] w-24 h-24 animate-spin-slow-reverse opacity-[0.06]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 L54 22 L62 16 L59 28 L70 26 L64 36 L74 40 L64 44 L72 52 L62 50 L66 60 L56 56 L54 66 L50 56 L46 66 L44 56 L34 60 L38 50 L28 52 L36 44 L26 40 L36 36 L30 26 L41 28 L38 16 L46 22 Z" fill="hsl(var(--primary))" />
                <circle cx="50" cy="40" r="12" fill="hsl(var(--background))" />
                <circle cx="50" cy="40" r="4" fill="hsl(var(--primary))" />
            </svg>

            <svg className="absolute bottom-[18%] left-[14%] w-12 h-12 animate-spin-slow opacity-[0.04]" style={{ animationDuration: "14s" }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 18 L55 30 L65 24 L60 36 L72 38 L62 46 L68 56 L58 52 L56 64 L50 54 L44 64 L42 52 L32 56 L38 46 L28 38 L40 36 L35 24 L45 30 Z" fill="hsl(var(--primary))" />
                <circle cx="50" cy="42" r="8" fill="hsl(var(--background))" />
            </svg>

            {/* Factory silhouette - Left */}
            <svg className="absolute bottom-0 left-[2%] w-56 h-36 opacity-[0.035] animate-factory-float" viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 130 L10 70 L25 70 L25 45 L30 45 L30 35 L35 35 L35 45 L40 45 L40 70 L55 70 L55 40 L75 65 L75 40 L95 65 L95 30 L110 55 L110 25 L115 25 L115 130 Z" fill="hsl(var(--primary))" />
                {/* Smokestacks */}
                <rect x="28" y="12" width="5" height="23" rx="1" fill="hsl(var(--primary))" />
                <rect x="34" y="18" width="4" height="17" rx="1" fill="hsl(var(--primary))" />
                {/* Smoke particles */}
                <circle cx="30" cy="8" r="3" fill="hsl(var(--primary))" opacity="0.4" className="animate-smoke" />
                <circle cx="36" cy="12" r="2.5" fill="hsl(var(--primary))" opacity="0.3" className="animate-smoke" style={{ animationDelay: "2s" }} />
                <circle cx="28" cy="4" r="2" fill="hsl(var(--primary))" opacity="0.2" className="animate-smoke" style={{ animationDelay: "3.5s" }} />
                {/* Windows */}
                <rect x="60" y="75" width="5" height="5" rx="1" fill="hsl(var(--background))" opacity="0.4" />
                <rect x="70" y="75" width="5" height="5" rx="1" fill="hsl(var(--background))" opacity="0.4" />
                <rect x="80" y="70" width="5" height="5" rx="1" fill="hsl(var(--background))" opacity="0.4" />
                <rect x="100" y="60" width="5" height="5" rx="1" fill="hsl(var(--background))" opacity="0.4" />
            </svg>

            {/* Factory silhouette - Right */}
            <svg className="absolute bottom-0 right-[1%] w-60 h-40 opacity-[0.03] animate-factory-float" style={{ animationDelay: "4s" }} viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg">
                <path d="M140 150 L140 55 L155 55 L155 40 L160 40 L160 28 L165 28 L165 40 L170 40 L170 55 L185 55 L185 42 L205 65 L205 150 Z" fill="hsl(var(--primary))" />
                <rect x="158" y="8" width="5" height="20" rx="1" fill="hsl(var(--primary))" />
                <circle cx="160" cy="4" r="2.5" fill="hsl(var(--primary))" opacity="0.3" className="animate-smoke" style={{ animationDelay: "1s" }} />
                {/* Warehouse */}
                <path d="M20 150 L20 90 L90 90 L90 150 Z" fill="hsl(var(--primary))" />
                <path d="M15 90 L55 68 L95 90 Z" fill="hsl(var(--primary))" />
                <rect x="30" y="100" width="7" height="9" rx="1" fill="hsl(var(--background))" opacity="0.35" />
                <rect x="48" y="100" width="7" height="9" rx="1" fill="hsl(var(--background))" opacity="0.35" />
                <rect x="66" y="100" width="7" height="9" rx="1" fill="hsl(var(--background))" opacity="0.35" />
                {/* Crane */}
                <rect x="108" y="40" width="4" height="110" fill="hsl(var(--primary))" />
                <rect x="100" y="40" width="30" height="3" fill="hsl(var(--primary))" />
                <line x1="112" y1="43" x2="125" y2="80" stroke="hsl(var(--primary))" strokeWidth="1" />
                <rect x="122" y="80" width="6" height="8" fill="hsl(var(--primary))" />
            </svg>

            {/* Conveyor belt lines */}
            <div className="absolute bottom-[28%] left-0 w-full h-px">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.06] to-transparent animate-conveyor" />
            </div>
            <div className="absolute bottom-[30%] left-0 w-full h-px">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent animate-conveyor" style={{ animationDelay: "2s" }} />
            </div>
            <div className="absolute top-[22%] left-0 w-full h-px">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent animate-conveyor" style={{ animationDelay: "5s", animationDuration: "16s" }} />
            </div>

            {/* AI / Data flow pulse lines */}
            {[18, 42, 68, 88].map((left, i) => (
                <div
                    key={`pulse-${i}`}
                    className="absolute w-px animate-data-pulse"
                    style={{
                        left: `${left}%`,
                        top: 0,
                        height: "100%",
                        background: `linear-gradient(180deg, transparent, hsl(195 53% 50% / 0.08), transparent)`,
                        backgroundSize: "1px 200px",
                        animationDelay: `${i * 3}s`,
                    }}
                />
            ))}

            {/* Floating digital particles */}
            {Array.from({ length: 16 }).map((_, i) => (
                <div
                    key={`particle-${i}`}
                    className="absolute rounded-full animate-float-particle"
                    style={{
                        width: 2 + (i % 3) * 1.5,
                        height: 2 + (i % 3) * 1.5,
                        left: `${5 + i * 5.8}%`,
                        bottom: "-8px",
                        backgroundColor: i % 3 === 0 ? "hsl(195, 53%, 50%)" : "hsl(var(--primary))",
                        opacity: 0.04 + (i % 4) * 0.015,
                        animationDelay: `${i * 1.5}s`,
                        animationDuration: `${16 + (i % 6) * 3}s`,
                    }}
                />
            ))}

            {/* Glowing cyan accent dots */}
            {[
                { top: "12%", left: "22%" },
                { top: "35%", right: "15%" },
                { top: "65%", left: "30%" },
                { top: "82%", right: "25%" },
                { top: "25%", left: "65%" },
                { top: "55%", right: "8%" },
                { top: "45%", left: "8%" },
                { top: "90%", left: "55%" },
            ].map((pos, i) => (
                <div
                    key={`glow-${i}`}
                    className="absolute w-1.5 h-1.5 rounded-full animate-glow-dot"
                    style={{
                        ...pos,
                        backgroundColor: "hsl(195, 53%, 50%)",
                        boxShadow: "0 0 10px 3px hsla(195, 53%, 50%, 0.25)",
                        animationDelay: `${i * 2}s`,
                    }}
                />
            ))}

            {/* Scanning line */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/[0.07] to-transparent animate-scan-line" />
            </div>

            {/* Gradient wave overlay */}
            <div className="absolute bottom-0 left-0 w-full h-56 animate-gradient-wave" style={{
                background: "linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.015) 40%, hsl(var(--primary) / 0.04) 100%)",
            }} />
        </div>
    );
};

export default IndustrialBackground;
