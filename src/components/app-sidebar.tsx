import React from "react";
import { Home, ClipboardList, Wrench, Settings, Package, History } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const navItems = [
    { name: "The Garage", icon: Home, path: "/" },
    { name: "Maintenance Schedule", icon: ClipboardList, path: "/schedule" },
    { name: "Service History", icon: History, path: "/history" },
    { name: "Fleet Inventory", icon: Package, path: "/inventory" },
  ];
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="h-20 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/20">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground">IRONKEEP</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Workshop Manager</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === item.path}
                  className="h-11 px-3"
                >
                  <Link to={item.path} className="flex items-center gap-3 group">
                    <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-orange-600' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6 border-t border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-10">
              <Settings className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}