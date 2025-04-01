// "use client";

// import type React from "react";

// import { useState, useTransition } from "react";
// import { useRouter } from "next/navigation";
// import { updateProduct } from "@/actions/products";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { toast } from "sonner";
// import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
// import { Loader2, ArrowLeft, Save } from "lucide-react";
// import type { Product } from "@/types/product";
// import Image from "next/image";

// interface UpdateProductFormProps {
//   product: Product;
// }

// export function UpdateProductForm({ product }: UpdateProductFormProps) {
//   const router = useRouter();
//   const [isPending, startTransition] = useTransition();
//   const [isUploading, setIsUploading] = useState(false);

//   const [name, setName] = useState(product.name);
//   const [price, setPrice] = useState(product.price.toString());
//   const [description, setDescription] = useState(product.description || "");
//   const [badge, setBadge] = useState(product.badge || "");
//   const [inStock, setInStock] = useState(product.inStock !== false);
//   const [image, setImage] = useState(product.image || "");
//   const [previewUrl, setPreviewUrl] = useState<string | null>(product.image || null);
//   const [newImageFile, setNewImageFile] = useState<File | null>(null);

//   const uploadFile = async (file: File): Promise<string> => {
//     setIsUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await fetch("/api/upload", {
//         method: "POST",
//         body: formData
//       });

//       const result = await response.json();
//       if (!response.ok) throw new Error(result.error || "Upload failed");
//       return result.url;
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setNewImageFile(file);
//       const reader = new FileReader();
//       reader.onload = e => {
//         setPreviewUrl(e.target?.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     startTransition(async () => {
//       try {
//         let imageUrl = image;

//         if (newImageFile) {
//           imageUrl = await uploadFile(newImageFile);
//         }

//         const result = await updateProduct(product.id, {
//           name,
//           price: Number.parseFloat(price),
//           description,
//           inStock,
//           badge,
//           image: imageUrl
//         });

//         if (result.success) {
//           toast.success("Product updated successfully!");
//           router.refresh();
//         } else {
//           toast.error(result.error || "Failed to update product");
//         }
//       } catch (err: unknown) {
//         const message = isFirebaseError(err)
//           ? firebaseError(err)
//           : err instanceof Error
//           ? err.message
//           : "Unknown error while updating product";

//         console.error("Error in UpdateProductForm submission:", message);
//         toast.error(message);
//       }
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="space-y-2">
//           <Label htmlFor="name">Product Name</Label>
//           <Input
//             id="name"
//             value={name}
//             onChange={e => setName(e.target.value)}
//             placeholder="Enter product name"
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="price">Price ($)</Label>
//           <Input
//             id="price"
//             type="number"
//             step="0.01"
//             min="0"
//             value={price}
//             onChange={e => setPrice(e.target.value)}
//             placeholder="0.00"
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="badge">Badge (Optional)</Label>
//           <Input
//             id="badge"
//             value={badge}
//             onChange={e => setBadge(e.target.value)}
//             placeholder="New, Sale, Featured, etc."
//           />
//         </div>

//         <div className="flex items-center justify-between space-x-2">
//           <Label htmlFor="inStock" className="cursor-pointer">
//             In Stock
//           </Label>
//           <Switch id="inStock" checked={inStock} onCheckedChange={setInStock} />
//         </div>

//         <div className="md:col-span-2 space-y-2">
//           <Label htmlFor="description">Description</Label>
//           <Textarea
//             id="description"
//             rows={4}
//             value={description}
//             onChange={e => setDescription(e.target.value)}
//             placeholder="Enter product description"
//             required
//           />
//         </div>

//         <div className="md:col-span-2 space-y-2">
//           <Label htmlFor="image">Product Image</Label>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
//               <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current image</p>
//             </div>

//             <div className="flex items-center justify-center border rounded-md h-[150px] bg-muted/30">
//               {previewUrl ? (
//                 previewUrl && previewUrl.startsWith("data:") ? (
//                   // For data URLs (file preview)
//                   // eslint-disable-next-line @next/next/no-img-element
//                   <img
//                     src={previewUrl || "/placeholder.svg"}
//                     alt="Preview"
//                     className="object-contain w-full h-full p-2"
//                   />
//                 ) : (
//                   // For remote URLs (existing images)
//                   <div className="relative w-full h-full">
//                     <Image
//                       src={previewUrl || "/placeholder.svg?height=150&width=150"}
//                       alt="Preview"
//                       fill
//                       className="object-contain p-2"
//                       sizes="(max-width: 768px) 100vw, 300px"
//                     />
//                   </div>
//                 )
//               ) : (
//                 <div className="text-muted-foreground text-sm">No image available</div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-between">
//         <Button type="button" variant="outline" onClick={() => router.back()}>
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back
//         </Button>

//         <Button type="submit" disabled={isPending || isUploading} className="min-w-[120px]">
//           {isUploading ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Uploading...
//             </>
//           ) : isPending ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Saving...
//             </>
//           ) : (
//             <>
//               <Save className="mr-2 h-4 w-4" />
//               Update Product
//             </>
//           )}
//         </Button>
//       </div>
//     </form>
//   );
// }
"use client";

import type React from "react";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import type { Product } from "@/types/product";
import Image from "next/image";

interface UpdateProductFormProps {
  product: Product;
}

export function UpdateProductForm({ product }: UpdateProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [description, setDescription] = useState(product.description || "");
  const [badge, setBadge] = useState(product.badge || "");
  const [inStock, setInStock] = useState(product.inStock !== false);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured === true);
  const [image, setImage] = useState(product.image || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.image || null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      return result.url;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onload = e => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        let imageUrl = image;

        if (newImageFile) {
          imageUrl = await uploadFile(newImageFile);
        }

        const result = await updateProduct(product.id, {
          name,
          price: Number.parseFloat(price),
          description,
          inStock,
          badge,
          isFeatured,
          image: imageUrl
        });

        if (result.success) {
          toast.success("Product updated successfully!");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update product");
        }
      } catch (err: unknown) {
        const message = isFirebaseError(err)
          ? firebaseError(err)
          : err instanceof Error
          ? err.message
          : "Unknown error while updating product";

        console.error("Error in UpdateProductForm submission:", message);
        toast.error(message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="badge">Badge (Optional)</Label>
          <Input
            id="badge"
            value={badge}
            onChange={e => setBadge(e.target.value)}
            placeholder="New, Sale, Featured, etc."
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="inStock" className="cursor-pointer">
            In Stock
          </Label>
          <Switch id="inStock" checked={inStock} onCheckedChange={setInStock} />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="isFeatured" className="cursor-pointer">
            Feature this product
          </Label>
          <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter product description"
            required
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="image">Product Image</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
              <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current image</p>
            </div>

            <div className="flex items-center justify-center border rounded-md h-[150px] bg-muted/30">
              {previewUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={previewUrl || "/placeholder.svg?height=150&width=150"}
                    alt="Preview"
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No image available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button type="submit" disabled={isPending || isUploading} className="min-w-[120px]">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Update Product
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
