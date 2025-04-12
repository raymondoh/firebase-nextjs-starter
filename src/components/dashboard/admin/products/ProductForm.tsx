// "use client";

// import type React from "react";
// import { useState, useTransition } from "react";
// import Image from "next/image";
// import { addProduct } from "@/actions/products";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// import { toast } from "sonner";
// import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
// import { uploadFile } from "@/utils/uploadFile";
// import { SubmitButton } from "@/components/shared/SubmitButton";

// interface ProductFormProps {
//   onSuccess?: () => void;
// }

// export function ProductForm({ onSuccess }: ProductFormProps) {
//   const [isPending, startTransition] = useTransition();
//   const [isUploading, setIsUploading] = useState(false);
//   const [inStock, setInStock] = useState(true);
//   const [isFeatured, setIsFeatured] = useState(false);
//   const [isHero, setIsHero] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = e => setPreviewUrl(e.target?.result as string);
//       reader.readAsDataURL(file);
//     } else {
//       setPreviewUrl(null);
//     }
//   };

//   const handleSubmit = (formData: FormData) => {
//     startTransition(async () => {
//       try {
//         const file = formData.get("image") as File;
//         let imageUrl = "";

//         if (file && file.size > 0) {
//           if (file.size > 2 * 1024 * 1024) {
//             throw new Error("Image too large. Please upload a file under 2MB.");
//           }
//           imageUrl = await uploadFile(file, { prefix: "product" });
//         }

//         const result = await addProduct({
//           name: formData.get("name") as string,
//           price: Number.parseFloat(formData.get("price") as string),
//           description: formData.get("description") as string,
//           inStock,
//           badge: formData.get("badge") as string,
//           image: imageUrl,
//           isFeatured,
//           isHero
//         });

//         if (result.success) {
//           toast.success("Product added successfully!");
//           onSuccess?.();
//           const form = document.getElementById("product-form") as HTMLFormElement;
//           if (form) {
//             form.reset();
//             setPreviewUrl(null);
//             setInStock(true);
//             setIsFeatured(false);
//             setIsHero(false);
//           }
//         } else {
//           toast.error(result.error);
//         }
//       } catch (err: unknown) {
//         const message =
//           err instanceof Error && err.message.includes("Image too large")
//             ? err.message
//             : isFirebaseError(err)
//             ? firebaseError(err)
//             : err instanceof Error
//             ? err.message
//             : "Unknown error while adding product";

//         toast.error(message);
//         console.error("Error in ProductForm submission:", message);
//       }
//     });
//   };

//   return (
//     <div className="container max-w-3xl mx-auto py-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Add a New Product</CardTitle>
//           <CardDescription>Fill out the form to add a new product to your store.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form id="product-form" action={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="name">Product Name</Label>
//                 <Input name="name" id="name" placeholder="Enter product name" required />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="price">Price ($)</Label>
//                 <Input name="price" id="price" type="number" step="0.01" min="0" placeholder="0.00" required />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="badge">Badge (Optional)</Label>
//                 <Input name="badge" id="badge" placeholder="New, Sale, Featured, etc." />
//               </div>

//               <div className="flex items-center justify-between space-x-2">
//                 <Label htmlFor="inStock" className="cursor-pointer">
//                   In Stock
//                 </Label>
//                 <Switch name="inStock" id="inStock" checked={inStock} onCheckedChange={setInStock} />
//               </div>

//               <div className="flex items-center justify-between space-x-2">
//                 <Label htmlFor="isHero" className="cursor-pointer">
//                   Display in Hero Carousel
//                 </Label>
//                 <Switch name="isHero" id="isHero" checked={isHero} onCheckedChange={setIsHero} />
//               </div>

//               <div className="flex items-center justify-between space-x-2">
//                 <Label htmlFor="isFeatured" className="cursor-pointer">
//                   Feature this product
//                 </Label>
//                 <Switch name="isFeatured" id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
//               </div>

//               <div className="md:col-span-2 space-y-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   name="description"
//                   id="description"
//                   rows={4}
//                   placeholder="Enter product description"
//                   required
//                 />
//               </div>

//               <div className="md:col-span-2 space-y-2">
//                 <Label htmlFor="image">Product Image</Label>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Input
//                       name="image"
//                       id="image"
//                       type="file"
//                       accept="image/*"
//                       required
//                       onChange={handleImageChange}
//                       className="cursor-pointer"
//                     />
//                     <p className="text-xs text-muted-foreground mt-1">Recommended size: 800x800px, max 2MB</p>
//                   </div>

//                   <div className="flex items-center justify-center border rounded-md h-[150px] bg-muted/30">
//                     {previewUrl ? (
//                       <div className="relative w-full h-full">
//                         <Image
//                           src={previewUrl || "/placeholder.svg"}
//                           alt="Preview"
//                           fill
//                           className="object-contain p-2"
//                           sizes="100vw"
//                         />
//                       </div>
//                     ) : (
//                       <div className="text-muted-foreground text-sm">Image preview will appear here</div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <CardFooter className="justify-end p-0 pt-4">
//               <SubmitButton
//                 isLoading={isPending || isUploading}
//                 loadingText={isUploading ? "Uploading..." : "Saving..."}
//                 className="min-w-[140px]">
//                 Add Product
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
import { useState, useTransition } from "react";
import Image from "next/image";
import { addProduct } from "@/actions/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { uploadFile } from "@/utils/uploadFile";
import { SubmitButton } from "@/components/shared/SubmitButton";

interface ProductFormProps {
  onSuccess?: () => void;
}

export function ProductForm({ onSuccess }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isHero, setIsHero] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        const file = formData.get("image") as File;
        let imageUrl = "";

        if (file && file.size > 0) {
          if (file.size > 2 * 1024 * 1024) {
            throw new Error("Image too large. Please upload a file under 2MB.");
          }

          setIsUploading(true);
          imageUrl = await uploadFile(file, { prefix: "product" });
        }

        const result = await addProduct({
          name: formData.get("name") as string,
          price: Number.parseFloat(formData.get("price") as string),
          description: formData.get("description") as string,
          inStock,
          badge: formData.get("badge") as string,
          image: imageUrl,
          isFeatured,
          isHero
        });

        if (result.success) {
          toast.success("Product added successfully!");
          onSuccess?.();

          const form = document.getElementById("product-form") as HTMLFormElement;
          if (form) {
            form.reset();
            setPreviewUrl(null);
            setInStock(true);
            setIsFeatured(false);
            setIsHero(false);
          }
        } else {
          toast.error(result.error || "Failed to add product");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error && err.message.includes("Image too large")
            ? err.message
            : isFirebaseError(err)
            ? firebaseError(err)
            : err instanceof Error
            ? err.message
            : "Unknown error while adding product";

        toast.error(message);
        console.error("Error in ProductForm submission:", err);
      } finally {
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Add a New Product</CardTitle>
          <CardDescription>Fill out the form to add a new product to your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="product-form" action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input name="name" id="name" placeholder="Enter product name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input name="price" id="price" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Badge (Optional)</Label>
                <Input name="badge" id="badge" placeholder="New, Sale, Featured, etc." />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="inStock" className="cursor-pointer">
                  In Stock
                </Label>
                <Switch name="inStock" id="inStock" checked={inStock} onCheckedChange={setInStock} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="isHero" className="cursor-pointer">
                  Display in Hero Carousel
                </Label>
                <Switch name="isHero" id="isHero" checked={isHero} onCheckedChange={setIsHero} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Feature this product
                </Label>
                <Switch name="isFeatured" id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  name="description"
                  id="description"
                  rows={4}
                  placeholder="Enter product description"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      name="image"
                      id="image"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Recommended size: 800x800px, max 2MB</p>
                  </div>

                  <div className="flex items-center justify-center border rounded-md h-[150px] bg-muted/30">
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={previewUrl || "/placeholder.svg"}
                          alt="Preview"
                          fill
                          className="object-contain p-2"
                          sizes="100vw"
                        />
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm">Image preview will appear here</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <CardFooter className="justify-end p-0 pt-4">
              <SubmitButton
                isLoading={isPending || isUploading}
                loadingText={isUploading ? "Uploading..." : "Saving..."}
                className="min-w-[140px]">
                Add Product
              </SubmitButton>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
