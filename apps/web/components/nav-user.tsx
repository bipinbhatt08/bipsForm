"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  IconCheck,
  IconDotsVertical,
  IconLogout,
  IconPencil,
  IconX,
} from "@tabler/icons-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"
import { useLogout, useUpdateUsername } from "~/hooks/api/auth"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    initials?: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { logoutAsync, isPending } = useLogout()
  const { updateUsernameAsync, isPending: isUpdating } = useUpdateUsername()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [editingName, setEditingName] = React.useState(false)
  const [nameValue, setNameValue] = React.useState(user.name)

  async function handleSaveName() {
    const trimmed = nameValue.trim()
    if (!trimmed || trimmed === user.name) { setEditingName(false); return }
    await updateUsernameAsync({ fullName: trimmed })
    setEditingName(false)
  }

  function handleCancelEdit() {
    setNameValue(user.name)
    setEditingName(false)
  }

  function handleLogout() {
    router.push("/login")
    logoutAsync({})
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{user.initials ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{user.initials ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <p className="text-xs text-muted-foreground mb-1.5">Display name</p>
              {editingName ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") handleCancelEdit() }}
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
                    maxLength={80}
                  />
                  <button onClick={handleSaveName} disabled={isUpdating} className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground">
                    <IconCheck className="size-3.5" />
                  </button>
                  <button onClick={handleCancelEdit} className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground">
                    <IconX className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setNameValue(user.name); setEditingName(true) }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-muted group"
                >
                  <span className="truncate">{user.name}</span>
                  <IconPencil className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 ml-2" />
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setConfirmOpen(true)} className="text-destructive focus:text-destructive">
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Logging out…" : "Log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenu>
  )
}
