import { NavLink } from "@/components/NavLink";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    ClipboardCheck,
    Clock,
    FileSearch,
    Home,
    Settings
} from "lucide-react";
import { useLocation } from "react-router";
import epkd1 from "../assets/epkd2.png";

const menuItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Input 5M", url: "/input-5m", icon: ClipboardCheck },
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { title: "Review Data", url: "/review", icon: FileSearch },
    { title: "Refleksi", url: "/refleksi", icon: Clock },
    { title: "Master Data", url: "/master-data", icon: Settings },
];

export function AppSidebar() {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const location = useLocation();

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <div className={cn(
                    "w-full pt-0 pb-3 px-0 border-b border-sidebar-border/10",
                    collapsed ? "min-h-[60px] flex items-center justify-center p-2" : "min-h-[80px]"
                )}>
                    <img
                        src={epkd1}
                        alt="EPKD 5M Logo"
                        className={cn(
                            "object-contain transition-all duration-300",
                            collapsed ? "h-5 w-auto mx-auto" : "w-full h-auto"
                        )}
                    />
                </div>
                <SidebarGroup>
                    <SidebarGroupContent className="px-2">
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title} className="mb-1.5 last:mb-0">
                                    <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent active:bg-transparent">
                                        <NavLink
                                            to={item.url}
                                            end={item.url === "/"}
                                            className={cn(
                                                "relative flex items-center w-full px-4 py-3 rounded-[10px] transition-all duration-200 group hover:bg-white/5 overflow-hidden",
                                                collapsed && "justify-center px-0 h-12 w-12 mx-auto"
                                            )}
                                            activeClassName="bg-white/10 text-white font-bold"
                                        >
                                            {({ isActive }: { isActive: boolean }) => (
                                                <>
                                                    {isActive && (
                                                        <div className="absolute left-0 top-0 w-1 h-full bg-[#4F8CFF] rounded-r-full shadow-[0_0_8px_rgba(79,140,255,0.5)]" />
                                                    )}
                                                    <item.icon
                                                        className={cn(
                                                            "w-5 h-5 transition-colors duration-200 shrink-0",
                                                            isActive ? "text-white" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground",
                                                            !collapsed && "mr-3"
                                                        )}
                                                    />
                                                    {!collapsed && (
                                                        <span className="truncate">
                                                            {item.title}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
