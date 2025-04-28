// "use client";

// import type React from "react";
// import { useState, useTransition, useRef } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { updateProduct } from "@/actions/products";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { SubmitButton } from "@/components/shared/SubmitButton";
// import { toast } from "sonner";
// import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
// import { uploadFile } from "@/utils/uploadFile";
// import { ArrowLeft } from "lucide-react";
// import type { Product } from "@/types/product";
// import { validateFileSize } from "@/utils/validateFileSize";

// interface UpdateProductFormProps {
//   product: Product;
// }

// export function UpdateProductForm({ product }: UpdateProductFormProps) {
//   const router = useRouter();
//   const [isPending, startTransition] = useTransition();
//   const [isUploading, setIsUploading] = useState(false);

//   const [productName, setProductName] = useState(product.name);
//   const [nameError, setNameError] = useState<string | null>(null);
//   const [price, setPrice] = useState(product.price.toString());
//   const [description, setDescription] = useState(product.description || "");
//   const [details, setDetails] = useState(product.details || "");
//   const [dimensions, setDimensions] = useState(product.dimensions || "");
//   const [material, setMaterial] = useState(product.material || "");
//   const [color, setColor] = useState(product.color || "");
//   const [stickySide, setStickySide] = useState<"Front" | "Back" | "">(product.stickySide || "");
//   const [badge, setBadge] = useState(product.badge || "");
//   const [category, setCategory] = useState(product.category || ""); // ✅ new
//   const [inStock, setInStock] = useState(product.inStock !== false);
//   const [isFeatured, setIsFeatured] = useState(product.isFeatured === true);
//   const [isHero, setIsHero] = useState(product.isHero === true);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(product.image || null);
//   const [newImageFile, setNewImageFile] = useState<File | null>(null);

//   const imageInputRef = useRef<HTMLInputElement>(null);

//   function resetForm() {
//     setProductName(product.name);
//     setPrice(product.price.toString());
//     setDescription(product.description || "");
//     setDetails(product.details || "");
//     setDimensions(product.dimensions || "");
//     setMaterial(product.material || "");
//     setColor(product.color || "");
//     setStickySide(product.stickySide || "");
//     setBadge(product.badge || "");
//     setCategory(product.category || ""); // ✅ reset
//     setInStock(product.inStock !== false);
//     setIsFeatured(product.isFeatured === true);
//     setIsHero(product.isHero === true);
//     setPreviewUrl(product.image || null);
//     setNewImageFile(null);
//     if (imageInputRef.current) {
//       imageInputRef.current.value = "";
//     }
//     setNameError(null);
//   }

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const validationError = validateFileSize(file, 2);
//     if (validationError) {
//       toast.error(validationError);
//       return;
//     }

//     setNewImageFile(file);

//     const reader = new FileReader();
//     reader.onload = e => setPreviewUrl(e.target?.result as string);
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     startTransition(async () => {
//       if (productName.trim().length < 2) {
//         setNameError("Product name must be at least 2 characters.");
//         toast.error("Please enter a valid product name.");
//         return;
//       }

//       try {
//         let imageUrl = product.image || "";

//         if (newImageFile) {
//           setIsUploading(true);
//           imageUrl = await uploadFile(newImageFile, { prefix: "product" });
//         }

//         const result = await updateProduct(product.id, {
//           name: productName.trim(),
//           price: Number.parseFloat(price),
//           description,
//           details: details || undefined,
//           dimensions: dimensions || undefined,
//           material: material || undefined,
//           color: color || undefined,
//           stickySide: stickySide === "Front" || stickySide === "Back" ? stickySide : undefined,
//           inStock,
//           badge: badge?.trim() || undefined,
//           category: category?.trim() || undefined, // ✅ send
//           image: imageUrl,
//           isFeatured,
//           isHero
//         });

//         if (result.success) {
//           toast.success(`"${productName}" updated successfully! Redirecting...`);
//           resetForm();

//           setTimeout(() => {
//             router.push("/admin/products");
//           }, 2000);
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
//               {/* Name */}
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
//                 {nameError && <p className="text-sm text-red-600 mt-1">{nameError}</p>}
//               </div>

//               {/* Price */}
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

//               {/* Badge */}
//               <div className="space-y-2">
//                 <Label htmlFor="badge">Badge (Optional)</Label>
//                 <Input id="badge" value={badge} onChange={e => setBadge(e.target.value)} />
//               </div>

//               {/* Category */}
//               <div className="space-y-2">
//                 <Label htmlFor="category">Category</Label>
//                 <Input
//                   id="category"
//                   value={category}
//                   onChange={e => setCategory(e.target.value)}
//                   placeholder="e.g., Stickers, Apparel"
//                 />
//               </div>

//               {/* Toggles */}
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

//               {/* Description */}
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

//               {/* Details */}
//               <div className="md:col-span-2 space-y-2">
//                 <Label htmlFor="details">Details (Optional)</Label>
//                 <Textarea id="details" rows={3} value={details} onChange={e => setDetails(e.target.value)} />
//               </div>

//               {/* Other fields */}
//               <div className="space-y-2">
//                 <Label htmlFor="dimensions">Dimensions</Label>
//                 <Input id="dimensions" value={dimensions} onChange={e => setDimensions(e.target.value)} />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="material">Material</Label>
//                 <Input id="material" value={material} onChange={e => setMaterial(e.target.value)} />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="color">Color</Label>
//                 <Input id="color" value={color} onChange={e => setColor(e.target.value)} />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="stickySide">Sticky Side</Label>
//                 <select
//                   id="stickySide"
//                   value={stickySide}
//                   onChange={e => setStickySide(e.target.value as "Front" | "Back" | "")}
//                   className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
//                   <option value="">Select sticky side</option>
//                   <option value="Front">Front</option>
//                   <option value="Back">Back</option>
//                 </select>
//               </div>

//               {/* Image upload */}
//               <div className="md:col-span-2 space-y-2">
//                 <Label htmlFor="image">Product Image</Label>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Input
//                       id="image"
//                       type="file"
//                       accept="image/*"
//                       ref={imageInputRef}
//                       onChange={handleImageChange}
//                       className="cursor-pointer"
//                     />
//                     <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current image</p>
//                   </div>

//                   <div className="flex items-center justify-center border rounded-md h-[150px] bg-muted/30">
//                     {previewUrl ? (
//                       <div className="relative w-full h-full">
//                         <Image
//                           src={previewUrl}
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
//                 <ArrowLeft className="mr-2 h-4 w-4" />
//                 Back
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
  const [price, setPrice] = useState(product.price.toString());
  const [description, setDescription] = useState(product.description || "");
  const [details, setDetails] = useState(product.details || "");
  const [dimensions, setDimensions] = useState(product.dimensions || "");
  const [material, setMaterial] = useState(product.material || "");
  const [color, setColor] = useState(product.color || "");
  const [stickySide, setStickySide] = useState<"Front" | "Back" | "">(product.stickySide || "");
  const [badge, setBadge] = useState(product.badge || "");
  const [category, setCategory] = useState(product.category || "");
  const [inStock, setInStock] = useState(product.inStock !== false);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured === true);
  const [isHero, setIsHero] = useState(product.isHero === true);

  const [previewUrl, setPreviewUrl] = useState<string | null>(product.image || null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setProductName(product.name);
    setPrice(product.price.toString());
    setDescription(product.description || "");
    setDetails(product.details || "");
    setDimensions(product.dimensions || "");
    setMaterial(product.material || "");
    setColor(product.color || "");
    setStickySide(product.stickySide || "");
    setBadge(product.badge || "");
    setCategory(product.category || "");
    setInStock(product.inStock !== false);
    setIsFeatured(product.isFeatured === true);
    setIsHero(product.isHero === true);
    setPreviewUrl(product.image || null);
    setNewImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    setNameError(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
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
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (productName.trim().length < 2) {
      setNameError("Product name must be at least 2 characters.");
      toast.error("Please enter a valid product name.");
      return;
    }

    startTransition(async () => {
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
          details: details || undefined,
          dimensions: dimensions || undefined,
          material: material || undefined,
          color: color || undefined,
          stickySide: stickySide || undefined,
          badge: badge || undefined,
          category: category || undefined,
          inStock,
          isFeatured,
          isHero,
          image: imageUrl
        });

        if (result.success) {
          toast.success(`"${productName}" updated successfully! Redirecting...`);
          resetForm();
          setTimeout(() => {
            router.push("/admin/products");
          }, 2000);
        } else {
          toast.error(result.error || "Failed to update product");
        }
      } catch (error: unknown) {
        const message = isFirebaseError(error)
          ? firebaseError(error)
          : error instanceof Error
          ? error.message
          : "Unknown error while updating product";

        toast.error(message);
        console.error("[UpdateProductForm]", error);
      } finally {
        setIsUploading(false);
      }
    });
  }

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Product</CardTitle>
          <CardDescription>Modify the details below and click update to save changes.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={e => {
                    setProductName(e.target.value);
                    setNameError(e.target.value.length < 2 ? "Product name must be at least 2 characters." : null);
                  }}
                  required
                />
                {nameError && <p className="text-sm text-red-600">{nameError}</p>}
              </div>

              {/* Price */}
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

              {/* Badge */}
              <div className="space-y-2">
                <Label htmlFor="badge">Badge (Optional)</Label>
                <Input id="badge" value={badge} onChange={e => setBadge(e.target.value)} />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={category} onChange={e => setCategory(e.target.value)} />
              </div>

              {/* Switches */}
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="inStock">In Stock</Label>
                <Switch id="inStock" checked={inStock} onCheckedChange={setInStock} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="isFeatured">Featured</Label>
                <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="isHero">Hero Carousel</Label>
                <Switch id="isHero" checked={isHero} onCheckedChange={setIsHero} />
              </div>

              {/* Sticky Side */}
              <div className="space-y-2">
                <Label htmlFor="stickySide">Sticky Side</Label>
                <select
                  id="stickySide"
                  value={stickySide}
                  onChange={e => setStickySide(e.target.value as "Front" | "Back" | "")}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select sticky side</option>
                  <option value="Front">Front</option>
                  <option value="Back">Back</option>
                </select>
              </div>

              {/* Material */}
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input id="material" value={material} onChange={e => setMaterial(e.target.value)} />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input id="color" value={color} onChange={e => setColor(e.target.value)} />
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input id="dimensions" value={dimensions} onChange={e => setDimensions(e.target.value)} />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Label htmlFor="details">Details (Optional)</Label>
              <Textarea id="details" rows={3} value={details} onChange={e => setDetails(e.target.value)} />
            </div>

            {/* Image upload */}
            <div className="space-y-2">
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
                  <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current image.</p>
                </div>

                <div className="flex items-center justify-center border rounded-md h-[150px] bg-muted/30">
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <Image src={previewUrl} alt="Preview" fill className="object-contain p-2" />
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">No image available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <CardFooter className="justify-between p-0 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
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
