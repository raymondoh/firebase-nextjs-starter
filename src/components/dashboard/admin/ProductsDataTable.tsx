"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ProductDialog } from "./ProductDialog";
import { getAllProducts, deleteProduct } from "@/actions/products";
import { toast } from "sonner";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type { Product } from "@/types/product";

interface ProductsDataTableProps {
  initialData: Product[];
}

export function ProductsDataTable({ initialData = [] }: ProductsDataTableProps) {
  const router = useRouter();
  const [data, setData] = useState<Product[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const image = row.getValue("image") as string;
        return (
          <div className="relative h-10 w-10 rounded-md overflow-hidden">
            <Image
              src={image || "/placeholder.svg?height=40&width=40"}
              alt={row.getValue("name")}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        );
      }
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD"
        }).format(price);
        return <div>{formatted}</div>;
      }
    },
    {
      accessorKey: "inStock",
      header: "Status",
      cell: ({ row }) => {
        const inStock = row.getValue("inStock") as boolean;
        return <Badge variant={inStock ? "default" : "destructive"}>{inStock ? "In Stock" : "Out of Stock"}</Badge>;
      }
    },
    {
      accessorKey: "badge",
      header: "Badge",
      cell: ({ row }) => {
        const badge = row.getValue("badge") as string;
        return badge ? <Badge variant="outline">{badge}</Badge> : null;
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
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
              <DropdownMenuItem onClick={() => router.push(`/admin/products/${product.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/products/${product.id}`, "_blank")}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setProductToDelete(product)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex: page,
        pageSize
      }
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString"
  });

  const refreshProducts = async () => {
    setIsLoading(true);
    try {
      const result = await getAllProducts();
      if (result.success) {
        setData(result.data || []);
      } else {
        toast.error(result.error || "Failed to fetch products");
      }
    } catch (err) {
      const message = isFirebaseError(err) ? firebaseError(err) : "Failed to fetch products";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number.parseInt(newPageSize, 10));
    setPage(0);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeletingProduct(true);
    try {
      const result = await deleteProduct(productToDelete.id);
      if (result.success) {
        toast.success("Product deleted successfully");
        setData(data.filter(p => p.id !== productToDelete.id));
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    } catch (err) {
      const message = isFirebaseError(err) ? firebaseError(err) : "An error occurred while deleting the product";
      toast.error(message);
    } finally {
      setIsDeletingProduct(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full pl-8"
            />
          </div>
          <Button variant="outline" size="icon" onClick={refreshProducts} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        <Button onClick={() => setIsAddProductOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
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
                      <Skeleton className="h-10 w-10 rounded-md" />
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
                  No products found.
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
            <Select value={`${pageSize}`} onValueChange={handlePageSizeChange}>
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
            Page {page + 1} of {Math.max(1, Math.ceil(table.getFilteredRowModel().rows.length / pageSize))}
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
              onClick={() =>
                handlePageChange(Math.min(Math.ceil(table.getFilteredRowModel().rows.length / pageSize) - 1, page + 1))
              }
              disabled={page >= Math.ceil(table.getFilteredRowModel().rows.length / pageSize) - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Product Dialog */}
      <ProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        onSuccess={() => {
          refreshProducts();
          setIsAddProductOpen(false);
        }}
      />

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={open => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the product &quot;{productToDelete?.name}&quot;. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingProduct}>
              {isDeletingProduct ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
