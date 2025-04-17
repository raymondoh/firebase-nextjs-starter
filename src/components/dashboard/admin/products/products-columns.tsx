import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/types/product";

type GetProductColumnsProps = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function getProductColumns({ onEdit, onDelete }: GetProductColumnsProps): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const image = row.original.image;
        return (
          <div className="relative h-10 w-10 rounded-md overflow-hidden">
            <Image
              src={image || "/placeholder.svg?height=40&width=40"}
              alt={row.original.name}
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
      accessorKey: "isFeatured",
      header: "Featured",
      cell: ({ row }) => {
        const value = row.getValue("isFeatured") as boolean;
        return <Badge variant={value ? "default" : "outline"}>{value ? "Yes" : "No"}</Badge>;
      }
    },
    {
      accessorKey: "isHero",
      header: "Hero",
      cell: ({ row }) => {
        const value = row.getValue("isHero") as boolean;
        return <Badge variant={value ? "default" : "outline"}>{value ? "Yes" : "No"}</Badge>;
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
                <Eye className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(product.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(product.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.open(`/products/${product.id}`, "_blank")}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];
}
