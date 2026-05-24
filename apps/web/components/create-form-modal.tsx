"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import { useCreateForm } from "~/hooks/api/form"
import { THEMES as THEME_MAP } from "~/app/forms/[slug]/themes"

const THEMES = Object.entries(THEME_MAP).map(([id, { label }]) => ({ id, label }))

interface CreateFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateFormModal({ open, onOpenChange }: CreateFormModalProps) {
  const router = useRouter()
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [themeId, setThemeId] = React.useState<string | undefined>(undefined)
  const [responseLimit, setResponseLimit] = React.useState<string>("")
  const [expiresAt, setExpiresAt] = React.useState<string>("")
  const [isPublic, setIsPublic] = React.useState(false)
  const { createFormAsync, status } = useCreateForm()

  const isPending = status === "pending"

  function resetForm() {
    setTitle("")
    setDescription("")
    setThemeId(undefined)
    setResponseLimit("")
    setExpiresAt("")
    setIsPublic(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const { id } = await createFormAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      themeId: themeId ?? undefined,
      responseLimit: responseLimit ? parseInt(responseLimit, 10) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isPublic,
    })
    resetForm()
    onOpenChange(false)
    router.push(`/dashboard/forms/${id}?new=true`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create a new form</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="form-title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="form-title"
              placeholder="e.g. Contact Us"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={55}
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="form-description">Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea
              id="form-description"
              placeholder="What is this form for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="form-theme">Theme <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Select value={themeId} onValueChange={setThemeId}>
              <SelectTrigger id="form-theme">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="form-response-limit">Response Limit <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="form-response-limit"
                type="number"
                placeholder="e.g. 100"
                min={1}
                value={responseLimit}
                onChange={(e) => setResponseLimit(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="form-expires-at">Expires At <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="form-expires-at"
                type="datetime-local"
                value={expiresAt}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 gap-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="form-public" className="cursor-pointer">Make this form public</Label>
              <p className="text-xs text-muted-foreground">
                {isPublic
                  ? "This form will appear on the public forms page."
                  : "Only accessible via shared link."}
              </p>
            </div>
            <Switch
              id="form-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { resetForm(); onOpenChange(false) }} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isPending}>
              {isPending ? "Creating…" : "Create Form"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
