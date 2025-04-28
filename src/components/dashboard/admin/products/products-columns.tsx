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
      header: () => <div className="text-xs text-muted-foreground font-medium">Image</div>,
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
      header: () => <div className="text-xs text-muted-foreground font-medium">Name</div>,
      cell: ({ row }) => <div className="font-medium whitespace-nowrap">{row.getValue("name")}</div>
    },
    {
      accessorKey: "price",
      header: () => <div className="text-xs text-muted-foreground font-medium text-center">Price</div>,
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD"
        }).format(price);
        return <div className="text-center whitespace-nowrap">{formatted}</div>;
      }
    },
    {
      accessorKey: "inStock",
      header: () => <div className="text-xs text-muted-foreground font-medium text-center">Status</div>,
      cell: ({ row }) => {
        const inStock = row.getValue("inStock") as boolean;
        return (
          <div className="text-center">
            <Badge variant={inStock ? "default" : "destructive"}>{inStock ? "In Stock" : "Out of Stock"}</Badge>
          </div>
        );
      }
    },
    {
      accessorKey: "badge",
      header: () => <div className="text-xs text-muted-foreground font-medium text-center">Badge</div>,
      cell: ({ row }) => {
        const badge = row.getValue("badge") as string;
        return badge ? (
          <Badge variant="outline" className="text-center">
            {badge}
          </Badge>
        ) : null;
      }
    },
    {
      accessorKey: "category",
      header: () => <div className="text-xs text-muted-foreground font-medium text-center">Category</div>,
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return category ? <div className="text-center whitespace-nowrap">{category}</div> : null;
      }
    },
    {
      accessorKey: "stickySide",
      header: () => <div className="text-xs text-muted-foreground font-medium text-center">Sticky Side</div>,
      cell: ({ row }) => {
        const stickySide = row.getValue("stickySide") as string;
        return stickySide ? <div className="text-center whitespace-nowrap">{stickySide}</div> : null;
      }
    },
    {
      accessorKey: "color",
      header: () => <div className="text-xs text-muted-foreground font-medium text-center">Color</div>,
      cell: ({ row }) => {
        const color = row.getValue("color") as string;
        return color ? <div className="text-center whitespace-nowrap">{color}</div> : null;
      }
    },
    {
      accessorKey: "isFeatured",
      header: () => <div className="text-xs text-muted-foreground font-medium text-center">Featured</div>,
      cell: ({ row }) => {
        const value = row.getValue("isFeatured") as boolean;
        return (
          <div className="text-center">
            <Badge variant={value ? "default" : "outline"}>{value ? "Yes" : "No"}</Badge>
          </div>
        );
      }
    },
    {
      accessorKey: "isHero",
      header: () => <div className="text-xs text-muted-foreground font-medium text-center">Hero</div>,
      cell: ({ row }) => {
        const value = row.getValue("isHero") as boolean;
        return (
          <div className="text-center">
            <Badge variant={value ? "default" : "outline"}>{value ? "Yes" : "No"}</Badge>
          </div>
        );
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
                <Eye className="h-5 w-5" /> {/* Bigger Eye icon */}
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
