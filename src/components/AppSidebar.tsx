'use client';
import { ChevronDown } from "lucide-react";
import React, { useMemo } from "react";
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { sideBarEntries } from "./ui/sidebar-data";
import { useUser } from '@/contexts/user/user-context';
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  collapsed: boolean;
  toggleSidebar: () => void;
  className?: string;
};

type UserProfileProps = {
  collapsed: boolean;
  user?: { username?: string} | null;
}

const UserProfile = ({ collapsed, user }: UserProfileProps) => {
  const username = user?.username || 'User';
  const initial = username[0].toUpperCase();

  return (
    <div className="flex flex-1 items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
        {collapsed ? initial : <span className="text-sm">{initial}</span>}
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{username}</span>
          <span className="text-xs text-muted-foreground">@{username.toLowerCase()}</span>
        </div>
      )}
    </div>
  );
};

const MenuItemContent = ({ entry, collapsed }: { entry: any; collapsed: boolean }) => {
  const Icon = entry.icon as React.ElementType<{ className?: string }>;
  
  return (
    <>
      {Icon && <Icon className={collapsed ? "w-6 h-6" : "w-5 h-5"} />}
      {!collapsed && <span>{entry.title}</span>}
    </>
  );
};

export function AppSidebar({ collapsed, toggleSidebar, className }: AppSidebarProps) {
  const { user, loading, error } = useUser();

  const memoizedEntries = useMemo(() => (
    sideBarEntries.map((entry) => (
      entry.type === "link" ? (
        <SidebarMenuItem key={entry.title} className="p-2">
          <SidebarMenuButton asChild>
            <Link href={entry.url} className="flex items-center gap-2">
              <MenuItemContent entry={entry} collapsed={collapsed} />
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ) : (
        <Collapsible key={entry.title} defaultOpen={false}>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <MenuItemContent entry={entry} collapsed={collapsed} />
                {!collapsed && (
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            {!collapsed && (
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {entry.children.map((child) => (
                      <SidebarMenuItem key={child.title}>
                        <SidebarMenuButton asChild>
                          <a href={child.url} className="flex items-center gap-2">
                            <MenuItemContent entry={child} collapsed={collapsed} />
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            )}
          </SidebarGroup>
        </Collapsible>
      )
    ))
  ), [collapsed]);

  return (
    <Sidebar
      style={{ overflow: "visible"}}
      className={cn(`${collapsed ? "w-[80px]" : "w-[300px]"} transition-all duration-300`, 'bg-backgroud', className)}
    >
      <SidebarHeader className="relative flex overflow-visible items-center justify-between mt-4 mb-4 px-4">
        {loading ? (
          <div className='animate-pulse h-8 w-8 rounded-full bg-gray-200' />
        ) : error ? (
          <span className='text-red-500'>⚠️</span>
        ) : (
          <UserProfile collapsed={collapsed} user={user || undefined} />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>{memoizedEntries}</SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t" />
    </Sidebar>
  );
}