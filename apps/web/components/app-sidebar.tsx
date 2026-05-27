"use client"

import * as React from "react"
import {
  IconCompass,
  IconDashboard,
  IconExternalLink,
  IconFileDescription,
} from "@tabler/icons-react"
import Link from "next/link"

import { NavMain } from "~/components/nav-main"
import { NavSecondary } from "~/components/nav-secondary"
import { NavUser } from "~/components/nav-user"
import { LogoMark, BipsFormWordmark } from "~/components/brand"
import { useUser } from "~/hooks/api/auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "Forms", url: "/dashboard/forms", icon: IconFileDescription },
]

const navSecondary = [
  { title: "Explore", url: "/explore", icon: IconCompass },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="hover:bg-sidebar-accent/50">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <LogoMark size={26} />
                <BipsFormWordmark size={14} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-muted-foreground hover:text-foreground">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <IconExternalLink className="size-4" />
                <span>View site</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={{
          name: user?.fullName ?? "...",
          email: user?.email ?? "",
          avatar: "",
          initials,
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
