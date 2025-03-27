"use client";

import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Customer = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  lastOrder: string;
  totalSpent: number;
};

const data: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "active",
    lastOrder: "2023-11-05",
    totalSpent: 2340.5
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "active",
    lastOrder: "2023-10-28",
    totalSpent: 1240.8
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    status: "inactive",
    lastOrder: "2023-09-15",
    totalSpent: 890.2
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    status: "active",
    lastOrder: "2023-11-02",
    totalSpent: 3450.0
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    status: "pending",
    lastOrder: "2023-11-10",
    totalSpent: 150.75
  },
  {
    id: "6",
    name: "Sarah Brown",
    email: "sarah.brown@example.com",
    status: "active",
    lastOrder: "2023-10-22",
    totalSpent: 2780.9
  },
  {
    id: "7",
    name: "David Miller",
    email: "david.miller@example.com",
    status: "inactive",
    lastOrder: "2023-08-30",
    totalSpent: 540.3
  },
  {
    id: "8",
    name: "Jennifer Taylor",
    email: "jennifer.taylor@example.com",
    status: "active",
    lastOrder: "2023-11-08",
    totalSpent: 1890.5
  },
  {
    id: "9",
    name: "James Anderson",
    email: "james.anderson@example.com",
    status: "pending",
    lastOrder: "2023-11-12",
    totalSpent: 0.0
  },
  {
    id: "10",
    name: "Lisa Thomas",
    email: "lisa.thomas@example.com",
    status: "active",
    lastOrder: "2023-10-18",
    totalSpent: 4320.75
  }
];

export const columns: ColumnDef<Customer>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("name")}</div>
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <Badge variant={status === "active" ? "default" : status === "pending" ? "outline" : "secondary"}>
          {status}
        </Badge>
      );
    }
  },
  {
    accessorKey: "lastOrder",
    header: "Last Order",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastOrder"));
      return <div>{date.toLocaleDateString()}</div>;
    }
  },
  {
    accessorKey: "totalSpent",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Total Spent
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("totalSpent"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(customer.id)}>
              Copy customer ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export function CustomersTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection
    }
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter customers..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={event => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
