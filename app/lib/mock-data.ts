export const categories = ["Man", "Machine", "Material", "Method", "Environment"] as const;

export const categoryDescriptions: Record<string, string> = {
    Man: "Personnel readiness and competency checks",
    Machine: "Equipment and machinery condition verification",
    Material: "Raw material and supply chain preparation",
    Method: "Standard operating procedures and work instructions",
    Environment: "Workplace environment and cleanliness checks",
};

export interface RefleksiEntry {
    id: string;
    line: string;
    category: string;
    problem: string;
    countermeasure: string;
}

export const mockRefleksiData: RefleksiEntry[] = [
    { id: "1", line: "Line 1", category: "Machine", problem: "Conveyor belt misalignment after long shutdown", countermeasure: "Implement alignment check SOP before restart" },
    { id: "2", line: "Line 2", category: "Material", problem: "Raw material moisture content increased during storage", countermeasure: "Install dehumidifier in storage area" },
    { id: "3", line: "Line 3", category: "Man", problem: "Operators forgot procedure after extended holiday", countermeasure: "Conduct refresher training before production restart" },
    { id: "4", line: "Line 1", category: "Method", problem: "Outdated SOP used for startup sequence", countermeasure: "Version control and document review before holiday" },
    { id: "5", line: "Line 4", category: "Machine", problem: "Hydraulic system pressure drop during idle period", countermeasure: "Schedule pressure test on first day back" },
    { id: "6", line: "Line 5", category: "Material", problem: "Chemical reagent shelf life expired during holiday", countermeasure: "Audit all chemical inventory before shutdown" },
];
