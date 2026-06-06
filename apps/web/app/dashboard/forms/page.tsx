"use client"

import * as React from "react"
import {
  IconCirclePlusFilled,
  IconChartBar,
  IconClipboardList,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconFileDescription,
  IconGlobe,
  IconLock,
  IconTrash,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { CreateFormModal } from "~/components/create-form-modal"
import { FormPreviewSheet } from "~/components/form-preview-sheet"
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
import { useDeleteForm, useGetForms } from "~/hooks/api/form"
import Link from "next/link"

type Form = ReturnType<typeof useGetForms>["forms"][number]

const columns: ColumnDef<Form>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div>
        <p className="font-medium leading-snug">{row.original.title}</p>
        {row.original.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {row.original.description.length > 40
              ? row.original.description.slice(0, 40) + "..."
              : row.original.description}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "isPublished",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isPublished ? "default" : "secondary"} className="text-xs">
        {row.original.isPublished ? "Published" : "Draft"}
      </Badge>
    ),
  },
  {
    accessorKey: "isPublic",
    header: "Visibility",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs gap-1">
        {row.original.isPublic
          ? <><IconGlobe className="size-3" />Public</>
          : <><IconLock className="size-3" />Private</>}
      </Badge>
    ),
  },
  {
    accessorKey: "isLocked",
    header: "Locked",
    cell: ({ row }) => (
      row.original.isLocked
        ? <Badge variant="destructive" className="text-xs gap-1"><IconLock className="size-3" />Locked</Badge>
        : <span className="text-xs text-muted-foreground">Not Locked</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—",
  },
  {
    accessorKey: "expiresAt",
    header: "Expires On",
    cell: ({ row }) =>
      row.original.expiresAt
        ? new Date(row.original.expiresAt).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => (
      <FormActions
        id={row.original.id}
        slug={row.original.slug}
        onPreview={(table.options.meta as { onPreview: (id: string) => void; onDelete: (id: string) => void }).onPreview}
        onDelete={(table.options.meta as { onPreview: (id: string) => void; onDelete: (id: string) => void }).onDelete}
      />
    ),
  },
]

function FormActions({ id, slug, onPreview, onDelete }: { id: string; slug: string; onPreview: (id: string) => void; onDelete: (id: string) => void }) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground data-[state=open]:bg-muted">
          <IconDotsVertical className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem className="gap-2" onClick={() => router.push(`/dashboard/forms/${id}`)}>
          <IconEdit className="size-4" />Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={() => onPreview(id)}>
          <IconEye className="size-4" />Preview
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={() => router.push(`/dashboard/forms/${id}/submissions`)}>
          <IconClipboardList className="size-4" />View Responses
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={() => router.push(`/dashboard/forms/${id}/analytics`)}>
          <IconChartBar className="size-4" />Analytics
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" asChild>
          <Link href={`/forms/${slug}`} target="_blank" rel="noopener noreferrer">
            <IconEye className="size-4" />View Live
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="gap-2" onClick={() => onDelete(id)}>
          <IconTrash className="size-4" />Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function FormsPage() {
  return (
    <React.Suspense>
      <FormsPageInner />
    </React.Suspense>
  )
}

function FormsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [modalOpen, setModalOpen] = React.useState(false)

  React.useEffect(() => {
    if (searchParams.get("create") === "1") {
      setModalOpen(true)
      router.replace("/dashboard/forms")
    }
  }, [searchParams])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [previewId, setPreviewId] = React.useState<string | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const { forms, isLoading } = useGetForms()
  const { deleteFormAsync } = useDeleteForm()

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteFormAsync({ formId: deleteId })
      toast.success("Form deleted")
    } catch {
      toast.error("Failed to delete form")
    } finally {
      setDeleteId(null)
    }
  }

  const table = useReactTable({
    data: forms,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: { onPreview: setPreviewId, onDelete: setDeleteId },
  })

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Forms</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and share your forms</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <IconCirclePlusFilled className="size-4" />
          Create Form
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                {["Title", "Status", "Visibility", "Locked", "Created", "Expires On", ""].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell><div className="h-4 w-40 rounded bg-muted" /><div className="h-3 w-28 rounded bg-muted mt-1.5" /></TableCell>
                  <TableCell><div className="h-5 w-16 rounded-full bg-muted" /></TableCell>
                  <TableCell><div className="h-5 w-16 rounded-full bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-14 rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-24 rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-24 rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-8 w-8 rounded bg-muted" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center py-24">
          <div className="rounded-full bg-muted p-4">
            <IconFileDescription className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No forms yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first form to get started</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <IconCirclePlusFilled className="size-4" />
            Create Form
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/40 cursor-pointer"
                  onClick={() => router.push(`/dashboard/forms/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} onClick={cell.column.id === "actions" ? (e) => e.stopPropagation() : undefined}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateFormModal open={modalOpen} onOpenChange={setModalOpen} />
      <FormPreviewSheet
        formId={previewId}
        open={previewId !== null}
        onOpenChange={(open) => { if (!open) setPreviewId(null) }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the form, all its fields, and all responses. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
