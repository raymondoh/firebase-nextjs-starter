// AdminProductsClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

import { ProductsDataTable } from "./ProductsDataTable";
import { getProductColumns } from "./products-columns";
import { deleteProduct } from "@/actions/products";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { Product } from "@/types/product";
import { fetchAllProductsClient } from "@/actions/client/products";

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

interface AdminProductsClientProps {
  products: Product[];
}

export function AdminProductsClient({ products: initialProducts }: AdminProductsClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditProduct = (id: string) => {
    router.push(`/admin/products/${id}`);
  };

  const handleDeleteRequest = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setProductToDelete(product);
    }
  };

  const refreshProducts = async () => {
    try {
      const result = await fetchAllProductsClient();
      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (err) {
      const message = isFirebaseError(err)
        ? firebaseError(err)
        : err instanceof Error
        ? err.message
        : "Failed to fetch products";
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteProduct(productToDelete.id);
      if (result.success) {
        toast.success("Product deleted successfully");
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    } catch (err) {
      const message = isFirebaseError(err)
        ? firebaseError(err)
        : err instanceof Error
        ? err.message
        : "An error occurred while deleting the product";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  return (
    <>
      <ProductsDataTable
        data={products}
        columns={getProductColumns({
          onEdit: handleEditProduct,
          onDelete: handleDeleteRequest
        })}
        onRefresh={refreshProducts}
      />

      <AlertDialog open={!!productToDelete} onOpenChange={open => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete <strong>{productToDelete?.name}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
