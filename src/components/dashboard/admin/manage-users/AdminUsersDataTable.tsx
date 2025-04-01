"use client";

import { useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, UserPlus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminUserCreateDialog } from "./AdminUserCreateDialog";
import { fetchUsers } from "@/actions/user/admin";
import { toast } from "sonner";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";

interface AdminUsersDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  initialData: TData[];
  totalUsers: number;
  isLoading?: boolean;
  refreshUsers?: () => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (newPage: number) => void;
    onLimitChange: (newLimit: number) => void;
  };
}

export function AdminUsersDataTable<TData, TValue>({
  columns,
  initialData,
  totalUsers
}: AdminUsersDataTableProps<TData, TValue>) {
  const [data, setData] = useState<TData[]>(initialData ?? []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(totalUsers || 0);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // ✅ enable filtering
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString" // ✅ default filter function
  });

  const refreshUsers = async () => {
    setIsLoading(true);
    try {
      const result = await fetchUsers(pageSize, page * pageSize);
      if (result.success) {
        setData((result.users as TData[]) || []);
        setTotal(result.total || 0);
      } else {
        toast.error(result.error || "Failed to fetch users");
      }
    } catch (err) {
      const message = isFirebaseError(err) ? firebaseError(err) : "Failed to fetch users";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    setIsLoading(true);
    try {
      const result = await fetchUsers(pageSize, newPage * pageSize);
      if (result.success) {
        setData((result.users as TData[]) || []);
      } else {
        toast.error(result.error || "Failed to fetch users");
      }
    } catch (err) {
      const message = isFirebaseError(err) ? firebaseError(err) : "An unexpected error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageSizeChange = async (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
    setIsLoading(true);
    try {
      const result = await fetchUsers(newPageSize, 0);
      if (result.success) {
        setData((result.users as TData[]) || []);
        setTotal(result.total || 0);
      } else {
        toast.error(result.error || "Failed to fetch users");
      }
    } catch (err) {
      const message = isFirebaseError(err) ? firebaseError(err) : "An unexpected error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  //   return (
  //     <div className="space-y-4">
  //       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  //         <div className="flex w-full items-center gap-2 sm:w-auto">
  //           <div className="relative w-full sm:w-[300px]">
  //             <Input
  //               placeholder="Search users..."
  //               value={globalFilter}
  //               onChange={e => setGlobalFilter(e.target.value)}
  //               className="w-full"
  //             />
  //           </div>
  //           <Button variant="outline" size="icon" onClick={refreshUsers}>
  //             <RefreshCw className="h-4 w-4" />
  //             <span className="sr-only">Refresh</span>
  //           </Button>
  //         </div>

  //         <AdminUserCreateDialog onSuccess={refreshUsers}>
  //           <Button size="sm" className="h-8">
  //             <UserPlus className="mr-2 h-4 w-4" />
  //             Add User
  //           </Button>
  //         </AdminUserCreateDialog>
  //       </div>

  //       <div className="rounded-md border">
  //         <Table>
  //           <TableHeader>
  //             {table.getHeaderGroups().map(headerGroup => (
  //               <TableRow key={headerGroup.id}>
  //                 {headerGroup.headers.map(header => (
  //                   <TableHead key={header.id}>
  //                     {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
  //                   </TableHead>
  //                 ))}
  //               </TableRow>
  //             ))}
  //           </TableHeader>
  //           <TableBody>
  //             {isLoading ? (
  //               Array.from({ length: 5 }).map((_, index) => (
  //                 <TableRow key={index}>
  //                   <TableCell colSpan={columns.length} className="h-16">
  //                     <div className="flex items-center space-x-4">
  //                       <Skeleton className="h-8 w-8" />
  //                       <div className="space-y-2">
  //                         <Skeleton className="h-4 w-[250px]" />
  //                         <Skeleton className="h-4 w-[200px]" />
  //                       </div>
  //                     </div>
  //                   </TableCell>
  //                 </TableRow>
  //               ))
  //             ) : table.getRowModel().rows?.length ? (
  //               table.getRowModel().rows.map(row => (
  //                 <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
  //                   {row.getVisibleCells().map(cell => (
  //                     <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
  //                   ))}
  //                 </TableRow>
  //               ))
  //             ) : (
  //               <TableRow>
  //                 <TableCell colSpan={columns.length} className="h-24 text-center">
  //                   No users found.
  //                 </TableCell>
  //               </TableRow>
  //             )}
  //           </TableBody>
  //         </Table>
  //       </div>

  //       <div className="flex items-center justify-between">
  //         <div className="text-sm text-muted-foreground">
  //           {table.getFilteredSelectedRowModel().rows.length > 0 && (
  //             <span>{table.getFilteredSelectedRowModel().rows.length} row(s) selected</span>
  //           )}
  //         </div>

  //         <div className="flex items-center space-x-2">
  //           <p className="text-sm font-medium">Rows per page</p>
  //           <Select value={`${pageSize}`} onValueChange={value => handlePageSizeChange(Number(value))}>
  //             <SelectTrigger className="h-8 w-[70px]">
  //               <SelectValue />
  //             </SelectTrigger>
  //             <SelectContent side="top">
  //               {[10, 20, 30, 40, 50].map(size => (
  //                 <SelectItem key={size} value={`${size}`}>
  //                   {size}
  //                 </SelectItem>
  //               ))}
  //             </SelectContent>
  //           </Select>

  //           <div className="text-sm font-medium">
  //             Page {page + 1} of {Math.max(1, Math.ceil(total / pageSize))}
  //           </div>

  //           <div className="flex items-center space-x-2">
  //             <Button
  //               variant="outline"
  //               className="h-8 w-8 p-0"
  //               onClick={() => handlePageChange(Math.max(0, page - 1))}
  //               disabled={page === 0}>
  //               <ChevronLeft className="h-4 w-4" />
  //             </Button>
  //             <Button
  //               variant="outline"
  //               className="h-8 w-8 p-0"
  //               onClick={() => handlePageChange(Math.min(Math.ceil(total / pageSize) - 1, page + 1))}
  //               disabled={page >= Math.ceil(total / pageSize) - 1}>
  //               <ChevronRight className="h-4 w-4" />
  //             </Button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Input
              placeholder="Search users..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline" size="icon" onClick={refreshUsers}>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        <AdminUserCreateDialog onSuccess={refreshUsers}>
          <Button size="sm" className="h-8">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </AdminUserCreateDialog>
      </div>

      {/* Added overflow-x-auto to allow horizontal scrolling on mobile */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={columns.length} className="h-16">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-8" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
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
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Improved pagination controls for mobile */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span>{table.getFilteredSelectedRowModel().rows.length} row(s) selected</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select value={`${pageSize}`} onValueChange={value => handlePageSizeChange(Number(value))}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map(size => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm font-medium">
            Page {page + 1} of {Math.max(1, Math.ceil(total / pageSize))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(Math.max(0, page - 1))}
              disabled={page === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(Math.min(Math.ceil(total / pageSize) - 1, page + 1))}
              disabled={page >= Math.ceil(total / pageSize) - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
