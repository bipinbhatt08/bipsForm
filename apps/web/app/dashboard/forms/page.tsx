"use client"

import * as React from "react"
import {
  IconCirclePlusFilled,
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
import { CreateFormModal } from "~/components/create-form-modal"
import { FormPreviewSheet } from "~/components/form-preview-sheet"
import { useGetForms } from "~/hooks/api/form"
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
      slug={row?.original?.slug
      }
        id={row.original.id}
        onPreview={(table.options.meta as { onPreview: (id: string) => void }).onPreview}
      />
    ),
  },
]

function FormActions({ id, onPreview, slug}: { id: string;slug:string; onPreview: (id: string) => void }) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground data-[state=open]:bg-muted"
        >
          <IconDotsVertical className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem className="gap-2" onClick={() => router.push(`/dashboard/forms/${id}`)}>
          <IconEdit className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={() => onPreview(id)}>
          <IconEye className="size-4" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onClick={() => router.push(`/dashboard/forms/${id}/submissions`)}>
          <IconClipboardList className="size-4" />
          View Responses
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" >
          <Link href={`/forms/${slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full">
            <IconEye className="size-4" />
            View Live
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="gap-2">
          <IconTrash className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function FormsPage() {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [previewId, setPreviewId] = React.useState<string | null>(null)
  const { forms, isLoading } = useGetForms()

  const table = useReactTable({
    data: forms,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: { onPreview: setPreviewId },
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
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Loading forms…
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
                <TableRow key={row.id} className="hover:bg-muted/40">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
    </div>
  )
}
