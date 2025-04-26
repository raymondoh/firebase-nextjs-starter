// "use client";

// import type React from "react";
// import { useState, useTransition } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { updateProduct } from "@/actions/products";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
// import { uploadFile } from "@/utils/uploadFile";
// import { SubmitButton } from "@/components/shared/SubmitButton";
// import type { Product } from "@/types/product";
// import { ArrowLeft } from "lucide-react";
// import { validateFileSize } from "@/utils/validateFileSize";

// interface UpdateProductFormProps {
//   product: Product;
// }

// export function UpdateProductForm({ product }: UpdateProductFormProps) {
//   const router = useRouter();
//   const [isPending, startTransition] = useTransition();
//   const [isUploading, setIsUploading] = useState(false);

//   const [name] = useState(product.name);
//   const [productName, setProductName] = useState(product.name);
//   const [nameError, setNameError] = useState<string | null>(null);
//   const [price, setPrice] = useState(product.price.toString());
//   const [description, setDescription] = useState(product.description || "");
//   const [badge, setBadge] = useState(product.badge || "");
//   const [inStock, setInStock] = useState(product.inStock !== false);
//   const [isFeatured, setIsFeatured] = useState(product.isFeatured === true);
//   const [isHero, setIsHero] = useState(false);
//   const [image] = useState(product.image || "");
//   const [previewUrl, setPreviewUrl] = useState<string | null>(product.image || null);
//   const [newImageFile, setNewImageFile] = useState<File | null>(null);

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const fileError = validateFileSize(file);
//     if (fileError) {
//       toast.error(fileError);
//       return;
//     }

//     setNewImageFile(file);

//     const reader = new FileReader();
//     reader.onload = e => setPreviewUrl(e.target?.result as string);
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     startTransition(async () => {
//       if (productName.trim().length < 2) {
//         setNameError("Product name must be at least 2 characters.");
//         return;
//       }

//       try {
//         let imageUrl = image;

//         if (newImageFile) {
//           setIsUploading(true);
//           imageUrl = await uploadFile(newImageFile, { prefix: "product" });
//         }

//         const result = await updateProduct(product.id, {
//           name,
//           price: Number.parseFloat(price),
//           description,
//           inStock,
//           badge,
//           isFeatured,
//           isHero,
//           image: imageUrl
//         });

//         if (result.success) {
//           toast.success("Product updated successfully!");
//           router.push("/admin/products"); // ✅ Navigate to product list
//         } else {
//           toast.error(result.error || "Failed to update product");
//         }
//       } catch (err: unknown) {
//         const message = isFirebaseError(err)
//           ? firebaseError(err)
//           : err instanceof Error
//           ? err.message
//           : "Unknown error while updating product";

//         toast.error(message);
//         console.error("Error in UpdateProductForm submission:", err);
//       } finally {
//         setIsUploading(false);
//       }
//     });
//   };

//   return (
//     <div className="container max-w-3xl mx-auto py-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Update Product</CardTitle>
//           <CardDescription>Modify product details below and click update to save changes.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="name">Product Name</Label>
//                 <Input
//                   id="name"
//                   value={productName}
//                   onChange={e => {
//                     const value = e.target.value;
//                     setProductName(value);
//                     setNameError(value.length < 2 ? "Name must be at least 2 characters" : null);
//                   }}
//                   required
//                 />
//                 {nameError && <p className="text-destructive text-sm mt-1">{nameError}</p>}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="price">Price ($)</Label>
//                 <Input
//                   id="price"
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   value={price}
//                   onChange={e => setPrice(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="badge">Badge (Optional)</Label>
//                 <Input id="badge" value={badge} onChange={e => setBadge(e.target.value)} />
//               </div>

//               <div className="flex items-center justify-between space-x-2">
//                 <Label htmlFor="inStock" className="cursor-pointer">
//                   In Stock
//                 </Label>
//                 <Switch id="inStock" checked={inStock} onCheckedChange={setInStock} />
//               </div>

//               <div className="flex items-center justify-between space-x-2">
//                 <Label htmlFor="isHero" className="cursor-pointer">
//                   Display in Hero Carousel
//                 </Label>
//                 <Switch id="isHero" checked={isHero} onCheckedChange={setIsHero} />
//               </div>

//               <div className="flex items-center justify-between space-x-2">
//                 <Label htmlFor="isFeatured" className="cursor-pointer">
//                   Feature this product
//                 </Label>
//                 <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
//               </div>

//               <div className="md:col-span-2 space-y-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   rows={4}
//                   value={description}
//                   onChange={e => setDescription(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="md:col-span-2 space-y-2">
//                 <Label htmlFor="image">Product Image</Label>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Input
//                       id="image"
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       className="cursor-pointer"
//                     />
//                     <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current image</p>
//                   </div>

//                   <div className="flex items-center justify-center border rounded-md h-[150px] bg-muted/30">
//                     {previewUrl ? (
//                       <div className="relative w-full h-full">
//                         <Image
//                           src={previewUrl || "/placeholder.svg?height=150&width=150"}
//                           alt="Preview"
//                           fill
//                           className="object-contain p-2"
//                           sizes="(max-width: 768px) 100vw, 300px"
//                         />
//                       </div>
//                     ) : (
//                       <div className="text-muted-foreground text-sm">No image available</div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <CardFooter className="justify-between p-0 pt-4">
//               <Button type="button" variant="outline" onClick={() => router.back()}>
//                 <ArrowLeft className="mr-2 h-4 w-4" /> Back
//               </Button>

//               <SubmitButton
//                 isLoading={isPending || isUploading}
//                 loadingText={isUploading ? "Uploading..." : "Saving..."}
//                 className="min-w-[140px]">
//                 Update Product
//               </SubmitButton>
//             </CardFooter>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
"use client";

import type React from "react";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateProduct } from "@/actions/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { toast } from "sonner";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { uploadFile } from "@/utils/uploadFile";
import { validateFileSize } from "@/utils/validateFileSize";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/types/product";

interface UpdateProductFormProps {
  product: Product;
}

export function UpdateProductForm({ product }: UpdateProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const [productName, setProductName] = useState(product.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [price, setPrice] = useState(product.price.toString());
  const [description, setDescription] = useState(product.description || "");
  const [badge, setBadge] = useState(product.badge || "");
  const [inStock, setInStock] = useState(product.inStock !== false);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured === true);
  const [isHero, setIsHero] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.image || null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setProductName(product.name);
    setPrice(product.price.toString());
    setDescription(product.description || "");
    setBadge(product.badge || "");
    setInStock(product.inStock !== false);
    setIsFeatured(product.isFeatured === true);
    setIsHero(false);
    setPreviewUrl(product.image || null);
    setNewImageFile(null);
    imageInputRef.current?.value && (imageInputRef.current.value = "");
    setNameError(null);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFileSize(file, 2);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setNewImageFile(file);

    const reader = new FileReader();
    reader.onload = e => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      if (productName.trim().length < 2) {
        setNameError("Product name must be at least 2 characters.");
        return;
      }

      try {
        let imageUrl = product.image || "";

        if (newImageFile) {
          setIsUploading(true);
          imageUrl = await uploadFile(newImageFile, { prefix: "product" });
        }

        const result = await updateProduct(product.id, {
          name: productName.trim(),
          price: Number.parseFloat(price),
          description,
          inStock,
          badge,
          isFeatured,
          isHero,
          image: imageUrl
        });

        if (result.success) {
          toast.success("Product updated successfully!");
          router.push("/admin/products");
        } else {
          toast.error(result.error || "Failed to update product");
        }
      } catch (err: unknown) {
        const message = isFirebaseError(err)
          ? firebaseError(err)
          : err instanceof Error
          ? err.message
          : "Unknown error while updating product";

        toast.error(message);
        console.error("Error in UpdateProductForm submission:", err);
      } finally {
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Product</CardTitle>
          <CardDescription>Modify product details below and click update to save changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={productName}
                  onChange={e => {
                    const value = e.target.value;
                    setProductName(value);
                    setNameError(value.length < 2 ? "Name must be at least 2 characters" : null);
                  }}
                  required
                />
                {nameError && <p className="text-sm text-red-600 mt-1">{nameError}</p>}
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Badge (Optional)</Label>
                <Input id="badge" value={badge} onChange={e => setBadge(e.target.value)} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="inStock" className="cursor-pointer">
                  In Stock
                </Label>
                <Switch id="inStock" checked={inStock} onCheckedChange={setInStock} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="isHero" className="cursor-pointer">
                  Display in Hero Carousel
                </Label>
                <Switch id="isHero" checked={isHero} onCheckedChange={setIsHero} />
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
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      ref={imageInputRef}
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current image</p>
                  </div>

                  <div className="flex items-center justify-center border rounded-md h-[150px] bg-muted/30">
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={previewUrl || "/placeholder.svg"}
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

            <CardFooter className="justify-between p-0 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              <SubmitButton
                isLoading={isPending || isUploading}
                loadingText={isUploading ? "Uploading..." : "Saving..."}
                className="min-w-[140px]">
                Update Product
              </SubmitButton>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
