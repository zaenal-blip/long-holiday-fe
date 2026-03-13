import { Outlet } from "react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "~/components/AppSidebar";

const AppLayout = () => {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col bg-background">
                    <header className="h-12 flex items-center border-b border-[#E5E7EB] bg-white px-2 shadow-sm">
                        <SidebarTrigger />
                    </header>
                    <main className="flex-1 overflow-auto bg-background">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AppLayout;
